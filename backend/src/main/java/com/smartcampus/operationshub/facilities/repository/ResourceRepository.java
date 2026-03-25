package com.smartcampus.operationshub.facilities.repository;

import com.smartcampus.operationshub.facilities.entity.Resource;
import com.smartcampus.operationshub.facilities.entity.ResourceStatus;
import com.smartcampus.operationshub.facilities.entity.ResourceType;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ResourceRepository extends JpaRepository<Resource, UUID> {
  boolean existsByName(String name);

    List<Resource> findByStatus(ResourceStatus status);

    List<Resource> findByType(ResourceType type);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    @Query("""
        SELECT r
        FROM Resource r
        WHERE (:type IS NULL OR r.type = :type)
          AND (:minCapacity IS NULL OR r.capacity >= :minCapacity)
          AND (:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%')))
        """)
    List<Resource> search(
        @Param("type") ResourceType type,
        @Param("minCapacity") Integer minCapacity,
        @Param("location") String location);
}
