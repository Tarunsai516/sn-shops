package com.snshops.service;

import com.snshops.dto.DashboardResponse;
import com.snshops.entity.User;
import com.snshops.repository.CustomerRepository;
import com.snshops.repository.ProductRepository;
import com.snshops.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    public DashboardResponse getDashboardData(User user) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        BigDecimal dailyRevenue = saleRepository.getDailyRevenue(user, startOfDay, endOfDay);
        BigDecimal totalDebt = customerRepository.getTotalOutstandingDebt(user);
        long lowStockCount = productRepository.countLowStockProducts(user);
        long totalProducts = productRepository.countByUser(user);
        long totalCustomers = customerRepository.countByUser(user);

        return DashboardResponse.builder()
                .dailyRevenue(dailyRevenue)
                .totalOutstandingDebt(totalDebt)
                .lowStockCount(lowStockCount)
                .totalProducts(totalProducts)
                .totalCustomers(totalCustomers)
                .totalSalesToday(0)
                .build();
    }
}
