package com.example.Task_Manager_api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import javax.sql.DataSource;
import java.sql.Connection;

@RestController
public class DatabaseCheckController {
    @Autowired
    private DataSource dataSource;

    @GetMapping("/check-db-connection")
    public String checkDatabaseConnection() {
        try (Connection connection = dataSource.getConnection()) {
            return "Connected to: " + connection.getCatalog();
        } catch (Exception e) {
            return "Connection failed: " + e.getMessage();
        }
    }
}