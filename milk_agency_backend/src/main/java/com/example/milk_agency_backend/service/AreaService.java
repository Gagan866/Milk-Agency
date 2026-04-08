package com.example.milk_agency_backend.service;

import com.example.milk_agency_backend.entity.Area;
import com.example.milk_agency_backend.repository.AreaRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AreaService {

    private final AreaRepository areaRepository;

    public AreaService(AreaRepository areaRepository) {
        this.areaRepository = areaRepository;
    }

    @Transactional
    public Area createArea(String name) {
        Area area = new Area();
        area.setName(name);
        return areaRepository.save(area);
    }

    @Transactional(readOnly = true)
    public List<Area> getAllAreas() {
        return areaRepository.findAll();
    }

    @Transactional
    public Area updateArea(Long id, String name) {
        Area area = areaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Area not found with id: " + id));

        area.setName(name);
        return areaRepository.save(area);
    }
}
