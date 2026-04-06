package com.snshops.repository;

import com.snshops.entity.Sale;
import com.snshops.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    Page<Sale> findByCustomerId(Long customerId, Pageable pageable);

    @Query("SELECT s FROM Sale s WHERE s.paymentStatus IN :statuses")
    Page<Sale> findByPaymentStatusIn(@Param("statuses") List<PaymentStatus> statuses, Pageable pageable);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.createdAt >= :start AND s.createdAt < :end")
    BigDecimal getDailyRevenue(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    List<Sale> findByCustomerIdAndPaymentStatusIn(Long customerId, List<PaymentStatus> statuses);
}
