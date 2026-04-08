package com.example.milk_agency_backend.controller;

import com.example.milk_agency_backend.entity.Price;
import com.example.milk_agency_backend.service.PriceService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/prices")
public class PriceController {

    private final PriceService priceService;

    public PriceController(PriceService priceService) {
        this.priceService = priceService;
    }

    @PostMapping
    public Price createPrice(@Valid @RequestBody PriceRequest request) {
        return priceService.createPrice(request.productId(), request.customerTypeId(), request.price());
    }

    @GetMapping
    public List<Price> getAllPrices() {
        return priceService.getAllPrices();
    }

    @PutMapping("/{id}")
    public Price updatePrice(@PathVariable Long id, @Valid @RequestBody PriceRequest request) {
        return priceService.updatePrice(id, request.productId(), request.customerTypeId(), request.price());
    }

    public record PriceRequest(@NotNull Long productId, @NotNull Long customerTypeId, @NotNull @Positive BigDecimal price) {
    }
}
