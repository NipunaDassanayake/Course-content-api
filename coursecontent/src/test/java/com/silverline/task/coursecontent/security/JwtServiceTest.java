package com.silverline.task.coursecontent.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.security.Key;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    // A fake 256-bit secret key for testing
    private final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Manually inject the secret key value (since we aren't loading Spring context)
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L); // 1 day
    }

    @Test
    void generateToken_CreatesValidToken() {
        // Arrange
        UserDetails user = new User("test@example.com", "password", Collections.emptyList());

        // Act
        String token = jwtService.generateToken(user);

        // Assert
        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void extractUsername_ReturnsCorrectUsername() {
        // Arrange
        UserDetails user = new User("user@example.com", "password", Collections.emptyList());
        String token = jwtService.generateToken(user);

        // Act
        String extractedUsername = jwtService.extractUsername(token);

        // Assert
        assertEquals("user@example.com", extractedUsername);
    }

    @Test
    void isTokenValid_ReturnsTrueForValidUser() {
        // Arrange
        UserDetails user = new User("valid@example.com", "password", Collections.emptyList());
        String token = jwtService.generateToken(user);

        // Act
        boolean isValid = jwtService.isTokenValid(token, user);

        // Assert
        assertTrue(isValid);
    }

    @Test
    void isTokenValid_ReturnsFalseForWrongUser() {
        // Arrange
        UserDetails user = new User("original@example.com", "password", Collections.emptyList());
        String token = jwtService.generateToken(user);

        UserDetails wrongUser = new User("hacker@example.com", "password", Collections.emptyList());

        // Act
        boolean isValid = jwtService.isTokenValid(token, wrongUser);

        // Assert
        assertFalse(isValid);
    }

    @Test
    void isTokenValid_ReturnsFalseForExpiredToken() {
        // Arrange: Create a token that expired 1 hour ago
        UserDetails user = new User("expired@example.com", "password", Collections.emptyList());

        // Manually create an expired token to test the logic
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        Key key = Keys.hmacShaKeyFor(keyBytes);

        String expiredToken = Jwts.builder()
                .setClaims(new HashMap<>())
                .setSubject(user.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis() - 1000 * 60 * 60 * 2)) // 2 hours ago
                .setExpiration(new Date(System.currentTimeMillis() - 1000 * 60 * 60)) // Expired 1 hour ago
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        // Act & Assert
        // This usually throws an Exception in JwtService, so we assert that it fails validation or throws
        assertThrows(Exception.class, () -> jwtService.isTokenValid(expiredToken, user));
    }
}