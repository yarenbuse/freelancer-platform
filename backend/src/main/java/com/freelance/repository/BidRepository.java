package com.freelance.repository;

import com.freelance.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByJobId(Long jobId);
    List<Bid> findByFreelancer_Id(Long freelancerId);
}
