package com.snshops.repository;

import com.snshops.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findBySaleId(Long saleId);
    Page<Payment> findByCustomerId(Long customerId, Pageable pageable);
    Page<Payment> findAllByOrderByPaymentDateDesc(Pageable pageable);
}
