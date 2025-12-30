package com.example.Task_Manager_api.repository;

import com.example.Task_Manager_api.model.Task;
import com.example.Task_Manager_api.model.TaskStatus;
import com.example.Task_Manager_api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    @Override
    boolean existsById(Long id);

    List<Task> findByUser(User user);

    List<Task> findByUserAndStatus(User user, TaskStatus status);

    List<Task> findByUserOrderByCreatedAtDesc(User user);

    List<Task> findByUserAndCreatedAtBetween(User user, LocalDateTime start, LocalDateTime end);

    List<Task> findByUserAndTitleContainingIgnoreCase(User user, String title);

    Page<Task> findByUser(User user, Pageable pageable);

    List<Task> findByGroup(com.example.Task_Manager_api.model.Group group);

    List<Task> findByGroupId(Long groupId);

    List<Task> findByAssignedUser(User user);

    void deleteByGroupId(Long groupId);
}
