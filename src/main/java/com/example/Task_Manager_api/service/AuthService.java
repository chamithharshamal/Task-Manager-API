package com.example.Task_Manager_api.service;

import com.example.Task_Manager_api.model.User;
import com.example.Task_Manager_api.payload.AuthRequest;
import com.example.Task_Manager_api.repository.UserRepository;
import com.example.Task_Manager_api.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public com.example.Task_Manager_api.payload.AuthResponse authenticate(AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found after authentication"));

            String accessToken = jwtTokenProvider.generateToken(user.getUsername(), user.getRoles());

            // Delete old refresh token and create new one
            refreshTokenService.deleteByUserId(user.getId());
            com.example.Task_Manager_api.model.RefreshToken refreshToken = refreshTokenService
                    .createRefreshToken(user.getId());

            return new com.example.Task_Manager_api.payload.AuthResponse(accessToken, refreshToken.getToken());
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid username or password", e);
        } catch (UsernameNotFoundException e) {
            throw new RuntimeException("User not found", e);
        }
    }

    public void register(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username is already taken");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            user.setRoles(Collections.singleton("ROLE_USER"));
        } else {
            user.setRoles(
                    user.getRoles().stream()
                            .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role.toUpperCase())
                            .collect(Collectors.toSet()));
        }

        userRepository.save(user);
    }

    public java.util.Optional<com.example.Task_Manager_api.model.RefreshToken> findByRefreshToken(String token) {
        return refreshTokenService.findByToken(token);
    }

    public com.example.Task_Manager_api.model.RefreshToken verifyExpiration(
            com.example.Task_Manager_api.model.RefreshToken token) {
        return refreshTokenService.verifyExpiration(token);
    }

    public String generateAccessToken(User user) {
        return jwtTokenProvider.generateToken(user.getUsername(), user.getRoles());
    }
}
