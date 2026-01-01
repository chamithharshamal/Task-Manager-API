package com.example.Task_Manager_api.service;

import com.example.Task_Manager_api.model.ActivityLog;
import com.example.Task_Manager_api.model.Task;
import com.example.Task_Manager_api.model.User;
import com.example.Task_Manager_api.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Transactional
    public void logActivity(String type, String description, User user, Task task) {
        ActivityLog log = new ActivityLog(type, description, user, task);
        activityLogRepository.save(log);
    }

    public Page<ActivityLog> getRecentActivitiesForUser(User user, Pageable pageable) {
        return activityLogRepository.findByUserRelatedActivities(user, pageable);
    }

    public Page<ActivityLog> getActivitiesForTask(Long taskId, Pageable pageable) {
        return activityLogRepository.findByTaskIdOrderByTimestampDesc(taskId, pageable);
    }
}
