package com.silverline.task.coursecontent.service;

import com.silverline.task.coursecontent.controller.dto.response.CourseContentResponseDTO;
import com.silverline.task.coursecontent.controller.dto.response.SummaryResponseDTO;
import com.silverline.task.coursecontent.controller.dto.response.UploadResponseDTO;
import com.silverline.task.coursecontent.model.CourseContent;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CourseContentService {

    UploadResponseDTO uploadFile(MultipartFile file, String baseDownloadUrl);
    List<CourseContentResponseDTO> getAllContents();
    CourseContentResponseDTO getContent(Long id);
    byte[] getFileData(Long id);
    void deleteContent(Long id);
    SummaryResponseDTO generateAndSaveSummary(Long contentId);
    CourseContent getById(Long id);

}