package com.example.milk_agency_backend.repository;

import com.example.milk_agency_backend.entity.CustomerType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerTypeRepository extends JpaRepository<CustomerType, Long> {
}
