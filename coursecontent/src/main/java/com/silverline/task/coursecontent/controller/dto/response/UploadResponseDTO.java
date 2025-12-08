package com.silverline.task.coursecontent.controller.dto.response;

import lombok.Data;

@Data
public class UploadResponseDTO {

    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String downloadUrl;


}