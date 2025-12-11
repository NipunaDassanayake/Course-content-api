package com.silverline.task.coursecontent.service.impl;

import com.silverline.task.coursecontent.controller.dto.response.CourseContentResponseDTO;
import com.silverline.task.coursecontent.controller.dto.response.SummaryResponseDTO;
import com.silverline.task.coursecontent.controller.dto.response.UploadResponseDTO;
import com.silverline.task.coursecontent.exceptions.FileStorageException;
import com.silverline.task.coursecontent.exceptions.ResourceNotFoundException;
import com.silverline.task.coursecontent.model.CourseContent;
import com.silverline.task.coursecontent.model.User;
import com.silverline.task.coursecontent.repository.CourseContentRepository;
import com.silverline.task.coursecontent.repository.UserRepository;
import com.silverline.task.coursecontent.service.AiSummarizationService;
import com.silverline.task.coursecontent.service.CourseContentService;
import com.silverline.task.coursecontent.service.FileStorageService;
import com.silverline.task.coursecontent.service.FileTextExtractor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CourseContentServiceImpl implements CourseContentService {

    private static final Logger log = LoggerFactory.getLogger(CourseContentServiceImpl.class);

    private static final List<String> ALLOWED_TYPES =
            List.of("application/pdf", "video/mp4", "image/jpeg", "image/png");

    private static final long MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

    private final CourseContentRepository repository;
    private final FileStorageService fileStorageService;
    private final FileTextExtractor fileTextExtractor;
    private final AiSummarizationService aiSummarizationService;
    private final UserRepository userRepository;

    public CourseContentServiceImpl(CourseContentRepository repository,
                                    FileStorageService fileStorageService,
                                    FileTextExtractor fileTextExtractor,
                                    AiSummarizationService aiSummarizationService,
                                    UserRepository userRepository) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
        this.fileTextExtractor = fileTextExtractor;
        this.aiSummarizationService = aiSummarizationService;
        this.userRepository = userRepository;

        log.debug("CourseContentServiceImpl initialized with repositories");
    }

    @Override
    public UploadResponseDTO uploadFile(MultipartFile file, String description, String baseDownloadUrl, String userEmail) {
        log.info("Starting file upload process. File name: {}, User: {}, Size: {} bytes",
                file.getOriginalFilename(), userEmail, file.getSize());

        if (file.isEmpty()) {
            throw new FileStorageException("File is empty");
        }

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new FileStorageException("Invalid file type");
        }

        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new FileStorageException("File is too large");
        }

        try {
            // 🔹 Upload to S3
            String key = fileStorageService.storeFile(file);
            log.debug("File stored successfully in S3 with key: {}", key);

            // ✅ Find the User
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

            CourseContent entity = new CourseContent();
            entity.setFileName(file.getOriginalFilename());
            entity.setDescription(description); // ✅ Save Description
            entity.setFileType(file.getContentType());
            entity.setFileSize(file.getSize());
            entity.setUploadDate(LocalDateTime.now());
            entity.setFileUrl(key); // S3 key
            entity.setUser(user);   // Set the user relation

            CourseContent saved = repository.save(entity);
            log.info("CourseContent entity saved with ID: {}", saved.getId());

            UploadResponseDTO dto = new UploadResponseDTO();
            dto.setId(saved.getId());
            dto.setFileName(saved.getFileName());
            dto.setFileType(saved.getFileType());
            dto.setFileSize(saved.getFileSize());
            dto.setDownloadUrl(baseDownloadUrl + "/api/content/" + saved.getId() + "/download");

            return dto;
        } catch (Exception e) {
            log.error("Error occurred while uploading file: {}. Error: {}", file.getOriginalFilename(), e.getMessage());
            throw new FileStorageException("Error uploading file: " + e.getMessage());
        }
    }

    // ✅ NEW METHOD: Add Online Link
    @Override
    public UploadResponseDTO addLink(String url, String description, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CourseContent entity = new CourseContent();
        entity.setFileName(url); // For links, the URL is the "filename"
        entity.setDescription(description);
        entity.setUploadDate(LocalDateTime.now());
        entity.setFileUrl(url); // Store the direct URL
        entity.setUser(user);
        entity.setFileSize(0L); // Links have no file size

        // Simple detection for YouTube or generic link
        if (url.contains("youtube.com") || url.contains("youtu.be")) {
            entity.setFileType("video/youtube");
        } else {
            entity.setFileType("resource/link");
        }

        CourseContent saved = repository.save(entity);

        UploadResponseDTO dto = new UploadResponseDTO();
        dto.setId(saved.getId());
        dto.setFileName(saved.getFileName());
        dto.setFileType(saved.getFileType());
        dto.setDownloadUrl(url); // Direct link for download URL

        return dto;
    }

    @Override
    public List<CourseContentResponseDTO> getAllContents() {
        return repository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public CourseContentResponseDTO getContent(Long id) {
        CourseContent content = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id " + id));
        return toDto(content);
    }

    @Override
    public byte[] getFileData(Long id) {
        CourseContent content = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id " + id));

        // If it's a link, we can't download it as a byte array
        if (content.getFileUrl().startsWith("http")) {
            throw new FileStorageException("Cannot download external link as file");
        }

        return fileStorageService.readFile(content.getFileUrl());
    }

    private CourseContentResponseDTO toDto(CourseContent entity) {
        CourseContentResponseDTO dto = new CourseContentResponseDTO();
        dto.setId(entity.getId());
        dto.setFileName(entity.getFileName());
        dto.setDescription(entity.getDescription());
        dto.setFileType(entity.getFileType());
        dto.setFileSize(entity.getFileSize());
        dto.setUploadDate(entity.getUploadDate());

        // ✅ CRITICAL FIX: Check if it's an S3 key or an External URL
        if (entity.getFileUrl().startsWith("http")) {
            dto.setFileUrl(entity.getFileUrl()); // Return as-is
        } else {
            dto.setFileUrl(fileStorageService.getPublicUrl(entity.getFileUrl())); // Generate S3 URL
        }

        // Map Likes & Comments Counts
        dto.setLikeCount(entity.getLikes().size());
        dto.setCommentCount(entity.getComments().size());

        if (entity.getUser() != null) {
            String displayName = (entity.getUser().getName() != null && !entity.getUser().getName().isEmpty())
                    ? entity.getUser().getName()
                    : entity.getUser().getEmail();

            dto.setUploadedBy(displayName);
            dto.setUploaderImage(entity.getUser().getProfilePicture());
        } else {
            dto.setUploadedBy("Anonymous");
            dto.setUploaderImage(null);
        }

        return dto;
    }

    @Override
    public void deleteContent(Long id) {
        // Internal method usually not called directly from controller now
        // But kept for safety
        deleteContent(id, null);
    }

    @Override
    public void deleteContent(Long id, String userEmail) {
        CourseContent content = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));

        // ✅ SECURITY CHECK (skip if userEmail is null, e.g. admin deletion)
        if (userEmail != null && !content.getUser().getEmail().equals(userEmail)) {
            log.warn("User {} tried to delete content {} owned by {}", userEmail, id, content.getUser().getEmail());
            throw new RuntimeException("Unauthorized: You do not own this content");
        }

        String storedRef = content.getFileUrl();

        // Only delete from S3 if it's NOT an external link
        try {
            if (storedRef != null && !storedRef.isBlank() && !storedRef.startsWith("http")) {
                fileStorageService.deleteFile(storedRef);
            }
        } catch (Exception ex) {
            log.error("Failed to delete file from S3.", ex);
        }

        // Cascade delete handles comments/likes/notifications automatically
        repository.delete(content);
        log.info("Deleted CourseContent entity with id={}", id);
    }

    @Override
    public SummaryResponseDTO generateAndSaveSummary(Long contentId) {
        CourseContent content = repository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + contentId));

        // Skip summary for links
        if (content.getFileUrl().startsWith("http")) {
            throw new FileStorageException("Cannot summarize external links yet.");
        }

        byte[] fileBytes = fileStorageService.readFile(content.getFileUrl());

        String text = fileTextExtractor.extractText(
                fileBytes,
                content.getFileType(),
                content.getFileName()
        );

        String summary = aiSummarizationService.generateSummary(text);
        String keyPoints = aiSummarizationService.generateKeyPoints(text);

        content.setSummary(summary);
        content.setKeyPoints(keyPoints);
        repository.save(content);

        return new SummaryResponseDTO(content.getId(), summary, keyPoints);
    }

    @Override
    public CourseContent getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found: " + id));
    }

    @Override
    public List<CourseContentResponseDTO> getMyContents(String userEmail) {
        log.debug("Fetching contents for user: {}", userEmail);
        return repository.findAllByUserEmail(userEmail)
                .stream()
                .map(this::toDto)
                .toList();
    }
}