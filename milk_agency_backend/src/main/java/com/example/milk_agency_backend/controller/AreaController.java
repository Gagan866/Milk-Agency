package com.example.milk_agency_backend.controller;

import com.example.milk_agency_backend.entity.Area;
import com.example.milk_agency_backend.service.AreaService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/areas")
public class AreaController {

    private final AreaService areaService;

    public AreaController(AreaService areaService) {
        this.areaService = areaService;
    }

    @PostMapping
    public Area createArea(@Valid @RequestBody AreaRequest request) {
        return areaService.createArea(request.name());
    }

    @GetMapping
    public List<Area> getAllAreas() {
        return areaService.getAllAreas();
    }

    @PutMapping("/{id}")
    public Area updateArea(@PathVariable Long id, @Valid @RequestBody AreaRequest request) {
        return areaService.updateArea(id, request.name());
    }

    public record AreaRequest(@NotBlank String name) {
    }
}
