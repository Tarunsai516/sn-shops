package com.snshops.repository;

import com.snshops.entity.Sale;
import com.snshops.entity.User;
import com.snshops.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    Page<Sale> findByUserAndCustomerId(User user, Long customerId, Pageable pageable);

    @Query("SELECT s FROM Sale s WHERE s.user = :user AND s.paymentStatus IN :statuses")
    Page<Sale> findByUserAndPaymentStatusIn(@Param("user") User user, @Param("statuses") List<PaymentStatus> statuses, Pageable pageable);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.user = :user AND s.createdAt >= :start AND s.createdAt < :end")
    BigDecimal getDailyRevenue(@Param("user") User user, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    List<Sale> findByUserAndCustomerIdAndPaymentStatusIn(User user, Long customerId, List<PaymentStatus> statuses);

    Page<Sale> findAllByUser(User user, Pageable pageable);

    Optional<Sale> findByIdAndUser(Long id, User user);

    // --- Dashboard analytics queries ---

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.user = :user AND s.createdAt >= :start AND s.createdAt < :end")
    long countSalesBetween(@Param("user") User user, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.user = :user AND s.createdAt >= :start AND s.createdAt < :end")
    BigDecimal getRevenueBetween(@Param("user") User user, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT s FROM Sale s LEFT JOIN FETCH s.customer WHERE s.user = :user ORDER BY s.createdAt DESC")
    List<Sale> findRecentSales(@Param("user") User user, Pageable pageable);

    @Query("SELECT si.product.name, SUM(si.quantity), SUM(si.quantity * si.unitPriceAtSale) " +
           "FROM SaleItem si WHERE si.sale.user = :user AND si.sale.createdAt >= :start AND si.sale.createdAt < :end " +
           "GROUP BY si.product.name ORDER BY SUM(si.quantity * si.unitPriceAtSale) DESC")
    List<Object[]> getTopSellingProducts(@Param("user") User user, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end, Pageable pageable);
}
