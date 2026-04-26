package com.freelance.controller;

import com.freelance.entity.Job;
import com.freelance.service.JobService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    /** Açık tüm ilanları getir */
    @GetMapping
    public List<Job> getAllOpenJobs() {
        return jobService.getAllOpenJobs();
    }

    /** Belirli işverenin ilanlarını getir */
    @GetMapping("/employer/{employerId}")
    public List<Job> getJobsByEmployer(@PathVariable Long employerId) {
        return jobService.getJobsByEmployer(employerId);
    }

    /** Yeni iş ilanı oluştur */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Job createJob(@RequestBody JobRequest request) {
        return jobService.createJob(
                request.getEmployerId(),
                request.getTitle(),
                request.getDescription(),
                request.getBudget(),
                request.getDuration()
        );
    }

    // ── İç DTO sınıfı ────────────────────────────────────────────────────
    @Data
    public static class JobRequest {
        private Long   employerId;
        private String title;
        private String description;
        private Double budget;
        private Integer duration; // gün
    }
}
