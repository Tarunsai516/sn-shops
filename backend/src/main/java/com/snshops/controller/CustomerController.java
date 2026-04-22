package com.snshops.controller;

import com.snshops.dto.CustomerRequest;
import com.snshops.dto.CustomerResponse;
import com.snshops.dto.PaymentResponse;
import com.snshops.dto.SaleResponse;
import com.snshops.entity.User;
import com.snshops.service.CustomerService;
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
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final SaleService saleService;
    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<Page<CustomerResponse>> getAllCustomers(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
                customerService.getAllCustomers(user, search, PageRequest.of(page, size, Sort.by("name")))
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(customerService.getCustomerById(user, id));
    }

    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CustomerRequest request
    ) {
        return new ResponseEntity<>(customerService.createCustomer(user, request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request
    ) {
        return ResponseEntity.ok(customerService.updateCustomer(user, id, request));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<Page<SaleResponse>> getCustomerHistory(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
                saleService.getSalesByCustomer(user, id, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
        );
    }

    @GetMapping("/{id}/payments")
    public ResponseEntity<Page<PaymentResponse>> getCustomerPayments(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(
                paymentService.getPaymentsByCustomer(user, id, PageRequest.of(page, size))
        );
    }
}
