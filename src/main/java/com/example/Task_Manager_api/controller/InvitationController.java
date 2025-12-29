package com.example.Task_Manager_api.controller;

import com.example.Task_Manager_api.model.Invitation;
import com.example.Task_Manager_api.service.InvitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invitations")
public class InvitationController {

    @Autowired
    private InvitationService invitationService;

    @PostMapping("/invite")
    public ResponseEntity<Invitation> invite(@RequestBody Map<String, String> request) {
        Long groupId = Long.parseLong(request.get("groupId"));
        String email = request.get("email");
        return ResponseEntity.ok(invitationService.inviteMember(groupId, email));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<String> accept(@PathVariable Long id) {
        invitationService.acceptInvitation(id);
        return ResponseEntity.ok("Invitation accepted successfully");
    }

    @GetMapping("/my-pending")
    public ResponseEntity<List<Invitation>> getMyPending() {
        return ResponseEntity.ok(invitationService.getMyPendingInvitations());
    }
}
