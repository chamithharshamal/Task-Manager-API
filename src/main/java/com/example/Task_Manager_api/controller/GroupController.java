package com.example.Task_Manager_api.controller;

import com.example.Task_Manager_api.model.Group;
import com.example.Task_Manager_api.service.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @PostMapping
    public ResponseEntity<Group> createGroup(@RequestBody String name) {
        // Clean up name if it comes as JSON string
        String cleanName = name.replace("\"", "");
        return ResponseEntity.ok(groupService.createGroup(cleanName));
    }

    @GetMapping("/my-groups")
    public ResponseEntity<List<Group>> getMyGroups() {
        return ResponseEntity.ok(groupService.getMyGroups());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroupById(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }
}
