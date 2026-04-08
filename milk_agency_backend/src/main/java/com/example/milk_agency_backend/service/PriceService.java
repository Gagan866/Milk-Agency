package com.example.milk_agency_backend.service;

import com.example.milk_agency_backend.entity.CustomerType;
import com.example.milk_agency_backend.entity.Price;
import com.example.milk_agency_backend.entity.Product;
import com.example.milk_agency_backend.repository.CustomerTypeRepository;
import com.example.milk_agency_backend.repository.PriceRepository;
import com.example.milk_agency_backend.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PriceService {

    private final PriceRepository priceRepository;
    private final ProductRepository productRepository;
    private final CustomerTypeRepository customerTypeRepository;

    public PriceService(
        PriceRepository priceRepository,
        ProductRepository productRepository,
        CustomerTypeRepository customerTypeRepository
    ) {
        this.priceRepository = priceRepository;
        this.productRepository = productRepository;
        this.customerTypeRepository = customerTypeRepository;
    }

    @Transactional
    public Price createPrice(Long productId, Long customerTypeId, BigDecimal priceValue) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        CustomerType customerType = customerTypeRepository.findById(customerTypeId)
            .orElseThrow(() -> new RuntimeException("CustomerType not found with id: " + customerTypeId));

        priceRepository.findByProductIdAndCustomerTypeId(productId, customerTypeId)
            .ifPresent(existing -> {
                throw new RuntimeException(
                    "Price already exists for productId " + productId + " and customerTypeId " + customerTypeId
                );
            });

        Price price = new Price();
        price.setProduct(product);
        price.setCustomerType(customerType);
        price.setPrice(priceValue);
        return priceRepository.save(price);
    }

    @Transactional(readOnly = true)
    public List<Price> getAllPrices() {
        return priceRepository.findAll();
    }

    @Transactional
    public Price updatePrice(Long id, Long productId, Long customerTypeId, BigDecimal priceValue) {
        Price existingPrice = priceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Price not found with id: " + id));

        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found with id: " + productId));

        CustomerType customerType = customerTypeRepository.findById(customerTypeId)
            .orElseThrow(() -> new RuntimeException("CustomerType not found with id: " + customerTypeId));

        priceRepository.findByProductIdAndCustomerTypeId(productId, customerTypeId)
            .ifPresent(duplicate -> {
                if (!duplicate.getId().equals(id)) {
                    throw new RuntimeException(
                        "Price already exists for productId " + productId + " and customerTypeId " + customerTypeId
                    );
                }
            });

        existingPrice.setProduct(product);
        existingPrice.setCustomerType(customerType);
        existingPrice.setPrice(priceValue);
        return priceRepository.save(existingPrice);
    }
}
