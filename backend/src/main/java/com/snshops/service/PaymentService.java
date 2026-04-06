package com.snshops.service;

import com.snshops.dto.PaymentRequest;
import com.snshops.dto.PaymentResponse;
import com.snshops.entity.Customer;
import com.snshops.entity.Payment;
import com.snshops.entity.Sale;
import com.snshops.enums.PaymentStatus;
import com.snshops.exception.BadRequestException;
import com.snshops.exception.ResourceNotFoundException;
import com.snshops.repository.CustomerRepository;
import com.snshops.repository.PaymentRepository;
import com.snshops.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;

    @Transactional
    public PaymentResponse recordPayment(PaymentRequest request) {
        Sale sale = saleRepository.findById(request.getSaleId())
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + request.getSaleId()));

        if (sale.getCustomer() == null) {
            throw new BadRequestException("Cannot record payment for a walk-in sale");
        }

        if (sale.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("This sale is already fully paid");
        }

        BigDecimal paymentAmount = request.getAmountPaid();

        if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be positive");
        }

        if (paymentAmount.compareTo(sale.getBalanceDue()) > 0) {
            throw new BadRequestException(
                    "Payment amount (₹" + paymentAmount + ") exceeds balance due (₹" + sale.getBalanceDue() + ")");
        }

        // Update sale
        BigDecimal newAmountPaid = sale.getAmountPaid().add(paymentAmount);
        BigDecimal newBalanceDue = sale.getBalanceDue().subtract(paymentAmount);

        sale.setAmountPaid(newAmountPaid);
        sale.setBalanceDue(newBalanceDue);
        sale.setPaymentStatus(calculateRemainingBalance(newAmountPaid, sale.getTotalAmount()));
        saleRepository.save(sale);

        // Update customer debt balance
        Customer customer = sale.getCustomer();
        customer.setTotalDebtBalance(customer.getTotalDebtBalance().subtract(paymentAmount));

        // Guard against negative debt due to floating point
        if (customer.getTotalDebtBalance().compareTo(BigDecimal.ZERO) < 0) {
            customer.setTotalDebtBalance(BigDecimal.ZERO);
        }
        customerRepository.save(customer);

        // Record payment
        Payment payment = Payment.builder()
                .sale(sale)
                .customer(customer)
                .amountPaid(paymentAmount)
                .paymentDate(LocalDateTime.now())
                .build();

        payment = paymentRepository.save(payment);

        return mapToResponse(payment, newBalanceDue);
    }

    public Page<PaymentResponse> getPaymentHistory(Pageable pageable) {
        return paymentRepository.findAllByOrderByPaymentDateDesc(pageable)
                .map(p -> mapToResponse(p, p.getSale().getBalanceDue()));
    }

    public Page<PaymentResponse> getPaymentsByCustomer(Long customerId, Pageable pageable) {
        return paymentRepository.findByCustomerId(customerId, pageable)
                .map(p -> mapToResponse(p, p.getSale().getBalanceDue()));
    }

    private PaymentStatus calculateRemainingBalance(BigDecimal amountPaid, BigDecimal totalAmount) {
        if (amountPaid.compareTo(totalAmount) >= 0) {
            return PaymentStatus.PAID;
        } else if (amountPaid.compareTo(BigDecimal.ZERO) > 0) {
            return PaymentStatus.PARTIAL;
        }
        return PaymentStatus.UNPAID;
    }

    private PaymentResponse mapToResponse(Payment payment, BigDecimal saleBalanceAfter) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .saleId(payment.getSale().getId())
                .customerId(payment.getCustomer().getId())
                .customerName(payment.getCustomer().getName())
                .amountPaid(payment.getAmountPaid())
                .paymentDate(payment.getPaymentDate())
                .saleBalanceAfter(saleBalanceAfter)
                .build();
    }
}
