package com.example.milk_agency_backend.service;

import com.example.milk_agency_backend.entity.CustomerType;
import com.example.milk_agency_backend.repository.CustomerTypeRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerTypeService {

    private final CustomerTypeRepository customerTypeRepository;

    public CustomerTypeService(CustomerTypeRepository customerTypeRepository) {
        this.customerTypeRepository = customerTypeRepository;
    }

    @Transactional
    public CustomerType createCustomerType(String name) {
        CustomerType customerType = new CustomerType();
        customerType.setName(name);
        return customerTypeRepository.save(customerType);
    }

    @Transactional(readOnly = true)
    public List<CustomerType> getAllCustomerTypes() {
        return customerTypeRepository.findAll();
    }

    @Transactional
    public CustomerType updateCustomerType(Long id, String name) {
        CustomerType customerType = customerTypeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("CustomerType not found with id: " + id));

        customerType.setName(name);
        return customerTypeRepository.save(customerType);
    }
}
