package com.example.Task_Manager_api.service;

import com.example.Task_Manager_api.model.Task;
import com.example.Task_Manager_api.model.TaskStatus;
import com.example.Task_Manager_api.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TaskReminderService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private EmailService emailService;

    /**
     * Runs every hour to check for tasks due tomorrow.
     * 0 0 * * * * = Every hour at minute 0
     * For testing, you could use "0 * * * * *" (every minute)
     */
    @Scheduled(cron = "0 0 * * * *")
    public void sendDueDateReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Task> upcomingTasks = taskRepository.findByDueDateAndStatusNot(tomorrow, TaskStatus.COMPLETED);

        for (Task task : upcomingTasks) {
            String recipientEmail = null;
            if (task.getAssignedUser() != null) {
                recipientEmail = task.getAssignedUser().getEmail();
            } else if (task.getUser() != null) {
                recipientEmail = task.getUser().getEmail();
            }

            if (recipientEmail != null) {
                emailService.sendDueDateReminderEmail(recipientEmail, task.getTitle(), task.getDueDate());
            }
        }
    }
}
