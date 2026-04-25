package com.snshops.service;

import com.snshops.dto.DashboardResponse;
import com.snshops.entity.Sale;
import com.snshops.entity.User;
import com.snshops.repository.CustomerRepository;
import com.snshops.repository.ProductRepository;
import com.snshops.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
//import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    public DashboardResponse getDashboardData(User user) {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        // --- KPI values ---
        BigDecimal dailyRevenue = saleRepository.getDailyRevenue(user, startOfDay, endOfDay);

        // Weekly revenue (last 7 days)
        LocalDateTime weekStart = today.minusDays(6).atStartOfDay();
        BigDecimal weeklyRevenue = saleRepository.getRevenueBetween(user, weekStart, endOfDay);

        // Monthly revenue (current month)
        LocalDateTime monthStart = today.withDayOfMonth(1).atStartOfDay();
        BigDecimal monthlyRevenue = saleRepository.getRevenueBetween(user, monthStart, endOfDay);

        // Previous month revenue (for comparison)
        LocalDate prevMonthStart = today.minusMonths(1).withDayOfMonth(1);
        LocalDate prevMonthEnd = today.withDayOfMonth(1);
        BigDecimal previousMonthRevenue = saleRepository.getRevenueBetween(
                user, prevMonthStart.atStartOfDay(), prevMonthEnd.atStartOfDay());

        BigDecimal totalDebt = customerRepository.getTotalOutstandingDebt(user);
        long lowStockCount = productRepository.countLowStockProducts(user);
        long totalProducts = productRepository.countByUser(user);
        long totalCustomers = customerRepository.countByUser(user);
        long totalSalesToday = saleRepository.countSalesBetween(user, startOfDay, endOfDay);
        long totalSalesThisMonth = saleRepository.countSalesBetween(user, monthStart, endOfDay);

        // --- Monthly revenue trend (last 12 months) ---
        List<DashboardResponse.MonthlyRevenueDTO> monthlyRevenueData = buildMonthlyRevenue(user, today);

        // --- Daily revenue for current month ---
        List<DashboardResponse.DailyRevenueDTO> dailyRevenueData = buildDailyRevenue(user, today);

        // --- Recent sales (last 5) ---
        List<Sale> recentSaleEntities = saleRepository.findRecentSales(user, PageRequest.of(0, 5));
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        List<DashboardResponse.RecentSaleDTO> recentSales = recentSaleEntities.stream()
                .map(s -> DashboardResponse.RecentSaleDTO.builder()
                        .id(s.getId())
                        .customerName(s.getCustomer() != null ? s.getCustomer().getName() : "Walk-in")
                        .amount(s.getTotalAmount())
                        .paymentStatus(s.getPaymentStatus().name())
                        .createdAt(s.getCreatedAt().format(dtf))
                        .build())
                .collect(Collectors.toList());

        // --- Top 5 products (current month) ---
        List<Object[]> topProductRows = saleRepository.getTopSellingProducts(
                user, monthStart, endOfDay, PageRequest.of(0, 5));
        List<DashboardResponse.TopProductDTO> topProducts = topProductRows.stream()
                .map(row -> DashboardResponse.TopProductDTO.builder()
                        .name((String) row[0])
                        .unitsSold(((Number) row[1]).longValue())
                        .revenue((BigDecimal) row[2])
                        .build())
                .collect(Collectors.toList());

        // --- Top 5 customers (all time) ---
        List<Object[]> topCustomerRows = customerRepository.getTopCustomers(user, PageRequest.of(0, 5));
        List<DashboardResponse.TopCustomerDTO> topCustomers = topCustomerRows.stream()
                .map(row -> DashboardResponse.TopCustomerDTO.builder()
                        .name((String) row[0])
                        .totalPurchases((BigDecimal) row[1])
                        .debtBalance((BigDecimal) row[2])
                        .build())
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .dailyRevenue(dailyRevenue)
                .weeklyRevenue(weeklyRevenue)
                .monthlyRevenue(monthlyRevenue)
                .previousMonthRevenue(previousMonthRevenue)
                .totalOutstandingDebt(totalDebt)
                .lowStockCount(lowStockCount)
                .totalProducts(totalProducts)
                .totalCustomers(totalCustomers)
                .totalSalesToday(totalSalesToday)
                .totalSalesThisMonth(totalSalesThisMonth)
                .monthlyRevenueData(monthlyRevenueData)
                .dailyRevenueData(dailyRevenueData)
                .recentSales(recentSales)
                .topProducts(topProducts)
                .topCustomers(topCustomers)
                .build();
    }

    private List<DashboardResponse.MonthlyRevenueDTO> buildMonthlyRevenue(User user, LocalDate today) {
        List<DashboardResponse.MonthlyRevenueDTO> data = new ArrayList<>();
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM yyyy");

        for (int i = 11; i >= 0; i--) {
            LocalDate monthDate = today.minusMonths(i).withDayOfMonth(1);
            LocalDateTime start = monthDate.atStartOfDay();
            LocalDateTime end = monthDate.plusMonths(1).atStartOfDay();
            BigDecimal revenue = saleRepository.getRevenueBetween(user, start, end);
            data.add(DashboardResponse.MonthlyRevenueDTO.builder()
                    .month(monthDate.format(monthFmt))
                    .revenue(revenue)
                    .build());
        }
        return data;
    }

    private List<DashboardResponse.DailyRevenueDTO> buildDailyRevenue(User user, LocalDate today) {
        List<DashboardResponse.DailyRevenueDTO> data = new ArrayList<>();
        LocalDate firstOfMonth = today.withDayOfMonth(1);

        for (LocalDate date = firstOfMonth; !date.isAfter(today); date = date.plusDays(1)) {
            LocalDateTime start = date.atStartOfDay();
            LocalDateTime end = start.plusDays(1);
            BigDecimal revenue = saleRepository.getRevenueBetween(user, start, end);
            data.add(DashboardResponse.DailyRevenueDTO.builder()
                    .day(String.valueOf(date.getDayOfMonth()))
                    .revenue(revenue)
                    .build());
        }
        return data;
    }
}
