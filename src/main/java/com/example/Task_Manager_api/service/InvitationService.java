package com.example.Task_Manager_api.service;

import com.example.Task_Manager_api.model.Group;
import com.example.Task_Manager_api.model.Invitation;
import com.example.Task_Manager_api.model.User;
import com.example.Task_Manager_api.repository.InvitationRepository;
import com.example.Task_Manager_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class InvitationService {

    @Autowired
    private InvitationRepository invitationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupService groupService;

    @Autowired
    private EmailService emailService;

    public Invitation inviteMember(Long groupId, String email) {
        User currentUser = groupService.getCurrentUser();
        Group group = groupService.getGroupById(groupId);

        if (!group.getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only group owner can invite members");
        }

        invitationRepository.findByEmailAndGroupId(email, groupId).ifPresent(inv -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Invitation already sent to this email for this group");
        });

        Invitation invitation = new Invitation(email, group);
        Invitation saved = invitationRepository.save(invitation);

        try {
            emailService.sendInvitationEmail(email, group.getName(), currentUser.getUsername());
        } catch (Exception e) {
            // Log error but maybe don't fail the whole request?
            // Better to fail if it's the primary way they know.
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to send invitation email");
        }

        return saved;
    }

    public void acceptInvitation(Long invitationId) {
        User currentUser = groupService.getCurrentUser();
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));

        if (!invitation.getEmail().equalsIgnoreCase(currentUser.getEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This invitation is not for you");
        }

        if (invitation.getStatus() != Invitation.InvitationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invitation is already " + invitation.getStatus());
        }

        invitation.setStatus(Invitation.InvitationStatus.ACCEPTED);
        invitationRepository.save(invitation);

        groupService.addMember(invitation.getGroup(), currentUser);
    }

    public void declineInvitation(Long invitationId) {
        User currentUser = groupService.getCurrentUser();
        Invitation invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invitation not found"));

        if (!invitation.getEmail().equalsIgnoreCase(currentUser.getEmail())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This invitation is not for you");
        }

        if (invitation.getStatus() != Invitation.InvitationStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invitation is already " + invitation.getStatus());
        }

        invitation.setStatus(Invitation.InvitationStatus.REJECTED);
        invitationRepository.save(invitation);
    }

    public List<Invitation> getMyPendingInvitations() {
        User currentUser = groupService.getCurrentUser();
        return invitationRepository.findByEmailAndStatus(currentUser.getEmail(), Invitation.InvitationStatus.PENDING);
    }
}
