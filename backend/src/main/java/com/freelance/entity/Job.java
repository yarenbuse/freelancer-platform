package com.freelance.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double budget;

    private Integer duration; // gün cinsinden

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.OPEN;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employer_id")
    @JsonIgnoreProperties({"password", "email", "hibernateLazyInitializer", "handler"})
    private User employer;

    @OneToMany(mappedBy = "job", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private java.util.List<Bid> bids;

    private String deliveryFilePath;

    @Column(columnDefinition = "TEXT")
    private String deliveryNote;

    public enum Status {
        OPEN, IN_PROGRESS, PAYMENT_HELD, DELIVERED, COMPLETED, DISPUTED, CANCELLED
    }
}
