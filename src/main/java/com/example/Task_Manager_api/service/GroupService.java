package com.example.Task_Manager_api.service;

import com.example.Task_Manager_api.model.Group;
import com.example.Task_Manager_api.model.User;
import com.example.Task_Manager_api.repository.GroupRepository;
import com.example.Task_Manager_api.repository.UserRepository;
import com.example.Task_Manager_api.repository.TaskRepository;
import com.example.Task_Manager_api.repository.InvitationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private InvitationRepository invitationRepository;

    public User getCurrentUser() {
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

    public Group createGroup(String name) {
        User currentUser = getCurrentUser();
        Group group = new Group(name, currentUser);
        return groupRepository.save(group);
    }

    public List<Group> getMyGroups() {
        User currentUser = getCurrentUser();
        return groupRepository.findByMembersContaining(currentUser);
    }

    public Group getGroupById(Long id) {
        User currentUser = getCurrentUser();
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        if (!group.getMembers().contains(currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this group");
        }
        return group;
    }

    public void addMember(Group group, User user) {
        group.getMembers().add(user);
        groupRepository.save(group);
    }

    @org.springframework.transaction.annotation.Transactional
    public void leaveGroup(Long groupId) {
        User currentUser = getCurrentUser();
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        if (group.getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Owner cannot leave the group. Delete the group instead.");
        }

        if (!group.getMembers().contains(currentUser)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You are not a member of this group");
        }

        group.getMembers().remove(currentUser);
        groupRepository.save(group);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteGroup(Long groupId) {
        User currentUser = getCurrentUser();
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        if (!group.getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owner can delete the group");
        }

        // Delete associated resources
        invitationRepository.deleteByGroupId(groupId);
        taskRepository.deleteByGroupId(groupId);

        groupRepository.delete(group);
    }
}
