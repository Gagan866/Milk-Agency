package com.example.milk_agency_backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record OrderRequest(
    @NotNull Long customerId,
    @NotNull LocalDate date,
    @NotEmpty List<@Valid OrderItemRequest> items
) {
}
