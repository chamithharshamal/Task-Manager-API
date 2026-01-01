package com.example.Task_Manager_api.repository;

import com.example.Task_Manager_api.model.ActivityLog;
import com.example.Task_Manager_api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    // Find activities related to tasks the user owns or is assigned to
    @Query("SELECT a FROM activity_logs a WHERE a.task.user = :user OR a.task.assignedUser = :user ORDER BY a.timestamp DESC")
    Page<ActivityLog> findByUserRelatedActivities(@Param("user") User user, Pageable pageable);

    // Find activities for a specific task
    Page<ActivityLog> findByTaskIdOrderByTimestampDesc(Long taskId, Pageable pageable);
}
