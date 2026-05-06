package com.freelance.controller;

import com.freelance.entity.Job;
import com.freelance.service.JobService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

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
    public ResponseEntity<?> createJob(@RequestBody JobRequest request) {
        try {
            Job saved = jobService.createJob(
                    request.getEmployerId(),
                    request.getTitle(),
                    request.getDescription(),
                    request.getBudget(),
                    request.getDuration()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (ResponseStatusException ex) {
            return ResponseEntity
                    .status(ex.getStatusCode())
                    .body(Map.of("message", ex.getReason() != null ? ex.getReason() : ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Beklenmedik bir hata oluştu: " + ex.getMessage()));
        }
    }

    @GetMapping("/freelancer/{freelancerId}")
    public List<Job> getJobsByFreelancer(@PathVariable Long freelancerId) {
        return jobService.getJobsByFreelancer(freelancerId);
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> payJob(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(jobService.payJob(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/deliver")
    public ResponseEntity<?> deliverJob(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(jobService.deliverJob(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveJob(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(jobService.approveJob(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/dispute")
    public ResponseEntity<?> disputeJob(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(jobService.disputeJob(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
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
