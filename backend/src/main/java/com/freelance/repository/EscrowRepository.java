package com.freelance.repository;

import com.freelance.entity.Escrow;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EscrowRepository extends JpaRepository<Escrow, Long> {
}
