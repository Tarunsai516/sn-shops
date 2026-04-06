package com.snshops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long saleId;
    private Long customerId;
    private String customerName;
    private BigDecimal amountPaid;
    private LocalDateTime paymentDate;
    private BigDecimal saleBalanceAfter;
}
