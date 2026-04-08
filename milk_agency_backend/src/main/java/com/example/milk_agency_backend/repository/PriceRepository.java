package com.example.milk_agency_backend.repository;

import com.example.milk_agency_backend.entity.Price;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceRepository extends JpaRepository<Price, Long> {

    Optional<Price> findByProductIdAndCustomerTypeId(Long productId, Long customerTypeId);
}
