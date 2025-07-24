package com.example.Task_Manager_api.repository;

import com.example.Task_Manager_api.model.Task;
import com.example.Task_Manager_api.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>{
    @Override
    boolean existsById(Long id);
    List<Task> findByStatus(TaskStatus status);
    List<Task> findAllByOrderByCreatedAtDesc();
    List <Task> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<Task> findByTitleContainingIgnoreCase(String title);
}
