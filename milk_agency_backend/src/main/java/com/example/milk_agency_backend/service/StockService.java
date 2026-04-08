package com.example.milk_agency_backend.service;

import com.example.milk_agency_backend.dto.StockItemRequest;
import com.example.milk_agency_backend.entity.Product;
import com.example.milk_agency_backend.entity.Stock;
import com.example.milk_agency_backend.entity.StockItem;
import com.example.milk_agency_backend.repository.ProductRepository;
import com.example.milk_agency_backend.repository.StockRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StockService {

    private final StockRepository stockRepository;
    private final ProductRepository productRepository;

    public StockService(StockRepository stockRepository, ProductRepository productRepository) {
        this.stockRepository = stockRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Stock createStock(LocalDate date, List<StockItemRequest> items) {
        stockRepository.findByDate(date).ifPresent(existing -> {
            throw new RuntimeException("Stock already exists for date: " + date);
        });

        Stock stock = new Stock();
        stock.setDate(date);

        for (StockItemRequest itemRequest : items) {
            Product product = productRepository.findById(itemRequest.productId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemRequest.productId()));

            int totalQuantity = itemRequest.oldQuantity() + itemRequest.newQuantity();

            StockItem stockItem = new StockItem();
            stockItem.setStock(stock);
            stockItem.setProduct(product);
            stockItem.setOldQuantity(itemRequest.oldQuantity());
            stockItem.setNewQuantity(itemRequest.newQuantity());
            stockItem.setQuantity(totalQuantity);

            stock.getStockItems().add(stockItem);
        }

        return stockRepository.save(stock);
    }

    @Transactional(readOnly = true)
    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }

    @Transactional
    public Stock updateStock(LocalDate date, List<StockItemRequest> items) {
        Stock stock = stockRepository.findByDate(date)
            .orElseThrow(() -> new RuntimeException("Stock not found for date: " + date));

        for (StockItemRequest itemRequest : items) {
            int totalQuantity = itemRequest.oldQuantity() + itemRequest.newQuantity();

            StockItem existingStockItem = stock.getStockItems().stream()
                .filter(stockItem -> stockItem.getProduct().getId().equals(itemRequest.productId()))
                .findFirst()
                .orElse(null);

            if (existingStockItem != null) {
                existingStockItem.setOldQuantity(itemRequest.oldQuantity());
                existingStockItem.setNewQuantity(itemRequest.newQuantity());
                existingStockItem.setQuantity(totalQuantity);
                continue;
            }

            Product product = productRepository.findById(itemRequest.productId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemRequest.productId()));

            StockItem stockItem = new StockItem();
            stockItem.setStock(stock);
            stockItem.setProduct(product);
            stockItem.setOldQuantity(itemRequest.oldQuantity());
            stockItem.setNewQuantity(itemRequest.newQuantity());
            stockItem.setQuantity(totalQuantity);

            stock.getStockItems().add(stockItem);
        }

        return stockRepository.save(stock);
    }
}
