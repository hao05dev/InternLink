package com.internlink.core.repository;

import com.internlink.core.entity.InterviewParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterviewParticipantRepository extends JpaRepository<InterviewParticipant, Long> {

    List<InterviewParticipant> findByInterviewId(Long interviewId);

    List<InterviewParticipant> findByUserId(Long userId);
}