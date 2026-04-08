package com.example.milk_agency_backend.controller;

import com.example.milk_agency_backend.dto.StockItemRequest;
import com.example.milk_agency_backend.entity.Stock;
import com.example.milk_agency_backend.service.StockService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @PostMapping
    public Stock createStock(@Valid @RequestBody StockRequest request) {
        return stockService.createStock(request.date(), request.items());
    }

    @GetMapping
    public List<Stock> getAllStocks() {
        return stockService.getAllStocks();
    }

    @GetMapping("/{date}")
    public Stock getStockByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return stockService.getAllStocks().stream()
            .filter(stock -> stock.getDate().equals(date))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Stock not found for date: " + date));
    }

    @PutMapping("/{date}")
    public Stock updateStock(
        @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @Valid @RequestBody UpdateStockRequest request
    ) {
        return stockService.updateStock(date, request.items());
    }

    public record StockRequest(@NotNull LocalDate date, @NotEmpty List<@Valid StockItemRequest> items) {
    }

    public record UpdateStockRequest(@NotEmpty List<@Valid StockItemRequest> items) {
    }
}
