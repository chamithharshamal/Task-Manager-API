package com.example.Task_Manager_api.repository;

import com.example.Task_Manager_api.model.Group;
import com.example.Task_Manager_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByOwner(User owner);

    List<Group> findByMembersContaining(User user);
}
