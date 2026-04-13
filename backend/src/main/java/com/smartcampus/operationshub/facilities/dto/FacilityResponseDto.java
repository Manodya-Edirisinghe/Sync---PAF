package com.smartcampus.operationshub.facilities.dto;

import com.smartcampus.operationshub.facilities.entity.Facility;
import com.smartcampus.operationshub.facilities.entity.FacilityStatus;
import com.smartcampus.operationshub.facilities.entity.FacilityType;
import java.time.format.DateTimeFormatter;

public class FacilityResponseDto {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private Long id;
    private String name;
    private FacilityType type;
    private int capacity;
    private String location;
    private String availabilityWindows;
    private FacilityStatus status;
    private String createdAt;
    private String updatedAt;

    public static FacilityResponseDto fromEntity(Facility facility) {
        FacilityResponseDto dto = new FacilityResponseDto();
        dto.id = facility.getId();
        dto.name = facility.getName();
        dto.type = facility.getType();
        dto.capacity = facility.getCapacity();
        dto.location = facility.getLocation();
        dto.availabilityWindows = facility.getAvailabilityWindows();
        dto.status = facility.getStatus();
        dto.createdAt = facility.getCreatedAt() != null
                ? facility.getCreatedAt().format(FORMATTER) : null;
        dto.updatedAt = facility.getUpdatedAt() != null
                ? facility.getUpdatedAt().format(FORMATTER) : null;
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public FacilityType getType() {
        return type;
    }

    public void setType(FacilityType type) {
        this.type = type;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAvailabilityWindows() {
        return availabilityWindows;
    }

    public void setAvailabilityWindows(String availabilityWindows) {
        this.availabilityWindows = availabilityWindows;
    }

    public FacilityStatus getStatus() {
        return status;
    }

    public void setStatus(FacilityStatus status) {
        this.status = status;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
