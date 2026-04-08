package com.example.milk_agency_backend.repository;

import com.example.milk_agency_backend.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository extends JpaRepository<Brand, Long> {
}
