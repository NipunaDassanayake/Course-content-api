package com.silverline.task.coursecontent.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.silverline.task.coursecontent.model.AuthProvider;
import com.silverline.task.coursecontent.model.User;
import com.silverline.task.coursecontent.repository.UserRepository;
import com.silverline.task.coursecontent.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Value("${google.client.id}")
    private String clientId;

    public String authenticateGoogleUser(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String pictureUrl = (String) payload.get("picture");
                String name = (String) payload.get("name"); // ✅ Extract Name

                // Check if user exists, if not create one
                User user = userRepository.findByEmail(email).orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    // Set a dummy random password for Google users
                    newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                    newUser.setRole("USER");
                    newUser.setAuthProvider(AuthProvider.GOOGLE);
                    newUser.setProfilePicture(pictureUrl);
                    newUser.setName(name); // ✅ Save Name for new users
                    return userRepository.save(newUser);
                });

                boolean userUpdated = false;

                // ✅ Update AuthProvider if missing
                if (user.getAuthProvider() == null) {
                    user.setAuthProvider(AuthProvider.GOOGLE);
                    userUpdated = true;
                }

                // ✅ Update Profile Picture if missing or changed
                if (pictureUrl != null && !pictureUrl.equals(user.getProfilePicture())) {
                    user.setProfilePicture(pictureUrl);
                    userUpdated = true;
                }

                // ✅ Update Name if missing (e.g. for existing users)
                if (name != null && user.getName() == null) {
                    user.setName(name);
                    userUpdated = true;
                }

                if (userUpdated) {
                    userRepository.save(user);
                }

                // Generate YOUR App's JWT
                return jwtService.generateToken(user);
            } else {
                throw new RuntimeException("Invalid ID token.");
            }
        } catch (GeneralSecurityException | IOException e) {
            throw new RuntimeException("Failed to verify Google token", e);
        }
    }
}