package com.snshops.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String sku;
    private String category;
    private BigDecimal price;
    private Integer stockQty;
    private Integer lowStockThreshold;
    private Boolean isActive;
    private Boolean lowStock;
}
