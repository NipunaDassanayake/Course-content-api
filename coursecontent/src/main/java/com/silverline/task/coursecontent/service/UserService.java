package com.silverline.task.coursecontent.service;

import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    String updateProfilePicture(String email, MultipartFile file);
}