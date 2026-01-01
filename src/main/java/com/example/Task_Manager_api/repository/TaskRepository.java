package com.example.Task_Manager_api.repository;

import com.example.Task_Manager_api.model.Task;
import com.example.Task_Manager_api.model.TaskStatus;
import com.example.Task_Manager_api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    List<Task> findByDueDateAndStatusNot(java.time.LocalDate dueDate, TaskStatus status);

    @Query("SELECT t FROM Task t WHERE (t.user = :user OR t.assignedUser = :user) " +
            "AND (LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(t.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Task> searchTasks(@Param("user") User user, @Param("query") String query);

    @Query("SELECT t FROM Task t WHERE (t.user = :user OR t.assignedUser = :user) " +
            "AND t.dueDate BETWEEN :start AND :end AND t.status != 'COMPLETED'")
    List<Task> findTasksDueBetween(@Param("user") User user, @Param("start") java.time.LocalDate start,
            @Param("end") java.time.LocalDate end);
}
