package com.freelance.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bids")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double amount;
    private Integer deliveryTime; // gün cinsinden

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PENDING;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "freelancer_id")
    @JsonIgnoreProperties({"password", "email", "hibernateLazyInitializer", "handler", "aboutMe"})
    private User freelancer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    @JsonIgnore
    private Job job;

    public enum Status {
        PENDING, ACCEPTED, REJECTED
    }
}
