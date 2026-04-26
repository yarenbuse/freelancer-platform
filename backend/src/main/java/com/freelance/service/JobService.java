package com.freelance.service;

import com.freelance.entity.Job;
import com.freelance.entity.User;
import com.freelance.repository.JobRepository;
import com.freelance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Job> getAllOpenJobs() {
        return jobRepository.findByStatus(Job.Status.OPEN);
    }

    @Transactional(readOnly = true)
    public List<Job> getJobsByEmployer(Long employerId) {
        return jobRepository.findByEmployer_Id(employerId);
    }

    @Transactional
    public Job createJob(Long employerId, String title, String description,
                         Double budget, Integer duration) {

        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı: id=" + employerId));

        if (employer.getRole() != User.Role.CLIENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Yalnızca Müşteri rolündeki kullanıcılar iş ilanı verebilir.");
        }

        Job job = Job.builder()
                .title(title)
                .description(description)
                .budget(budget)
                .duration(duration)
                .status(Job.Status.OPEN)
                .employer(employer)
                .build();

        return jobRepository.save(job);
    }
}
