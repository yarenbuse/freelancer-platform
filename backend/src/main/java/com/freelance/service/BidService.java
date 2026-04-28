package com.freelance.service;

import com.freelance.entity.Bid;
import com.freelance.entity.Job;
import com.freelance.entity.User;
import com.freelance.repository.BidRepository;
import com.freelance.repository.JobRepository;
import com.freelance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BidService {

    private final BidRepository bidRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;

    @Transactional
    public Bid createBid(Long jobId, Long freelancerId, Double amount, Integer deliveryTime, String message) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        User freelancer = userRepository.findById(freelancerId).orElseThrow(() -> new RuntimeException("Freelancer not found"));

        if (job.getEmployer().getId().equals(freelancerId)) {
            throw new RuntimeException("Müşteri kendi ilanına teklif veremez.");
        }

        Bid bid = Bid.builder()
                .job(job)
                .freelancer(freelancer)
                .amount(amount)
                .deliveryTime(deliveryTime)
                .message(message)
                .status(Bid.Status.PENDING)
                .build();

        return bidRepository.save(bid);
    }

    @Transactional
    public Bid updateBidStatus(Long id, String statusStr) {
        Bid bid = bidRepository.findById(id).orElseThrow(() -> new RuntimeException("Bid not found"));
        Bid.Status status = Bid.Status.valueOf(statusStr.toUpperCase());
        bid.setStatus(status);

        if (status == Bid.Status.ACCEPTED) {
            Job job = bid.getJob();
            job.setStatus(Job.Status.IN_PROGRESS);
            jobRepository.save(job);
        }

        return bidRepository.save(bid);
    }

    @Transactional(readOnly = true)
    public List<Bid> getBidsForJob(Long jobId) {
        return bidRepository.findByJobId(jobId);
    }
}
