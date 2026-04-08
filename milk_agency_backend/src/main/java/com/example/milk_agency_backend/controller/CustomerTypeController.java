package com.example.milk_agency_backend.controller;

import com.example.milk_agency_backend.entity.CustomerType;
import com.example.milk_agency_backend.service.CustomerTypeService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customer-types")
public class CustomerTypeController {

    private final CustomerTypeService customerTypeService;

    public CustomerTypeController(CustomerTypeService customerTypeService) {
        this.customerTypeService = customerTypeService;
    }

    @PostMapping
    public CustomerType createCustomerType(@Valid @RequestBody CustomerTypeRequest request) {
        return customerTypeService.createCustomerType(request.name());
    }

    @GetMapping
    public List<CustomerType> getAllCustomerTypes() {
        return customerTypeService.getAllCustomerTypes();
    }

    @PutMapping("/{id}")
    public CustomerType updateCustomerType(@PathVariable Long id, @Valid @RequestBody CustomerTypeRequest request) {
        return customerTypeService.updateCustomerType(id, request.name());
    }

    public record CustomerTypeRequest(@NotBlank String name) {
    }
}
