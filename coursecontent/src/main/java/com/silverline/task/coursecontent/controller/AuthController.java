package com.silverline.task.coursecontent.controller;

import com.silverline.task.coursecontent.controller.dto.request.AuthRequest;
import com.silverline.task.coursecontent.controller.dto.request.RegisterRequest;
import com.silverline.task.coursecontent.controller.dto.response.AuthResponse;
import com.silverline.task.coursecontent.model.User;
import com.silverline.task.coursecontent.repository.UserRepository;
import com.silverline.task.coursecontent.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        // ✅ Return email in response
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtService.generateToken(user);
        // ✅ Return email in response
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail()));
    }
}



