package com.smartcampus.operationshub.facilities.service;

import com.smartcampus.operationshub.facilities.dto.FacilityRequestDto;
import com.smartcampus.operationshub.facilities.dto.FacilityResponseDto;
import com.smartcampus.operationshub.facilities.entity.FacilityStatus;
import com.smartcampus.operationshub.facilities.entity.FacilityType;
import java.util.List;

public interface FacilityService {

    List<FacilityResponseDto> getAllFacilities();

    List<FacilityResponseDto> searchFacilities(FacilityType type, String location, Integer minCapacity);

    FacilityResponseDto getFacilityById(Long id);

    FacilityResponseDto createFacility(FacilityRequestDto dto);

    FacilityResponseDto updateFacility(Long id, FacilityRequestDto dto);

    FacilityResponseDto updateFacilityStatus(Long id, FacilityStatus status);

    void deleteFacility(Long id);
}
