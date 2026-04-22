package com.snshops.repository;

import com.snshops.entity.Customer;
import com.snshops.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Page<Customer> findAllByUser(User user, Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE c.user = :user AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "c.phone LIKE CONCAT('%', :search, '%'))")
    Page<Customer> searchCustomers(@Param("user") User user, @Param("search") String search, Pageable pageable);

    boolean existsByPhoneAndUser(String phone, User user);

    Optional<Customer> findByIdAndUser(Long id, User user);

    @Query("SELECT COALESCE(SUM(c.totalDebtBalance), 0) FROM Customer c WHERE c.user = :user")
    BigDecimal getTotalOutstandingDebt(@Param("user") User user);

    long countByUser(User user);
}
