package com.smartcampus.operationshub.facilities.service;

import com.smartcampus.operationshub.facilities.entity.Resource;
import com.smartcampus.operationshub.facilities.entity.ResourceStatus;
import com.smartcampus.operationshub.facilities.entity.ResourceType;
import com.smartcampus.operationshub.facilities.exception.ResourceNotFoundException;
import com.smartcampus.operationshub.facilities.repository.ResourceRepository;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Transactional(readOnly = true)
    public List<Resource> getAllResources(ResourceType type, String location, Integer minCapacity) {
        String normalizedLocation = StringUtils.hasText(location) ? location.trim() : null;
        return resourceRepository.search(type, minCapacity, normalizedLocation);
    }

    @Transactional(readOnly = true)
    public Resource getResourceById(UUID id) {
        UUID resourceId = Objects.requireNonNull(id, "id must not be null");
        return resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException(id));
    }

    public Resource createResource(Resource resource) {
        resource.setId(null);
        if (resource.getStatus() == null) {
            resource.setStatus(ResourceStatus.ACTIVE);
        }
        normalize(resource);
        return resourceRepository.save(resource);
    }

    public Resource updateResource(UUID id, Resource updatedResource) {
        Resource existingResource = getResourceById(id);

        existingResource.setName(updatedResource.getName());
        existingResource.setType(updatedResource.getType());
        existingResource.setCapacity(updatedResource.getCapacity());
        existingResource.setLocation(updatedResource.getLocation());
        existingResource.setStatus(updatedResource.getStatus());

        normalize(existingResource);
        return resourceRepository.save(existingResource);
    }

    public void deleteResource(UUID id) {
        Resource resource = getResourceById(id);
        resourceRepository.delete(Objects.requireNonNull(resource, "resource must not be null"));
    }

    private void normalize(Resource resource) {
        if (resource.getName() != null) {
            resource.setName(resource.getName().trim());
        }
        if (resource.getLocation() != null) {
            resource.setLocation(resource.getLocation().trim());
        }
    }
}
