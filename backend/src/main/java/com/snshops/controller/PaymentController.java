package com.snshops.controller;

import com.snshops.dto.PaymentRequest;
import com.snshops.dto.PaymentResponse;
import com.snshops.dto.SaleResponse;
import com.snshops.entity.User;
import com.snshops.service.PaymentService;
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
@RequestMapping("/api")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final SaleService saleService;

    @PostMapping("/payments")
    public ResponseEntity<PaymentResponse> recordPayment(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PaymentRequest request
    ) {
        return new ResponseEntity<>(paymentService.recordPayment(user, request), HttpStatus.CREATED);
    }

    @GetMapping("/payments/history")
    public ResponseEntity<Page<PaymentResponse>> getPaymentHistory(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(paymentService.getPaymentHistory(user, PageRequest.of(page, size)));
    }

    @GetMapping("/debts")
    public ResponseEntity<Page<SaleResponse>> getDebts(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
                saleService.getDebtSales(user, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
        );
    }
}
