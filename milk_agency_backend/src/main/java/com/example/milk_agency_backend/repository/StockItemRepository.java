package com.example.milk_agency_backend.repository;

import com.example.milk_agency_backend.entity.StockItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockItemRepository extends JpaRepository<StockItem, Long> {
}
