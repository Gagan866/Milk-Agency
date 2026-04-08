package com.example.milk_agency_backend.service;

import com.example.milk_agency_backend.entity.Brand;
import com.example.milk_agency_backend.entity.Product;
import com.example.milk_agency_backend.repository.BrandRepository;
import com.example.milk_agency_backend.repository.ProductRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;

    public ProductService(ProductRepository productRepository, BrandRepository brandRepository) {
        this.productRepository = productRepository;
        this.brandRepository = brandRepository;
    }

    @Transactional
    public Product createProduct(String name, Long brandId) {
        Brand brand = brandRepository.findById(brandId)
            .orElseThrow(() -> new RuntimeException("Brand not found with id: " + brandId));

        Product product = new Product();
        product.setName(name);
        product.setBrand(brand);
        return productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Transactional
    public Product updateProduct(Long id, String name, Long brandId) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        Brand brand = brandRepository.findById(brandId)
            .orElseThrow(() -> new RuntimeException("Brand not found with id: " + brandId));

        product.setName(name);
        product.setBrand(brand);
        return productRepository.save(product);
    }
}
