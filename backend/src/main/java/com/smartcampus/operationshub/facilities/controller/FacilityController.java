package com.smartcampus.operationshub.facilities.controller;

import com.smartcampus.operationshub.facilities.entity.Facility;
import com.smartcampus.operationshub.facilities.entity.FacilityType;
import com.smartcampus.operationshub.facilities.service.FacilityService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import java.net.URI;
import java.util.List;
import java.util.Objects;
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
    public ResponseEntity<List<Facility>> getAllFacilities(
            @RequestParam(required = false) FacilityType type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @Min(1) Integer minCapacity) {

        List<Facility> facilities = facilityService.getAllFacilities(type, location, minCapacity);
        return ResponseEntity.ok(facilities);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Facility> getFacilityById(@PathVariable Long id) {
        return ResponseEntity.ok(facilityService.getFacilityById(id));
    }

    @PostMapping
    public ResponseEntity<Facility> createFacility(@Valid @RequestBody Facility facility) {
        Facility createdFacility = facilityService.createFacility(facility);
        URI location = URI.create("/api/v1/facilities/" + createdFacility.getId());
        return ResponseEntity
                .created(Objects.requireNonNull(location, "location URI must not be null"))
                .body(createdFacility);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Facility> updateFacility(@PathVariable Long id, @Valid @RequestBody Facility facility) {
        return ResponseEntity.ok(facilityService.updateFacility(id, facility));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFacility(@PathVariable Long id) {
        facilityService.deleteFacility(id);
        return ResponseEntity.noContent().build();
    }
}
