package com.freelance.controller;

import com.freelance.entity.Job;
import com.freelance.entity.User;
import com.freelance.service.JobService;
import com.freelance.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final JobService jobService;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/jobs")
    public List<Job> getAllJobs() {
        return jobService.getAllJobs();
    }

    @PostMapping("/jobs/{id}/cancel")
    public Job cancelJob(@PathVariable Long id) {
        return jobService.adminCancelJob(id);
    }

    @PostMapping("/jobs/{id}/force-approve")
    public Job forceApproveJob(@PathVariable Long id) {
        return jobService.adminForceApproveJob(id);
    }
}
