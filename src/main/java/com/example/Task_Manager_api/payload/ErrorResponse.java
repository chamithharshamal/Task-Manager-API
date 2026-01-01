package com.example.Task_Manager_api.payload;

import java.time.LocalDateTime;
import java.util.Map;

public class ErrorResponse {
    private LocalDateTime timestamp;
    private String message;
    private String details;
    private Map<String, String> validationErrors;

    public ErrorResponse(LocalDateTime timestamp, String message, String details) {
        this.timestamp = timestamp;
        this.message = message;
        this.details = details;
    }

    public ErrorResponse(LocalDateTime timestamp, String message, String details,
            Map<String, String> validationErrors) {
        this.timestamp = timestamp;
        this.message = message;
        this.details = details;
        this.validationErrors = validationErrors;
    }

    // Getters
    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getMessage() {
        return message;
    }

    public String getDetails() {
        return details;
    }

    public Map<String, String> getValidationErrors() {
        return validationErrors;
    }
}
