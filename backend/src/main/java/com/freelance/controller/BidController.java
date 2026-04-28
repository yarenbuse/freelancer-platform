package com.freelance.controller;

import com.freelance.entity.Bid;
import com.freelance.service.BidService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bids")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class BidController {

    private final BidService bidService;

    @PostMapping
    public ResponseEntity<?> createBid(@RequestBody BidRequest request) {
        try {
            Bid bid = bidService.createBid(
                    request.getJobId(),
                    request.getFreelancerId(),
                    request.getAmount(),
                    request.getDeliveryTime(),
                    request.getMessage()
            );
            return ResponseEntity.ok(bid);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateBidStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            String status = body.get("status");
            Bid updatedBid = bidService.updateBidStatus(id, status);
            return ResponseEntity.ok(updatedBid);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Bid>> getBidsForJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(bidService.getBidsForJob(jobId));
    }

    @Data
    static class BidRequest {
        private Long jobId;
        private Long freelancerId;
        private Double amount;
        private Integer deliveryTime;
        private String message;
    }
}
