package com.snshops.controller;

import com.snshops.dto.SaleRequest;
import com.snshops.dto.SaleResponse;
import com.snshops.entity.User;
import com.snshops.service.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    @PostMapping
    public ResponseEntity<SaleResponse> createSale(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody SaleRequest request
    ) {
        return new ResponseEntity<>(saleService.createSale(user, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<SaleResponse>> getAllSales(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
                saleService.getAllSales(user, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<SaleResponse> getSaleById(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(saleService.getSaleById(user, id));
    }
}
