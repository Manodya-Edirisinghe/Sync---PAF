package com.smartcampus.operationshub.facilities.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "facilities")
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FacilityType type;

    @Min(1)
    @Column(nullable = false)
    private int capacity;

    @Column
    private String location;

    @Column
    private String availabilityWindows;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FacilityStatus status = FacilityStatus.ACTIVE;

    @OneToMany(mappedBy = "facility")
    private Set<com.smartcampus.operationshub.bookings.entity.Booking> bookings = new HashSet<>();

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

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

    public Set<com.smartcampus.operationshub.bookings.entity.Booking> getBookings() {
        return bookings;
    }

    public void setBookings(Set<com.smartcampus.operationshub.bookings.entity.Booking> bookings) {
        this.bookings = bookings;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
