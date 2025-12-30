package com.example.Task_Manager_api.repository;

import com.example.Task_Manager_api.model.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvitationRepository extends JpaRepository<Invitation, Long> {
    List<Invitation> findByEmail(String email);

    List<Invitation> findByEmailAndStatus(String email, Invitation.InvitationStatus status);

    Optional<Invitation> findByEmailAndGroupId(String email, Long groupId);

    void deleteByGroupId(Long groupId);
}
