package com.example.Task_Manager_api.controller;

import com.example.Task_Manager_api.model.Task;
import com.example.Task_Manager_api.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;


import java.util.List;


@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @PostMapping
    public Task createTask(@Valid @RequestBody Task task){
        return taskService.saveTask(task);
    }

    @GetMapping
    public List<Task> getAllTasks(){
        return taskService.getAllTasks();
    }
}
