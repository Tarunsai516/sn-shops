package com.snshops.service;

import com.snshops.dto.CustomerRequest;
import com.snshops.dto.CustomerResponse;
import com.snshops.entity.Customer;
import com.snshops.entity.User;
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

    public Page<CustomerResponse> getAllCustomers(User user, String search, Pageable pageable) {
        Page<Customer> customers;
        if (search != null && !search.trim().isEmpty()) {
            customers = customerRepository.searchCustomers(user, search.trim(), pageable);
        } else {
            customers = customerRepository.findAllByUser(user, pageable);
        }
        return customers.map(this::mapToResponse);
    }

    public CustomerResponse getCustomerById(User user, Long id) {
        Customer customer = findCustomerOrThrow(user, id);
        return mapToResponse(customer);
    }

    @Transactional
    public CustomerResponse createCustomer(User user, CustomerRequest request) {
        if (request.getPhone() != null && !request.getPhone().isBlank()
                && customerRepository.existsByPhoneAndUser(request.getPhone(), user)) {
            throw new DuplicateResourceException("Customer with phone '" + request.getPhone() + "' already exists");
        }

        Customer customer = Customer.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .totalDebtBalance(BigDecimal.ZERO)
                .user(user)
                .build();

        customer = customerRepository.save(customer);
        return mapToResponse(customer);
    }

    @Transactional
    public CustomerResponse updateCustomer(User user, Long id, CustomerRequest request) {
        Customer customer = findCustomerOrThrow(user, id);
        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer = customerRepository.save(customer);
        return mapToResponse(customer);
    }

    public Customer findCustomerOrThrow(User user, Long id) {
        return customerRepository.findByIdAndUser(id, user)
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
