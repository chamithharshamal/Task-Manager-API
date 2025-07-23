package com.example.Task_Manager_api.service;

import com.example.Task_Manager_api.model.Task;
import com.example.Task_Manager_api.model.TaskStatus;
import com.example.Task_Manager_api.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
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


}
