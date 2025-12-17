package com.silverline.task.coursecontent.service;

import com.silverline.task.coursecontent.controller.dto.response.CourseContentResponseDTO;
import com.silverline.task.coursecontent.controller.dto.response.SummaryResponseDTO;
import com.silverline.task.coursecontent.controller.dto.response.UploadResponseDTO;
import com.silverline.task.coursecontent.model.CourseContent;
import org.springframework.data.domain.Page; // ✅ Import Page
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CourseContentService {

    // ✅ CHANGED: Return Page<> instead of List<>
    // We pass page number and size (how many items per page)
    Page<CourseContentResponseDTO> getAllContent(int page, int size);

    List<CourseContentResponseDTO> getMyContents(String userEmail);

    UploadResponseDTO uploadFile(MultipartFile file, String description, String baseDownloadUrl, String userEmail);

    UploadResponseDTO addLink(String url, String description, String userEmail);

    CourseContentResponseDTO getContent(Long id);

    byte[] getFileData(Long id);

    void deleteContent(Long id, String userEmail);
    void deleteContent(Long id);

    SummaryResponseDTO generateAndSaveSummary(Long contentId);

    CourseContent getById(Long id);
}