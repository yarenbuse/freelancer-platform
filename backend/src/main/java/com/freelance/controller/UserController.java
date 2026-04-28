package com.freelance.controller;

import com.freelance.entity.User;
import com.freelance.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final com.freelance.service.RatingService ratingService;

    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public User loginUser(@RequestBody User loginRequest) {
        return userService.loginUser(loginRequest.getEmail(), loginRequest.getPassword());
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        User user = userService.getUserById(id);
        Double averageRating = ratingService.getAverageRating(id);
        user.setRating(averageRating == 0.0 ? null : averageRating);
        return user;
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        return userService.updateUser(id, updatedUser);
    }
}