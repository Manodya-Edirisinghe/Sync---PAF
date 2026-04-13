package com.smartcampus.operationshub.facilities.repository;

import com.smartcampus.operationshub.facilities.entity.Facility;
import com.smartcampus.operationshub.facilities.entity.FacilityStatus;
import com.smartcampus.operationshub.facilities.entity.FacilityType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FacilityRepository extends JpaRepository<Facility, Long> {
    boolean existsByName(String name);

    List<Facility> findByStatus(FacilityStatus status);

    List<Facility> findByType(FacilityType type);

    List<Facility> findByCapacityGreaterThanEqual(int minCapacity);

    List<Facility> findByLocationContainingIgnoreCase(String location);

    List<Facility> findByTypeAndStatusAndCapacityGreaterThanEqual(
            FacilityType type, FacilityStatus status, int minCapacity);

    @Query("""
        SELECT f
        FROM Facility f
        WHERE (CAST(:type AS string) IS NULL OR f.type = :type)
          AND (CAST(:status AS string) IS NULL OR f.status = :status)
          AND (:minCapacity IS NULL OR f.capacity >= :minCapacity)
          AND (CAST(:location AS string) IS NULL OR LOWER(f.location) LIKE LOWER(CONCAT('%', CAST(:location AS string), '%')))
        """)
    List<Facility> search(
        @Param("type") FacilityType type,
        @Param("status") FacilityStatus status,
        @Param("minCapacity") Integer minCapacity,
        @Param("location") String location);
}
