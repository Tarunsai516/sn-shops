package com.snshops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class DashboardResponse {
    private BigDecimal dailyRevenue;
    private BigDecimal weeklyRevenue;
    private BigDecimal monthlyRevenue;
    private BigDecimal previousMonthRevenue;
    private BigDecimal totalOutstandingDebt;
    private long lowStockCount;
    private long totalProducts;
    private long totalCustomers;
    private long totalSalesToday;
    private long totalSalesThisMonth;
    private List<MonthlyRevenueDTO> monthlyRevenueData;
    private List<DailyRevenueDTO> dailyRevenueData;
    private List<RecentSaleDTO> recentSales;
    private List<TopProductDTO> topProducts;
    private List<TopCustomerDTO> topCustomers;

    @Data
    @Builder
    @AllArgsConstructor
    public static class MonthlyRevenueDTO {
        private String month;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class DailyRevenueDTO {
        private String day;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class RecentSaleDTO {
        private Long id;
        private String customerName;
        private BigDecimal amount;
        private String paymentStatus;
        private String createdAt;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class TopProductDTO {
        private String name;
        private long unitsSold;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class TopCustomerDTO {
        private String name;
        private BigDecimal totalPurchases;
        private BigDecimal debtBalance;
    }
}
