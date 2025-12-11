package com.silverline.task.coursecontent.service.impl;

import com.silverline.task.coursecontent.exceptions.ResourceNotFoundException;
import com.silverline.task.coursecontent.model.User;
import com.silverline.task.coursecontent.repository.UserRepository;
import com.silverline.task.coursecontent.service.FileStorageService;
import com.silverline.task.coursecontent.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Override
    public String updateProfilePicture(String email, MultipartFile file) {
        // 1. Check if user exists
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        // 2. Upload file to S3 (or local storage)
        String fileKey = fileStorageService.storeFile(file);

        // 3. Get Public URL
        String publicUrl = fileStorageService.getPublicUrl(fileKey);

        // 4. Update User Entity
        user.setProfilePicture(publicUrl);
        userRepository.save(user);

        return publicUrl;
    }
}