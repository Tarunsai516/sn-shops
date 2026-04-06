package com.snshops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
public class DashboardResponse {
    private BigDecimal dailyRevenue;
    private BigDecimal totalOutstandingDebt;
    private long lowStockCount;
    private long totalProducts;
    private long totalCustomers;
    private long totalSalesToday;
}
