package com.example.milk_agency_backend.repository;

import com.example.milk_agency_backend.entity.Stock;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findByDate(LocalDate date);
}
