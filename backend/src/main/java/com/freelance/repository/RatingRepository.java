package com.freelance.repository;

import com.freelance.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByTargetUserId(Long targetUserId);
}
