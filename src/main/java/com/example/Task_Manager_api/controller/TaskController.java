package com.example.Task_Manager_api.controller;

import com.example.Task_Manager_api.model.Task;
import com.example.Task_Manager_api.model.TaskStatus;
import com.example.Task_Manager_api.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody Task task) {
        return ResponseEntity.ok(taskService.saveTask(task));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @Valid @RequestBody Task task) {
        return ResponseEntity.ok(taskService.updateTask(id, task));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Task>> getTasksByStatus(@PathVariable TaskStatus status) {
        return ResponseEntity.ok(taskService.getTasksByStatus(status));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/sorted/createdAt")
    public ResponseEntity<List<Task>> getTasksSortedByDate() {
        return ResponseEntity.ok(taskService.getTasksSortedByDate());
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/filter/today")
    public ResponseEntity<List<Task>> getTaskCreatedToday() {
        return ResponseEntity.ok(taskService.getTaskCreatedToday());
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/filter/this-week")
    public ResponseEntity<List<Task>> getTaskCreatedThisWeek() {
        return ResponseEntity.ok(taskService.getTaskCreatedThisWeek());
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/filter/by-date")
    public ResponseEntity<List<Task>> getTasksBetweenDates(@RequestParam @Valid String fromDate,
            @RequestParam @Valid String toDate) {
        return ResponseEntity.ok(taskService.getTasksBetweenDates(fromDate, toDate));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/filter/by-month")
    public ResponseEntity<List<Task>> getTasksByMonth(@RequestParam int month, @RequestParam int year) {
        return ResponseEntity.ok(taskService.getTasksByMonth(month, year));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/paginated")
    public ResponseEntity<Page<Task>> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(taskService.getAllTasks(pageable));
    }

    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/search")
    public ResponseEntity<List<Task>> searchByTitle(@RequestParam("title") String title) {
        return ResponseEntity.ok(taskService.searchByTitle(title));
    }
}