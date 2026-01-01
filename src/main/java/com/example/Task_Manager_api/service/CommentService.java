package com.example.Task_Manager_api.service;

import com.example.Task_Manager_api.model.Comment;
import com.example.Task_Manager_api.model.Task;
import com.example.Task_Manager_api.model.User;
import com.example.Task_Manager_api.repository.CommentRepository;
import com.example.Task_Manager_api.repository.TaskRepository;
import com.example.Task_Manager_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ActivityLogService activityLogService;

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

    public Comment addComment(Long taskId, String text) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found"));

        Comment comment = new Comment();
        comment.setText(text);
        comment.setAuthor(currentUser);
        comment.setTask(task);

        Comment saved = commentRepository.save(comment);

        activityLogService.logActivity("COMMENT_ADDED",
                "Added a comment to '" + task.getTitle() + "'",
                currentUser, task);

        // Broadcast via WebSocket
        messagingTemplate.convertAndSend("/topic/tasks/" + taskId + "/comments", "updated");

        return saved;
    }

    public List<Comment> getCommentsForTask(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId);
    }
}
