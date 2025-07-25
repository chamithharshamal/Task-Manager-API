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

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public String authenticate(AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication); // Optional for JWT
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found after authentication"));
            return jwtTokenProvider.generateToken(user.getUsername(), user.getRoles());
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid username or password", e);
        } catch (UsernameNotFoundException e) {
            throw new RuntimeException("User not found", e);
        }
    }
    public void register(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }
}
