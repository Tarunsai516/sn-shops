package com.snshops.repository;

import com.snshops.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    @Query("SELECT c FROM Customer c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "c.phone LIKE CONCAT('%', :search, '%')")
    Page<Customer> searchCustomers(@Param("search") String search, Pageable pageable);

    boolean existsByPhone(String phone);

    @Query("SELECT COALESCE(SUM(c.totalDebtBalance), 0) FROM Customer c")
    BigDecimal getTotalOutstandingDebt();
}
