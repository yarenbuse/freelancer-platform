package com.freelance.service;

import com.freelance.entity.Job;
import com.freelance.entity.Review;
import com.freelance.repository.JobRepository;
import com.freelance.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final JobRepository jobRepository;
    private final RatingService ratingService;

    @Transactional
    public Review createReview(Long jobId, Long reviewerId, Long targetUserId, Integer score, String comment) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

        if (job.getStatus() != Job.Status.COMPLETED) {
            throw new RuntimeException("Sadece tamamlanan işler için yorum yapılabilir.");
        }

        Review review = Review.builder()
                .job(job)
                .reviewerId(reviewerId)
                .targetUserId(targetUserId)
                .score(score)
                .comment(comment)
                .build();

        Review savedReview = reviewRepository.save(review);

        // Ayrıca eski RatingService'i de güncelleyelim ki profil puanı değişsin.
        com.freelance.entity.Rating r = com.freelance.entity.Rating.builder()
                .score(score)
                .voterId(reviewerId)
                .targetUserId(targetUserId)
                .build();
        ratingService.createRating(r);

        return savedReview;
    }

    @Transactional(readOnly = true)
    public List<Review> getReviewsForUser(Long userId) {
        return reviewRepository.findByTargetUserId(userId);
    }
}
