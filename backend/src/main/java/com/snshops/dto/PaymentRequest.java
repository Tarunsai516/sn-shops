package com.snshops.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {
    @NotNull(message = "Sale ID is required")
    private Long saleId;

    @NotNull(message = "Amount paid is required")
    @Min(value = 1, message = "Payment amount must be at least 1")
    private BigDecimal amountPaid;
}
