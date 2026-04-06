package com.snshops.service;

import com.snshops.dto.CustomerRequest;
import com.snshops.dto.CustomerResponse;
import com.snshops.entity.Customer;
import com.snshops.exception.DuplicateResourceException;
import com.snshops.exception.ResourceNotFoundException;
import com.snshops.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public Page<CustomerResponse> getAllCustomers(String search, Pageable pageable) {
        Page<Customer> customers;
        if (search != null && !search.trim().isEmpty()) {
            customers = customerRepository.searchCustomers(search.trim(), pageable);
        } else {
            customers = customerRepository.findAll(pageable);
        }
        return customers.map(this::mapToResponse);
    }

    public CustomerResponse getCustomerById(Long id) {
        Customer customer = findCustomerOrThrow(id);
        return mapToResponse(customer);
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        if (request.getPhone() != null && !request.getPhone().isBlank()
                && customerRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Customer with phone '" + request.getPhone() + "' already exists");
        }

        Customer customer = Customer.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .totalDebtBalance(BigDecimal.ZERO)
                .build();

        customer = customerRepository.save(customer);
        return mapToResponse(customer);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = findCustomerOrThrow(id);
        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer = customerRepository.save(customer);
        return mapToResponse(customer);
    }

    public Customer findCustomerOrThrow(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    private CustomerResponse mapToResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .totalDebtBalance(customer.getTotalDebtBalance())
                .createdAt(customer.getCreatedAt())
                .build();
    }
}
