package com.example.Task_Manager_api.service;

import com.example.Task_Manager_api.model.Task;
import com.example.Task_Manager_api.model.TaskStatus;
import com.example.Task_Manager_api.model.TaskPriority;
import com.example.Task_Manager_api.model.User;
import com.example.Task_Manager_api.model.Group;
import com.example.Task_Manager_api.repository.TaskRepository;
import com.example.Task_Manager_api.repository.UserRepository;
import com.example.Task_Manager_api.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@org.springframework.transaction.annotation.Transactional
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private EmailService emailService;

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

    public Task saveTask(Task task) {
        User currentUser = getCurrentUser();
        task.setUser(currentUser);

        // If group is set, verify membership
        if (task.getGroup() != null) {
            Long groupId = task.getGroup().getId();
            if (groupId != null) {
                Group group = groupRepository.findById(groupId.longValue())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));
                if (!group.getMembers().contains(currentUser)) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this group");
                }
                task.setGroup(group);
            }
        }

        // If assignedUser is set, verify they are in the group
        if (task.getAssignedUser() != null && task.getGroup() != null) {
            Long assignedId = task.getAssignedUser().getId();
            if (assignedId != null) {
                User assigned = userRepository.findById(assignedId.longValue())
                        .orElseThrow(
                                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assigned user not found"));
                if (!task.getGroup().getMembers().contains(assigned)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Assigned user is not a member of the selected group");
                }
                task.setAssignedUser(assigned);
            }
        }

        // Apply defaults ONLY for new tasks
        if (task.getId() == null) {
            if (task.getStatus() == null) {
                task.setStatus(TaskStatus.TO_DO);
            }
            if (task.getPriority() == null) {
                task.setPriority(TaskPriority.MEDIUM);
            }
            if (task.getCreatedAt() == null) {
                task.setCreatedAt(LocalDateTime.now());
            }
        }

        Task savedTask = taskRepository.save(task);

        // Send email if newly assigned
        if (savedTask.getAssignedUser() != null && savedTask.getGroup() != null) {
            try {
                emailService.sendTaskAssignmentEmail(
                        savedTask.getAssignedUser().getEmail(),
                        savedTask.getTitle(),
                        savedTask.getGroup().getName(),
                        currentUser.getUsername());
            } catch (Exception e) {
                // Log error but don't fail task creation
                System.err.println("Failed to send assignment email: " + e.getMessage());
            }
        }

        return savedTask;
    }

    public List<Task> getAllTasks() {
        User currentUser = getCurrentUser();
        List<Task> ownedTasks = taskRepository.findByUser(currentUser);
        List<Task> assignedTasks = taskRepository.findByAssignedUser(currentUser);

        // Combine and avoid duplicates (though ownership and assignment are usually
        // distinct)
        ownedTasks.addAll(assignedTasks);
        return ownedTasks.stream().distinct().toList();
    }

    public Task getTaskById(Long id) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Task with ID " + id + " not found"));

        boolean isOwner = task.getUser().getId().equals(currentUser.getId());
        boolean isAssigned = task.getAssignedUser() != null
                && task.getAssignedUser().getId().equals(currentUser.getId());
        boolean isGroupMember = task.getGroup() != null && task.getGroup().getMembers().contains(currentUser);

        if (!isOwner && !isAssigned && !isGroupMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this task");
        }

        return task;
    }

    public Task updateTask(Long id, Task partialTask) {
        Task existingTask = getTaskById(id); // Checks basic access
        User currentUser = getCurrentUser();

        boolean isOwner = existingTask.getUser().getId().equals(currentUser.getId());
        boolean isAssigned = existingTask.getAssignedUser() != null
                && existingTask.getAssignedUser().getId().equals(currentUser.getId());

        if (isOwner) {
            if (partialTask.getTitle() != null) {
                existingTask.setTitle(partialTask.getTitle());
            }
            if (partialTask.getDescription() != null) {
                existingTask.setDescription(partialTask.getDescription());
            }
            if (partialTask.getStatus() != null) {
                if (partialTask.getStatus() == TaskStatus.COMPLETED
                        && existingTask.getStatus() != TaskStatus.COMPLETED) {
                    existingTask.setCompletedAt(LocalDateTime.now());
                } else if (partialTask.getStatus() != TaskStatus.COMPLETED) {
                    existingTask.setCompletedAt(null);
                }
                existingTask.setStatus(partialTask.getStatus());
            }
            if (partialTask.getPriority() != null) {
                existingTask.setPriority(partialTask.getPriority());
            }
            if (partialTask.getDueDate() != null) {
                existingTask.setDueDate(partialTask.getDueDate());
            }

            // check if assignment changed
            User oldAssignee = existingTask.getAssignedUser();
            if (partialTask.getAssignedUser() != null && partialTask.getAssignedUser().getId() != null) {
                User assignee = userRepository.findById(partialTask.getAssignedUser().getId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignee not found"));

                if (oldAssignee == null || !oldAssignee.getId().equals(assignee.getId())) {
                    existingTask.setAssignedUser(assignee);
                    // Send email
                    if (existingTask.getGroup() != null) {
                        try {
                            emailService.sendTaskAssignmentEmail(
                                    assignee.getEmail(),
                                    existingTask.getTitle(),
                                    existingTask.getGroup().getName(),
                                    currentUser.getUsername());
                        } catch (Exception e) {
                            System.err.println("Failed to send assignment email: " + e.getMessage());
                        }
                    }
                }
            } else if (partialTask.getAssignedUser() == null && partialTask.getGroup() != null) {
                // If the user explicitly sets assignedUser to null or it's missing in a way
                // that means unassigning.
                // However, partialTask might just not contain it.
                // For now, let's assume if it's there but ID is null, we unassign.
                // But normally we only update if it is NOT null in partial update.
            }

            if (partialTask.getGroup() != null && partialTask.getGroup().getId() != null) {
                Group group = groupRepository.findById(partialTask.getGroup().getId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));
                existingTask.setGroup(group);
            }
        } else if (isAssigned) {
            // Assigned members can only change status
            if (partialTask.getStatus() != null) {
                if (partialTask.getStatus() == TaskStatus.COMPLETED
                        && existingTask.getStatus() != TaskStatus.COMPLETED) {
                    existingTask.setCompletedAt(LocalDateTime.now());
                } else if (partialTask.getStatus() != TaskStatus.COMPLETED) {
                    existingTask.setCompletedAt(null);
                }
                existingTask.setStatus(partialTask.getStatus());
            }
        } else {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not authorized to update this task");
        }

        taskRepository.save(existingTask);
        return existingTask;
    }

    public void deleteTask(Long id) {
        getTaskById(id); // Checks ownership
        taskRepository.deleteById(id);
    }

    public List<Task> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByUserAndStatus(getCurrentUser(), status);
    }

    public List<Task> getTasksSortedByDate() {
        return taskRepository.findByUserOrderByCreatedAtDesc(getCurrentUser());
    }

    public List<Task> getTaskCreatedToday() {
        LocalDateTime startOfDay = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        return taskRepository.findByUserAndCreatedAtBetween(getCurrentUser(), startOfDay, endOfDay);
    }

    public List<Task> getTaskCreatedThisWeek() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfWeek = now.minusDays(7);
        return taskRepository.findByUserAndCreatedAtBetween(getCurrentUser(), startOfWeek, now);
    }

    public List<Task> getTasksBetweenDates(String fromDateStr, String toDateStr) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate fromDate = LocalDate.parse(fromDateStr, formatter);
        LocalDate toDate = LocalDate.parse(toDateStr, formatter);

        LocalDateTime start = fromDate.atStartOfDay();
        LocalDateTime end = toDate.plusDays(1).atStartOfDay();

        return taskRepository.findByUserAndCreatedAtBetween(getCurrentUser(), start, end);
    }

    public List<Task> getTasksByMonth(int month, int year) {
        LocalDateTime start = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime end = start.plusMonths(1);
        return taskRepository.findByUserAndCreatedAtBetween(getCurrentUser(), start, end);
    }

    public Page<Task> getAllTasks(Pageable pageable) {
        return taskRepository.findByUser(getCurrentUser(), pageable);
    }

    public List<Task> searchByTitle(String title) {
        return taskRepository.findByUserAndTitleContainingIgnoreCase(getCurrentUser(), title);
    }

    public List<Task> getTasksByGroup(Long groupId) {
        User currentUser = getCurrentUser();
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        if (!group.getMembers().contains(currentUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this group's tasks");
        }

        return taskRepository.findByGroupId(groupId);
    }
}
