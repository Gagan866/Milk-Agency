package com.example.milk_agency_backend.service;

import com.example.milk_agency_backend.entity.Area;
import com.example.milk_agency_backend.entity.Customer;
import com.example.milk_agency_backend.entity.CustomerType;
import com.example.milk_agency_backend.repository.AreaRepository;
import com.example.milk_agency_backend.repository.CustomerRepository;
import com.example.milk_agency_backend.repository.CustomerTypeRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerTypeRepository customerTypeRepository;
    private final AreaRepository areaRepository;

    public CustomerService(
        CustomerRepository customerRepository,
        CustomerTypeRepository customerTypeRepository,
        AreaRepository areaRepository
    ) {
        this.customerRepository = customerRepository;
        this.customerTypeRepository = customerTypeRepository;
        this.areaRepository = areaRepository;
    }

    @Transactional
    public Customer createCustomer(String name, Long customerTypeId, Long areaId) {
        CustomerType customerType = customerTypeRepository.findById(customerTypeId)
            .orElseThrow(() -> new RuntimeException("CustomerType not found with id: " + customerTypeId));

        Area area = areaRepository.findById(areaId)
            .orElseThrow(() -> new RuntimeException("Area not found with id: " + areaId));

        Customer customer = new Customer();
        customer.setName(name);
        customer.setCustomerType(customerType);
        customer.setArea(area);
        return customerRepository.save(customer);
    }

    @Transactional(readOnly = true)
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @Transactional
    public Customer updateCustomer(Long id, String name, Long customerTypeId, Long areaId) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));

        CustomerType customerType = customerTypeRepository.findById(customerTypeId)
            .orElseThrow(() -> new RuntimeException("CustomerType not found with id: " + customerTypeId));

        Area area = areaRepository.findById(areaId)
            .orElseThrow(() -> new RuntimeException("Area not found with id: " + areaId));

        customer.setName(name);
        customer.setCustomerType(customerType);
        customer.setArea(area);
        return customerRepository.save(customer);
    }
}
