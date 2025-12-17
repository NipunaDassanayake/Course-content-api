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
import org.springframework.data.domain.Page;        // ✅ Import
import org.springframework.data.domain.PageRequest; // ✅ Import
import org.springframework.data.domain.Pageable;    // ✅ Import
import org.springframework.data.domain.Sort;        // ✅ Import
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CourseContentServiceImpl implements CourseContentService {

    private static final Logger log = LoggerFactory.getLogger(CourseContentServiceImpl.class);

    // Limits
    private static final List<String> ALLOWED_TYPES = List.of("application/pdf", "video/mp4", "image/jpeg", "image/png");
    private static final long MAX_SIZE_BYTES = 100 * 1024 * 1024;

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
    }

    // ✅ IMPLEMENTATION: Pagination
    @Override
    @Transactional(readOnly = true)
    public Page<CourseContentResponseDTO> getAllContent(int page, int size) {
        // 1. Create Pageable object (Page number, Items per page, Sort by Date Descending)
        Pageable pageable = PageRequest.of(page, size, Sort.by("uploadDate").descending());

        // 2. Fetch Page from Repository
        Page<CourseContent> contentPage = repository.findAll(pageable);

        // 3. Convert Entity Page to DTO Page
        return contentPage.map(this::toDto);
    }

    // --- KEEP ALL OTHER METHODS THE SAME AS BEFORE ---

    @Override
    public UploadResponseDTO uploadFile(MultipartFile file, String description, String baseDownloadUrl, String userEmail) {
        // ... (Keep existing upload logic) ...
        if (file.isEmpty()) throw new FileStorageException("File is empty");
        if (!ALLOWED_TYPES.contains(file.getContentType())) throw new FileStorageException("Invalid file type");
        if (file.getSize() > MAX_SIZE_BYTES) throw new FileStorageException("File is too large");

        try {
            String key = fileStorageService.storeFile(file);
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

            CourseContent entity = new CourseContent();
            entity.setFileName(file.getOriginalFilename());
            entity.setDescription(description);
            entity.setFileType(file.getContentType());
            entity.setFileSize(file.getSize());
            entity.setUploadDate(LocalDateTime.now());
            entity.setFileUrl(key);
            entity.setUser(user);

            CourseContent saved = repository.save(entity);

            UploadResponseDTO dto = new UploadResponseDTO();
            dto.setId(saved.getId());
            dto.setFileName(saved.getFileName());
            dto.setFileType(saved.getFileType());
            dto.setFileSize(saved.getFileSize());
            dto.setDownloadUrl(baseDownloadUrl + "/api/content/" + saved.getId() + "/download");
            return dto;
        } catch (Exception e) {
            throw new FileStorageException("Error uploading file: " + e.getMessage());
        }
    }

    @Override
    public UploadResponseDTO addLink(String url, String description, String userEmail) {
        // ... (Keep existing link logic) ...
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        CourseContent entity = new CourseContent();
        entity.setFileName(url);
        entity.setDescription(description);
        entity.setUploadDate(LocalDateTime.now());
        entity.setFileUrl(url);
        entity.setUser(user);
        entity.setFileSize(0L);

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
        dto.setDownloadUrl(url);
        return dto;
    }

    @Override
    public List<CourseContentResponseDTO> getMyContents(String userEmail) {
        return repository.findAllByUserEmail(userEmail).stream().map(this::toDto).toList();
    }

    @Override
    public CourseContentResponseDTO getContent(Long id) {
        CourseContent content = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Content not found: " + id));
        return toDto(content);
    }

    @Override
    public byte[] getFileData(Long id) {
        CourseContent content = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Content not found: " + id));
        if (content.getFileUrl().startsWith("http")) throw new FileStorageException("Cannot download external link");
        return fileStorageService.readFile(content.getFileUrl());
    }

    @Override
    public void deleteContent(Long id, String userEmail) {
        CourseContent content = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Content not found: " + id));
        if (userEmail != null && !content.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        try {
            String storedRef = content.getFileUrl();
            if (storedRef != null && !storedRef.isBlank() && !storedRef.startsWith("http")) {
                fileStorageService.deleteFile(storedRef);
            }
        } catch (Exception ex) {
            log.error("Failed to delete S3 file", ex);
        }
        repository.delete(content);
    }

    @Override
    public void deleteContent(Long id) {
        deleteContent(id, null);
    }

    @Override
    public SummaryResponseDTO generateAndSaveSummary(Long contentId) {
        CourseContent content = repository.findById(contentId).orElseThrow(() -> new ResourceNotFoundException("Content not found: " + contentId));
        if (content.getFileUrl().startsWith("http")) throw new FileStorageException("Cannot summarize links");

        byte[] bytes = fileStorageService.readFile(content.getFileUrl());
        String text = fileTextExtractor.extractText(bytes, content.getFileType(), content.getFileName());
        String summary = aiSummarizationService.generateSummary(text);
        String points = aiSummarizationService.generateKeyPoints(text);

        content.setSummary(summary);
        content.setKeyPoints(points);
        repository.save(content);

        return new SummaryResponseDTO(content.getId(), summary, points);
    }

    @Override
    public CourseContent getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Content not found"));
    }

    // Helper to convert Entity to DTO
    private CourseContentResponseDTO toDto(CourseContent entity) {
        CourseContentResponseDTO dto = new CourseContentResponseDTO();
        dto.setId(entity.getId());
        dto.setFileName(entity.getFileName());
        dto.setDescription(entity.getDescription());
        dto.setFileType(entity.getFileType());
        dto.setFileSize(entity.getFileSize());
        dto.setUploadDate(entity.getUploadDate());

        if (entity.getFileUrl().startsWith("http")) {
            dto.setFileUrl(entity.getFileUrl());
        } else {
            dto.setFileUrl(fileStorageService.getPublicUrl(entity.getFileUrl()));
        }

        dto.setLikeCount(entity.getLikes().size());
        dto.setCommentCount(entity.getComments().size());

        if (entity.getUser() != null) {
            String name = (entity.getUser().getName() != null) ? entity.getUser().getName() : entity.getUser().getEmail();
            dto.setUploadedBy(name);
            dto.setUploaderImage(entity.getUser().getProfilePicture());
        } else {
            dto.setUploadedBy("Anonymous");
        }
        return dto;
    }
}