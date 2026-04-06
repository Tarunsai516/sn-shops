package com.snshops.service;

import com.snshops.dto.ProductRequest;
import com.snshops.dto.ProductResponse;
import com.snshops.entity.Product;
import com.snshops.exception.DuplicateResourceException;
import com.snshops.exception.ResourceNotFoundException;
import com.snshops.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductResponse> getAllProducts(String search, Pageable pageable) {
        Page<Product> products;
        if (search != null && !search.trim().isEmpty()) {
            products = productRepository.searchProducts(search.trim(), pageable);
        } else {
            products = productRepository.findByIsActiveTrue(pageable);
        }
        return products.map(this::mapToResponse);
    }

    public ProductResponse getProductById(Long id) {
        Product product = findProductOrThrow(id);
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (request.getSku() != null && !request.getSku().isBlank()
                && productRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("Product with SKU '" + request.getSku() + "' already exists");
        }

        Product product = Product.builder()
                .name(request.getName())
                .sku(request.getSku())
                .category(request.getCategory())
                .price(request.getPrice())
                .stockQty(request.getStockQty())
                .lowStockThreshold(request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 10)
                .isActive(true)
                .build();

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findProductOrThrow(id);

        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setStockQty(request.getStockQty());
        if (request.getLowStockThreshold() != null) {
            product.setLowStockThreshold(request.getLowStockThreshold());
        }

        product = productRepository.save(product);
        return mapToResponse(product);
    }

    @Transactional
    public void softDeleteProduct(Long id) {
        Product product = findProductOrThrow(id);
        product.setIsActive(false);
        productRepository.save(product);
    }

    public List<ProductResponse> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(this::mapToResponse)
                .toList();
    }

    private Product findProductOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .category(product.getCategory())
                .price(product.getPrice())
                .stockQty(product.getStockQty())
                .lowStockThreshold(product.getLowStockThreshold())
                .isActive(product.getIsActive())
                .lowStock(product.getStockQty() <= product.getLowStockThreshold())
                .build();
    }
}
