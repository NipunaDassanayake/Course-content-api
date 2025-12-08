package com.silverline.task.coursecontent.service.impl;

import com.silverline.task.coursecontent.controller.dto.response.CourseContentResponseDTO;
import com.silverline.task.coursecontent.controller.dto.response.SummaryResponseDTO;
import com.silverline.task.coursecontent.controller.dto.response.UploadResponseDTO;
import com.silverline.task.coursecontent.exceptions.FileStorageException;
import com.silverline.task.coursecontent.exceptions.ResourceNotFoundException;
import com.silverline.task.coursecontent.model.CourseContent;
import com.silverline.task.coursecontent.repository.CourseContentRepository;
import com.silverline.task.coursecontent.service.AiSummarizationService;
import com.silverline.task.coursecontent.service.CourseContentService;
import com.silverline.task.coursecontent.service.FileStorageService;
import com.silverline.task.coursecontent.service.FileTextExtractor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
    private  final FileTextExtractor fileTextExtractor;
    private final AiSummarizationService aiSummarizationService;

    public CourseContentServiceImpl(CourseContentRepository repository,
                                    FileStorageService fileStorageService , FileTextExtractor fileTextExtractor,
                                    AiSummarizationService aiSummarizationService) {
        this.repository = repository;
        this.fileStorageService = fileStorageService;
        this.fileTextExtractor = fileTextExtractor;
        this.aiSummarizationService = aiSummarizationService;

        log.debug("CourseContentServiceImpl initialized with repository: {} and fileStorageService: {}",
                repository.getClass().getSimpleName(),
                fileStorageService.getClass().getSimpleName());
    }

    @Override
    public UploadResponseDTO uploadFile(MultipartFile file, String baseDownloadUrl) {
        log.info("Starting file upload process. File name: {}, Content type: {}, Size: {} bytes, Base URL: {}",
                file.getOriginalFilename(), file.getContentType(), file.getSize(), baseDownloadUrl);

        if (file.isEmpty()) {
            log.error("File upload failed - file is empty. File name: {}", file.getOriginalFilename());
            throw new FileStorageException("File is empty");
        }

        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            log.error("File upload failed - invalid file type. File name: {}, Content type: {}",
                    file.getOriginalFilename(), file.getContentType());
            throw new FileStorageException("Invalid file type");
        }

        if (file.getSize() > MAX_SIZE_BYTES) {
            log.error("File upload failed - file too large. File name: {}, Size: {} bytes, Max allowed: {} bytes",
                    file.getOriginalFilename(), file.getSize(), MAX_SIZE_BYTES);
            throw new FileStorageException("File is too large");
        }

        try {
            String storedPath = fileStorageService.storeFile(file);
            log.debug("File stored successfully at path: {}", storedPath);

            CourseContent entity = new CourseContent();
            entity.setFileName(file.getOriginalFilename());
            entity.setFileType(file.getContentType());
            entity.setFileSize(file.getSize());
            entity.setUploadDate(LocalDateTime.now());
            entity.setFileUrl(storedPath);

            CourseContent saved = repository.save(entity);
            log.info("CourseContent entity saved with ID: {}", saved.getId());

            UploadResponseDTO dto = new UploadResponseDTO();
            dto.setId(saved.getId());
            dto.setFileName(saved.getFileName());
            dto.setFileType(saved.getFileType());
            dto.setFileSize(saved.getFileSize());
            dto.setDownloadUrl(baseDownloadUrl + "/api/content/" + saved.getId() + "/download");

            log.info("File upload completed successfully. File ID: {}, File name: {}",
                    dto.getId(), dto.getFileName());

            return dto;
        } catch (Exception e) {
            log.error("Error occurred while uploading file with name: {}. Error: {}",
                    file.getOriginalFilename(), e.getMessage(), e);
            // Pass only the message if FileStorageException doesn't accept cause
            throw new FileStorageException("Error uploading file: " + e.getMessage());
        }
    }

    @Override
    public List<CourseContentResponseDTO> getAllContents() {
        log.debug("Fetching all course contents");

        long startTime = System.currentTimeMillis();
        List<CourseContentResponseDTO> contents = repository.findAll()
                .stream()
                .map(this::toDto)
                .toList();

        log.debug("Fetched {} course contents in {} ms", contents.size(), (System.currentTimeMillis() - startTime));
        return contents;
    }

    @Override
    public CourseContentResponseDTO getContent(Long id) {
        log.debug("Fetching course content with ID: {}", id);

        CourseContent content = repository.findById(id)
                .orElseThrow(() -> {
                    log.error("Course content not found with ID: {}", id);
                    return new ResourceNotFoundException("Content not found with id " + id);
                });

        log.debug("Successfully fetched course content with ID: {}", id);
        return toDto(content);
    }

    @Override
    public byte[] getFileData(Long id) {
        log.debug("Fetching file data for content ID: {}", id);

        CourseContent content = repository.findById(id)
                .orElseThrow(() -> {
                    log.error("Content not found for file download with ID: {}", id);
                    return new ResourceNotFoundException("Content not found with id " + id);
                });

        try {
            byte[] fileData = Files.readAllBytes(fileStorageService.loadFileAsPath(content.getFileUrl()));
            log.info("Successfully read file data for content ID: {}, File name: {}, Size: {} bytes",
                    id, content.getFileName(), fileData.length);
            return fileData;
        } catch (IOException e) {
            log.error("Error occurred while reading file data for content ID: {}, File path: {}. Error: {}",
                    id, content.getFileUrl(), e.getMessage(), e);
            // Pass only the message if FileStorageException doesn't accept cause
            throw new FileStorageException("Error reading file for content ID: " + id);
        }
    }

    private CourseContentResponseDTO toDto(CourseContent entity) {
        CourseContentResponseDTO dto = new CourseContentResponseDTO();
        dto.setId(entity.getId());
        dto.setFileName(entity.getFileName());
        dto.setFileType(entity.getFileType());
        dto.setFileSize(entity.getFileSize());
        dto.setUploadDate(entity.getUploadDate());
        dto.setFileUrl(entity.getFileUrl());
        return dto;
    }


    @Override
    public void deleteContent(Long id) {
        CourseContent content = repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Content not found with id: " + id));

        // If you store local file path / name, delete file from disk too
        try {
            // Assuming fileUrl or filePath stores something like "uploads/filename.ext"
            String filePathStr = content.getFileUrl(); // or getFilePath()
            if (filePathStr != null) {
                Path filePath = Paths.get(filePathStr);
                Files.deleteIfExists(filePath);
            }
        } catch (Exception ex) {
            // log and continue, so DB still gets cleaned
            ex.printStackTrace();
        }

        repository.delete(content);
    }


    @Override
    public SummaryResponseDTO generateAndSaveSummary(Long contentId) {
        CourseContent content = repository.findById(contentId)
                .orElseThrow(() -> new RuntimeException("Content not found with id: " + contentId));

        String filePath = content.getFileUrl(); // local path on disk
        String text;

        // For now: real extraction only for PDFs
        if (content.getFileType() != null &&
                content.getFileType().toLowerCase().contains("pdf")) {

            text = extractTextFromPdf(filePath);

        } else {
            // Fallback for non-PDF types
            text = "This file is of type " + content.getFileType()
                    + " with name " + content.getFileName()
                    + ". Generate a short high-level description for a student.";
        }

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
                .orElseThrow(() -> new RuntimeException("Content not found: " + id));
    }


    private String extractTextFromPdf(String filePath) {
        File file = new File(filePath);
        if (!file.exists()) {
            throw new RuntimeException("File not found: " + filePath);
        }

        try (PDDocument document = PDDocument.load(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            // avoid sending HUGE text to Gemini
            int maxChars = 8000;
            return text.length() > maxChars ? text.substring(0, maxChars) : text;
        } catch (IOException e) {
            throw new RuntimeException("Failed to read PDF content", e);
        }
    }


}