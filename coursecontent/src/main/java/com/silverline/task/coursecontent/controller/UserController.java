package com.silverline.task.coursecontent.controller;

import com.silverline.task.coursecontent.controller.dto.request.ChangePasswordRequest;
import com.silverline.task.coursecontent.model.User;
import com.silverline.task.coursecontent.repository.UserRepository;
import com.silverline.task.coursecontent.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    @PutMapping("/password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest request,
            Principal principal // Spring Security injects the logged-in user here
    ) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));


        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Incorrect current password");
        }


        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok("Password updated successfully");
    }




    @PostMapping(value = "/profile-picture", consumes = "multipart/form-data")
    public ResponseEntity<String> updateProfilePicture(
            @RequestParam("file") MultipartFile file,
            Principal principal // ✅ Gets the logged-in user's email automatically
    ) {
        String newUrl = userService.updateProfilePicture(principal.getName(), file);
        return ResponseEntity.ok(newUrl);
    }
}