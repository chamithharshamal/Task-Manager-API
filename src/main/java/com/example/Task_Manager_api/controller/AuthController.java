package com.example.Task_Manager_api.controller;

import com.example.Task_Manager_api.model.User;
import com.example.Task_Manager_api.payload.AuthRequest;
import com.example.Task_Manager_api.payload.AuthResponse;
import com.example.Task_Manager_api.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            authService.register(user);
            return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            String token = authService.authenticate(request);
            return ResponseEntity.ok(new AuthResponse(token));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        // On frontend: just delete token from localStorage/sessionStorage
        return ResponseEntity.ok("Logged out successfully.");
    }
}
