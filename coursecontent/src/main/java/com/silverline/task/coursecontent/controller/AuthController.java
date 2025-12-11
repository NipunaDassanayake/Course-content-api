package com.silverline.task.coursecontent.controller;

import com.silverline.task.coursecontent.controller.dto.request.AuthRequest;
import com.silverline.task.coursecontent.controller.dto.request.RegisterRequest;
import com.silverline.task.coursecontent.controller.dto.response.AuthResponse;
import com.silverline.task.coursecontent.model.AuthProvider;
import com.silverline.task.coursecontent.model.User;
import com.silverline.task.coursecontent.repository.UserRepository;
import com.silverline.task.coursecontent.security.JwtService;
import com.silverline.task.coursecontent.service.GoogleAuthService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final GoogleAuthService googleAuthService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");

        // Set AuthProvider to LOCAL
        user.setAuthProvider(AuthProvider.LOCAL);

        userRepository.save(user);
        String token = jwtService.generateToken(user);

        // ✅ Pass null or user.getProfilePicture() (which is likely null for local registration)
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getProfilePicture()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtService.generateToken(user);

        // ✅ Return stored profile picture
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getProfilePicture()));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody TokenRequest request) {
        String token = googleAuthService.authenticateGoogleUser(request.getToken());

        // ✅ Extract email from token to fetch the user and get their picture
        String email = jwtService.extractUsername(token);
        User user = userRepository.findByEmail(email).orElseThrow();

        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getProfilePicture()));
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TokenRequest {
        private String token;
    }
}