package com.snshops.repository;

import com.snshops.entity.Product;
import com.snshops.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByUserAndIsActiveTrue(User user, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.user = :user AND p.isActive = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> searchProducts(@Param("user") User user, @Param("search") String search, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.user = :user AND p.isActive = true AND p.stockQty <= p.lowStockThreshold")
    List<Product> findLowStockProducts(@Param("user") User user);

    boolean existsBySkuAndUser(String sku, User user);

    Optional<Product> findByIdAndUser(Long id, User user);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.user = :user AND p.isActive = true AND p.stockQty <= p.lowStockThreshold")
    long countLowStockProducts(@Param("user") User user);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.user = :user AND p.isActive = true")
    long countByUser(@Param("user") User user);
}
