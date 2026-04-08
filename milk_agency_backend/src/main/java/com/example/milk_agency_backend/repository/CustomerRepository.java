package com.example.milk_agency_backend.repository;

import com.example.milk_agency_backend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
}
