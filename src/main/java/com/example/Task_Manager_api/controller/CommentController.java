package com.example.Task_Manager_api.controller;

import com.example.Task_Manager_api.model.Comment;
import com.example.Task_Manager_api.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks/{taskId}/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping
    public Comment addComment(@PathVariable Long taskId, @RequestBody Map<String, String> payload) {
        return commentService.addComment(taskId, payload.get("text"));
    }

    @GetMapping
    public List<Comment> getComments(@PathVariable Long taskId) {
        return commentService.getCommentsForTask(taskId);
    }
}
