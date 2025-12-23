package com.example.Task_Manager_api.service;

import com.example.Task_Manager_api.model.Task;
import com.example.Task_Manager_api.model.TaskStatus;
import com.example.Task_Manager_api.model.User;
import com.example.Task_Manager_api.repository.TaskRepository;
import com.example.Task_Manager_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public Task saveTask(Task task) {
        User currentUser = getCurrentUser();
        task.setUser(currentUser);
        if (task.getCreatedAt() == null) {
            task.setCreatedAt(LocalDateTime.now());
        }
        return taskRepository.save(task);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findByUser(getCurrentUser());
    }

    public Task getTaskById(Long id) {
        User currentUser = getCurrentUser();
        return taskRepository.findById(id)
                .filter(task -> task.getUser().getId().equals(currentUser.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Task with ID " + id + " not found or access denied"));
    }

    public Task updateTask(Long id, Task updatedTask) {
        Task existingTask = getTaskById(id); // Already checks ownership
        updatedTask.setId(id);
        updatedTask.setUser(existingTask.getUser());
        if (updatedTask.getCreatedAt() == null) {
            updatedTask.setCreatedAt(existingTask.getCreatedAt());
        }
        return taskRepository.save(updatedTask);
    }

    public void deleteTask(Long id) {
        getTaskById(id); // Checks ownership
        taskRepository.deleteById(id);
    }

    public List<Task> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByUserAndStatus(getCurrentUser(), status);
    }

    public List<Task> getTasksSortedByDate() {
        return taskRepository.findByUserOrderByCreatedAtDesc(getCurrentUser());
    }

    public List<Task> getTaskCreatedToday() {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return taskRepository.findByUserAndCreatedAtBetween(getCurrentUser(), startOfDay, endOfDay);
    }

    public List<Task> getTaskCreatedThisWeek() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfWeek = now.minusDays(7);
        return taskRepository.findByUserAndCreatedAtBetween(getCurrentUser(), startOfWeek, now);
    }

    public List<Task> getTasksBetweenDates(String fromDateStr, String toDateStr) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate fromDate = LocalDate.parse(fromDateStr, formatter);
        LocalDate toDate = LocalDate.parse(toDateStr, formatter);

        LocalDateTime start = fromDate.atStartOfDay();
        LocalDateTime end = toDate.plusDays(1).atStartOfDay();

        return taskRepository.findByUserAndCreatedAtBetween(getCurrentUser(), start, end);
    }

    public List<Task> getTasksByMonth(int month, int year) {
        LocalDateTime start = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime end = start.plusMonths(1);
        return taskRepository.findByUserAndCreatedAtBetween(getCurrentUser(), start, end);
    }

    public Page<Task> getAllTasks(Pageable pageable) {
        return taskRepository.findByUser(getCurrentUser(), pageable);
    }

    public List<Task> searchByTitle(String title) {
        return taskRepository.findByUserAndTitleContainingIgnoreCase(getCurrentUser(), title);
    }
}
