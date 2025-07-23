package com.example.Task_Manager_api.controller;

import com.example.Task_Manager_api.model.Task;
import com.example.Task_Manager_api.model.TaskStatus;
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
    @GetMapping("/{id}")
    public Task getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id);
    }
    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @Valid @RequestBody Task task) {
        return taskService.updateTask(id, task);
    }

    @DeleteMapping("/{id}")
    public String deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return "Task deleted successfully.";
    }

    @GetMapping ("/status/{status}")
    public List<Task> getTasksByStatus(@PathVariable TaskStatus status){
        return taskService.getTasksByStatus(status);
    }

    @GetMapping ("/sorted/createdAt")
    public List<Task> getTasksSortedByDate(){
        return taskService.getTasksSortedByDate();
    }

    @GetMapping ("/filter/today")
    public List<Task> getTaskCreatedToday(){
        return taskService.getTaskCreatedToday();
    }

    @GetMapping ("filter/this-week")
    public List<Task> getTaskCreatedThisWeek(){
        return taskService.getTaskCreatedThisWeek();
    }

    @GetMapping ("filter/by-date")
    public List<Task> getTasksBetweenDates(@RequestParam String fromDate, @RequestParam String toDate){
        return taskService.getTasksBetweenDates(fromDate, toDate);
    }

    @GetMapping ("filter/by-month")
    public List<Task> getTasksByMonth(@RequestParam int month, @RequestParam int year){
        return taskService.getTasksByMonth(month, year);
    }
}
