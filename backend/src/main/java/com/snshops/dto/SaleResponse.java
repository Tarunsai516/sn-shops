package com.snshops.dto;

import com.snshops.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class SaleResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private BigDecimal totalAmount;
    private BigDecimal amountPaid;
    private BigDecimal balanceDue;
    private PaymentStatus paymentStatus;
    private LocalDateTime createdAt;
    private List<SaleItemResponse> items;

    @Data
    @Builder
    @AllArgsConstructor
    public static class SaleItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal unitPriceAtSale;
        private BigDecimal lineTotal;
    }
}
