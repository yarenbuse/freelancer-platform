package com.freelance.service;

import com.freelance.entity.Job;
import com.freelance.entity.Transaction;
import com.freelance.entity.User;
import com.freelance.entity.Bid;
import com.freelance.repository.JobRepository;
import com.freelance.repository.TransactionRepository;
import com.freelance.repository.UserRepository;
import com.freelance.repository.BidRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final BidRepository bidRepository;

    @Transactional(readOnly = true)
    public List<Job> getAllOpenJobs() {
        return jobRepository.findByStatus(Job.Status.OPEN);
    }

    @Transactional(readOnly = true)
    public List<Job> getJobsByEmployer(Long employerId) {
        return jobRepository.findByEmployer_Id(employerId);
    }

    @Transactional(readOnly = true)
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Job> getJobsByFreelancer(Long freelancerId) {
        // Freelancer'ın kazandığı (ACCEPTED olan) bid'lerin işlerini getir.
        List<Bid> acceptedBids = bidRepository.findByFreelancer_Id(freelancerId).stream()
                .filter(bid -> bid.getStatus() == Bid.Status.ACCEPTED)
                .collect(Collectors.toList());
        List<Long> jobIds = acceptedBids.stream()
                .map(bid -> bid.getJob().getId())
                .collect(Collectors.toList());
        return jobRepository.findAllById(jobIds);
    }

    @Transactional
    public Job createJob(Long employerId, String title, String description,
                         Double budget, Integer duration) {

        User employer = userRepository.findById(employerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Kullanıcı bulunamadı: id=" + employerId));

        if (employer.getRole() != User.Role.CLIENT) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Yalnızca Müşteri rolündeki kullanıcılar iş ilanı verebilir.");
        }

        Job job = Job.builder()
                .title(title)
                .description(description)
                .budget(budget)
                .duration(duration)
                .status(Job.Status.OPEN)
                .employer(employer)
                .build();

        return jobRepository.save(job);
    }

    @Transactional
    public Job payJob(Long jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        if (job.getStatus() != Job.Status.IN_PROGRESS) {
            throw new RuntimeException("Sadece IN_PROGRESS durumundaki işler için ödeme yapılabilir.");
        }

        // Simulate payment and create transaction
        Transaction transaction = Transaction.builder()
                .amount(job.getBudget())
                .job(job)
                .status(Transaction.Status.SUCCESS)
                .transactionDate(LocalDateTime.now())
                .build();
        transactionRepository.save(transaction);

        job.setStatus(Job.Status.PAYMENT_HELD);
        return jobRepository.save(job);
    }

    @Transactional
    public Job deliverJob(Long jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        if (job.getStatus() != Job.Status.PAYMENT_HELD) {
            throw new RuntimeException("Ödeme beklemeye alınmadan iş teslim edilemez.");
        }
        job.setStatus(Job.Status.DELIVERED);
        return jobRepository.save(job);
    }

    @Transactional
    public Job deliverJobWithFile(Long jobId, org.springframework.web.multipart.MultipartFile file, String note) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        if (job.getStatus() != Job.Status.PAYMENT_HELD) {
            throw new RuntimeException("Ödeme beklemeye alınmadan iş teslim edilemez.");
        }

        if (file != null && !file.isEmpty()) {
            try {
                java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads");
                if (!java.nio.file.Files.exists(uploadDir)) {
                    java.nio.file.Files.createDirectories(uploadDir);
                }
                String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                java.nio.file.Path targetLocation = uploadDir.resolve(filename);
                java.nio.file.Files.copy(file.getInputStream(), targetLocation, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                job.setDeliveryFilePath(targetLocation.toString());
            } catch (Exception e) {
                throw new RuntimeException("Dosya kaydedilemedi: " + e.getMessage());
            }
        }

        job.setDeliveryNote(note);
        job.setStatus(Job.Status.DELIVERED);
        return jobRepository.save(job);
    }

    @Transactional
    public Job approveJob(Long jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        if (job.getStatus() != Job.Status.DELIVERED) {
            throw new RuntimeException("Teslim edilmeyen iş onaylanamaz.");
        }
        job.setStatus(Job.Status.COMPLETED);
        return jobRepository.save(job);
    }

    @Transactional
    public Job disputeJob(Long jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        if (job.getStatus() != Job.Status.DELIVERED && job.getStatus() != Job.Status.PAYMENT_HELD) {
            throw new RuntimeException("Sadece ödemesi alınan veya teslim edilen işler anlaşmazlığa düşebilir.");
        }
        job.setStatus(Job.Status.DISPUTED);
        return jobRepository.save(job);
    }

    @Transactional
    public Job adminCancelJob(Long jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        job.setStatus(Job.Status.CANCELLED);
        // İade işlemi burada yapılabilir (Refund)
        return jobRepository.save(job);
    }

    @Transactional
    public Job adminForceApproveJob(Long jobId) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));
        job.setStatus(Job.Status.COMPLETED);
        // Paranın freelancer'a aktarıldığı varsayılır.
        return jobRepository.save(job);
    }
}
