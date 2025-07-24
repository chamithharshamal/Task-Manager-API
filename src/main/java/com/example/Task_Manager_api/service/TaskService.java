package com.example.Task_Manager_api.service;

import com.example.Task_Manager_api.model.Task;
import com.example.Task_Manager_api.model.TaskStatus;
import com.example.Task_Manager_api.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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

    public Task saveTask(Task task) {
        if (task.getCreatedAt() == null) {
            task.setCreatedAt(LocalDateTime.now());
        }
        return taskRepository.save(task);
    }

    public List<Task> getAllTasks(){
        return taskRepository.findAll();
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task with ID " + id + " not found"));
    }

    public Task updateTask(Long id, Task updatedTask) {
        if (!taskRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task with ID " + id + " not found");
        }
        updatedTask.setId(id);
        if (updatedTask.getCreatedAt() == null) {
            Task existingTask = taskRepository.findById(id).get();
            updatedTask.setCreatedAt(existingTask.getCreatedAt());
        }
        return taskRepository.save(updatedTask);
    }
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task with ID " + id + " not found");
        }
        taskRepository.deleteById(id);
    }

    public List<Task> getTasksByStatus(TaskStatus status){
        return taskRepository.findByStatus(status);
    }

    public List<Task> getTasksSortedByDate(){
        return taskRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Task> getTaskCreatedToday(){
        LocalDateTime startOfDay= LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfFay= startOfDay.plusDays(1);
        return taskRepository.findByCreatedAtBetween(startOfDay, endOfFay);
    }
    public List<Task> getTaskCreatedThisWeek(){
      LocalDateTime now= LocalDateTime.now();
      LocalDateTime startOfWeek= now.minusDays(7);
      return taskRepository.findByCreatedAtBetween(startOfWeek, now);
    }
    public List<Task> getTasksBetweenDates(String fromDateStr, String toDateStr){
        DateTimeFormatter formatter= DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate fromDate = LocalDate.parse(fromDateStr, formatter);
        LocalDate toDate = LocalDate.parse(toDateStr, formatter);

        LocalDateTime start = fromDate.atStartOfDay();
        LocalDateTime end = toDate.plusDays(1).atStartOfDay();

        return taskRepository.findByCreatedAtBetween(start, end);
    }

    public List<Task> getTasksByMonth(int month, int year){
        LocalDateTime start = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime end = start.plusMonths(1);
        return taskRepository.findByCreatedAtBetween(start, end);
    }
    public Page<Task> getAllTasks(Pageable pageable) {
        return taskRepository.findAll(pageable);
    }



}
