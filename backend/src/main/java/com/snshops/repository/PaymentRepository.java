package com.snshops.repository;

import com.snshops.entity.Payment;
import com.snshops.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findBySaleId(Long saleId);

    Page<Payment> findByCustomerId(Long customerId, Pageable pageable);

    @Query("SELECT p FROM Payment p WHERE p.sale.user = :user ORDER BY p.paymentDate DESC")
    Page<Payment> findAllByUser(@Param("user") User user, Pageable pageable);

    @Query("SELECT p FROM Payment p WHERE p.customer.id = :customerId AND p.sale.user = :user")
    Page<Payment> findByCustomerIdAndUser(@Param("customerId") Long customerId, @Param("user") User user, Pageable pageable);
}
