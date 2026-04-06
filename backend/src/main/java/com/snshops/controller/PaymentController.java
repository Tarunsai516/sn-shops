package com.snshops.controller;

import com.snshops.dto.PaymentRequest;
import com.snshops.dto.PaymentResponse;
import com.snshops.dto.SaleResponse;
import com.snshops.service.PaymentService;
import com.snshops.service.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final SaleService saleService;

    @PostMapping("/payments")
    public ResponseEntity<PaymentResponse> recordPayment(@Valid @RequestBody PaymentRequest request) {
        return new ResponseEntity<>(paymentService.recordPayment(request), HttpStatus.CREATED);
    }

    @GetMapping("/payments/history")
    public ResponseEntity<Page<PaymentResponse>> getPaymentHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(paymentService.getPaymentHistory(PageRequest.of(page, size)));
    }

    @GetMapping("/debts")
    public ResponseEntity<Page<SaleResponse>> getDebts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
                saleService.getDebtSales(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
        );
    }
}
