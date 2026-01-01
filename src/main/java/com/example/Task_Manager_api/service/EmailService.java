package com.example.Task_Manager_api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendInvitationEmail(String to, String groupName, String ownerName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Invitation to join Group: " + groupName);
        message.setText("Hello,\n\n" + ownerName + " has invited you to join their task management group: " + groupName
                +
                ".\n\nPlease log in to your account to accept the invitation.\n\nBest regards,\nTask Manager Team");
        mailSender.send(message);
    }

    public void sendTaskAssignmentEmail(String to, String taskTitle, String groupName, String assignerName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("New Task Assigned: " + taskTitle);
        message.setText(
                "Hello,\n\n" + assignerName + " has assigned a new task to you in group '" + groupName + "':\n\n"
                        + "Task: " + taskTitle + "\n\n"
                        + "Please log in to your dashboard to view the details.\n\nBest regards,\nTask Manager Team");
        mailSender.send(message);
    }
}
