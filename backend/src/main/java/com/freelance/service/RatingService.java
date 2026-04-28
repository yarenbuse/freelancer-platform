package com.freelance.service;

import com.freelance.entity.Rating;
import com.freelance.repository.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingService {
    private final RatingRepository ratingRepository;

    @Transactional
    public Rating createRating(Rating rating) {
        if (rating.getScore() < 1 || rating.getScore() > 5) {
            throw new IllegalArgumentException("Score must be between 1 and 5");
        }
        return ratingRepository.save(rating);
    }

    @Transactional(readOnly = true)
    public Double getAverageRating(Long targetUserId) {
        List<Rating> ratings = ratingRepository.findByTargetUserId(targetUserId);
        if (ratings.isEmpty()) {
            return 0.0;
        }
        double sum = 0;
        for (Rating r : ratings) {
            sum += r.getScore();
        }
        return sum / ratings.size();
    }
}
