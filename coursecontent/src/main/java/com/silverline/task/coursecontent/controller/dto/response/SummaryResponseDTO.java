package com.silverline.task.coursecontent.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SummaryResponseDTO {

    private Long contentId;
    private String summary;
    private String keyPoints;
}
