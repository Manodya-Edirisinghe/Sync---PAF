package com.smartcampus.operationshub.facilities.service;

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
    public List<Facility> getAllFacilities(FacilityType type, String location, Integer minCapacity) {
        String normalizedLocation = StringUtils.hasText(location) ? location.trim() : null;
        return facilityRepository.search(type, minCapacity, normalizedLocation);
    }

    @Transactional(readOnly = true)
    public Facility getFacilityById(Long id) {
        Long facilityId = Objects.requireNonNull(id, "id must not be null");
        return facilityRepository.findById(facilityId)
                .orElseThrow(() -> new FacilityNotFoundException(id));
    }

    public Facility createFacility(Facility facility) {
        facility.setId(null);
        if (facility.getStatus() == null) {
            facility.setStatus(FacilityStatus.ACTIVE);
        }
        normalize(facility);
        return facilityRepository.save(facility);
    }

    public Facility updateFacility(Long id, Facility updatedFacility) {
        Facility existingFacility = getFacilityById(id);

        existingFacility.setName(updatedFacility.getName());
        existingFacility.setType(updatedFacility.getType());
        existingFacility.setCapacity(updatedFacility.getCapacity());
        existingFacility.setLocation(updatedFacility.getLocation());
        existingFacility.setAvailabilityWindows(updatedFacility.getAvailabilityWindows());
        existingFacility.setStatus(updatedFacility.getStatus());

        normalize(existingFacility);
        return facilityRepository.save(existingFacility);
    }

    public void deleteFacility(Long id) {
        Facility facility = getFacilityById(id);
        facilityRepository.delete(Objects.requireNonNull(facility, "facility must not be null"));
    }

    private void normalize(Facility facility) {
        if (facility.getName() != null) {
            facility.setName(facility.getName().trim());
        }
        if (facility.getLocation() != null) {
            facility.setLocation(facility.getLocation().trim());
        }
    }
}
