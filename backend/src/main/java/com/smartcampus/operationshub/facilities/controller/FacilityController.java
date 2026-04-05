package com.smartcampus.operationshub.facilities.controller;

import com.smartcampus.operationshub.facilities.dto.FacilityRequestDto;
import com.smartcampus.operationshub.facilities.dto.FacilityResponseDto;
import com.smartcampus.operationshub.facilities.entity.FacilityType;
import com.smartcampus.operationshub.facilities.service.FacilityService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/facilities")
@Validated
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @GetMapping
    public ResponseEntity<List<FacilityResponseDto>> getAllFacilities(
            @RequestParam(required = false) FacilityType type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @Min(1) Integer minCapacity) {

        List<FacilityResponseDto> facilities = facilityService.getAllFacilities(type, location, minCapacity);
        return ResponseEntity.ok(facilities);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacilityResponseDto> getFacilityById(@PathVariable Long id) {
        return ResponseEntity.ok(facilityService.getFacilityById(id));
    }

    @PostMapping
    public ResponseEntity<FacilityResponseDto> createFacility(@Valid @RequestBody FacilityRequestDto dto) {
        FacilityResponseDto created = facilityService.createFacility(dto);
        URI location = URI.create("/api/v1/facilities/" + created.getId());
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FacilityResponseDto> updateFacility(
            @PathVariable Long id,
            @Valid @RequestBody FacilityRequestDto dto) {
        return ResponseEntity.ok(facilityService.updateFacility(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFacility(@PathVariable Long id) {
        facilityService.deleteFacility(id);
        return ResponseEntity.noContent().build();
    }
}
