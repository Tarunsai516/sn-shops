package com.snshops.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class SaleRequest {

    private Long customerId;

    private String paymentMethod; // CASH or UPI

    @NotNull(message = "Amount paid is required")
    @Min(value = 0, message = "Amount paid must be non-negative")
    private BigDecimal amountPaid;

    @NotNull(message = "Sale items are required")
    @Valid
    private List<SaleItemRequest> items;

    @Data
    public static class SaleItemRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}
