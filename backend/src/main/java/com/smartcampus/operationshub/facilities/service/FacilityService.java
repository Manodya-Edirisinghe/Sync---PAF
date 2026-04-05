package com.smartcampus.operationshub.facilities.service;

import com.smartcampus.operationshub.facilities.dto.FacilityRequestDto;
import com.smartcampus.operationshub.facilities.dto.FacilityResponseDto;
import com.smartcampus.operationshub.facilities.entity.Facility;
import com.smartcampus.operationshub.facilities.entity.FacilityStatus;
import com.smartcampus.operationshub.facilities.entity.FacilityType;
import com.smartcampus.operationshub.facilities.exception.FacilityNotFoundException;
import com.smartcampus.operationshub.facilities.repository.FacilityRepository;
import java.util.List;
import java.util.Objects;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional
public class FacilityService {

    private final FacilityRepository facilityRepository;

    public FacilityService(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

    @Transactional(readOnly = true)
    public List<FacilityResponseDto> getAllFacilities(FacilityType type, String location, Integer minCapacity) {
        String normalizedLocation = StringUtils.hasText(location) ? location.trim() : null;
        return facilityRepository.search(type, minCapacity, normalizedLocation)
                .stream()
                .map(FacilityResponseDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public FacilityResponseDto getFacilityById(Long id) {
        Facility facility = findOrThrow(id);
        return FacilityResponseDto.fromEntity(facility);
    }

    public FacilityResponseDto createFacility(FacilityRequestDto dto) {
        Facility facility = new Facility();
        applyDto(facility, dto);
        if (facility.getStatus() == null) {
            facility.setStatus(FacilityStatus.ACTIVE);
        }
        Facility saved = facilityRepository.save(facility);
        return FacilityResponseDto.fromEntity(saved);
    }

    public FacilityResponseDto updateFacility(Long id, FacilityRequestDto dto) {
        Facility facility = findOrThrow(id);
        applyDto(facility, dto);
        Facility saved = facilityRepository.save(facility);
        return FacilityResponseDto.fromEntity(saved);
    }

    public void deleteFacility(Long id) {
        Facility facility = findOrThrow(id);
        facilityRepository.delete(facility);
    }

    private Facility findOrThrow(Long id) {
        Objects.requireNonNull(id, "id must not be null");
        return facilityRepository.findById(id)
                .orElseThrow(() -> new FacilityNotFoundException(id));
    }

    private void applyDto(Facility facility, FacilityRequestDto dto) {
        facility.setName(dto.getName() != null ? dto.getName().trim() : null);
        facility.setType(dto.getType());
        facility.setCapacity(dto.getCapacity());
        facility.setLocation(dto.getLocation() != null ? dto.getLocation().trim() : null);
        facility.setAvailabilityWindows(dto.getAvailabilityWindows());
        if (dto.getStatus() != null) {
            facility.setStatus(dto.getStatus());
        }
    }
}
