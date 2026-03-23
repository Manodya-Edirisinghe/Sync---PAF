package com.smartcampus.operationshub.facilities.repository;

import com.smartcampus.operationshub.facilities.entity.Resource;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource, UUID> {
    List<Resource> findByStatus(com.smartcampus.operationshub.facilities.entity.ResourceStatus status);
}
