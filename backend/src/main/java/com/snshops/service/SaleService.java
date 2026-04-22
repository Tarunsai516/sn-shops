package com.snshops.service;

import com.snshops.dto.SaleRequest;
import com.snshops.dto.SaleResponse;
import com.snshops.entity.*;
import com.snshops.enums.PaymentStatus;
import com.snshops.exception.BadRequestException;
import com.snshops.exception.InsufficientStockException;
import com.snshops.exception.ResourceNotFoundException;
import com.snshops.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    @Transactional
    public SaleResponse createSale(User user, SaleRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Sale must contain at least one item");
        }

        // Resolve customer (optional for walk-in) — must belong to same user
        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findByIdAndUser(request.getCustomerId(), user)
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
        }

        // Build sale items and calculate total
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<SaleItem> saleItems = new ArrayList<>();

        for (SaleRequest.SaleItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findByIdAndUser(itemReq.getProductId(), user)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + itemReq.getProductId()));

            if (!product.getIsActive()) {
                throw new BadRequestException("Product '" + product.getName() + "' is no longer available");
            }

            // Check stock availability
            if (product.getStockQty() < itemReq.getQuantity()) {
                throw new InsufficientStockException(
                        "Insufficient stock for '" + product.getName() + "'. Available: " +
                        product.getStockQty() + ", Requested: " + itemReq.getQuantity());
            }

            // Deduct stock
            product.setStockQty(product.getStockQty() - itemReq.getQuantity());
            productRepository.save(product);

            // Create sale item with price snapshot
            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);

            SaleItem saleItem = SaleItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .unitPriceAtSale(product.getPrice())
                    .build();
            saleItems.add(saleItem);
        }

        // Calculate payment
        BigDecimal amountPaid = request.getAmountPaid() != null ? request.getAmountPaid() : BigDecimal.ZERO;

        if (amountPaid.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Amount paid cannot be negative");
        }
        if (amountPaid.compareTo(totalAmount) > 0) {
            throw new BadRequestException("Amount paid cannot exceed total amount");
        }

        BigDecimal balanceDue = totalAmount.subtract(amountPaid);
        PaymentStatus paymentStatus = calculatePaymentStatus(amountPaid, totalAmount);

        // Debt validation: walk-in customers cannot have debt
        if (customer == null && balanceDue.compareTo(BigDecimal.ZERO) > 0) {
            throw new BadRequestException("Walk-in customers cannot have outstanding debt. Full payment required.");
        }

        // Create sale — assigned to user
        Sale sale = Sale.builder()
                .user(user)
                .customer(customer)
                .totalAmount(totalAmount)
                .amountPaid(amountPaid)
                .balanceDue(balanceDue)
                .paymentStatus(paymentStatus)
                .createdAt(LocalDateTime.now())
                .build();

        sale = saleRepository.save(sale);

        // Link items to sale
        for (SaleItem item : saleItems) {
            item.setSale(sale);
        }
        sale.setItems(saleItems);
        sale = saleRepository.save(sale);

        // Update customer debt balance
        if (customer != null && balanceDue.compareTo(BigDecimal.ZERO) > 0) {
            customer.setTotalDebtBalance(customer.getTotalDebtBalance().add(balanceDue));
            customerRepository.save(customer);
        }

        return mapToResponse(sale);
    }

    public Page<SaleResponse> getAllSales(User user, Pageable pageable) {
        return saleRepository.findAllByUser(user, pageable).map(this::mapToResponse);
    }

    public SaleResponse getSaleById(User user, Long id) {
        Sale sale = saleRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
        return mapToResponse(sale);
    }

    public Page<SaleResponse> getSalesByCustomer(User user, Long customerId, Pageable pageable) {
        return saleRepository.findByUserAndCustomerId(user, customerId, pageable).map(this::mapToResponse);
    }

    public Page<SaleResponse> getDebtSales(User user, Pageable pageable) {
        List<PaymentStatus> debtStatuses = List.of(PaymentStatus.UNPAID, PaymentStatus.PARTIAL);
        return saleRepository.findByUserAndPaymentStatusIn(user, debtStatuses, pageable).map(this::mapToResponse);
    }

    private PaymentStatus calculatePaymentStatus(BigDecimal amountPaid, BigDecimal totalAmount) {
        if (amountPaid.compareTo(totalAmount) >= 0) {
            return PaymentStatus.PAID;
        } else if (amountPaid.compareTo(BigDecimal.ZERO) > 0) {
            return PaymentStatus.PARTIAL;
        } else {
            return PaymentStatus.UNPAID;
        }
    }

    private SaleResponse mapToResponse(Sale sale) {
        List<SaleResponse.SaleItemResponse> itemResponses = sale.getItems().stream()
                .map(item -> SaleResponse.SaleItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .unitPriceAtSale(item.getUnitPriceAtSale())
                        .lineTotal(item.getUnitPriceAtSale().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build())
                .toList();

        return SaleResponse.builder()
                .id(sale.getId())
                .customerId(sale.getCustomer() != null ? sale.getCustomer().getId() : null)
                .customerName(sale.getCustomer() != null ? sale.getCustomer().getName() : "Walk-in")
                .totalAmount(sale.getTotalAmount())
                .amountPaid(sale.getAmountPaid())
                .balanceDue(sale.getBalanceDue())
                .paymentStatus(sale.getPaymentStatus())
                .createdAt(sale.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
