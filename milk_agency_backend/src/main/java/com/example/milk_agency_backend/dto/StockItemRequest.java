package com.example.milk_agency_backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StockItemRequest(
    @NotNull Long productId,
    @NotNull @Min(0) Integer oldQuantity,
    @NotNull @Min(0) Integer newQuantity
) {
}
