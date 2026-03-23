package com.smartcampus.operationshub.facilities.controller;

import com.smartcampus.operationshub.facilities.entity.Resource;
import com.smartcampus.operationshub.facilities.entity.ResourceType;
import com.smartcampus.operationshub.facilities.service.ResourceService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import java.net.URI;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
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
@RequestMapping("/api/v1/resources")
@Validated
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) @Min(1) Integer minCapacity) {

        List<Resource> resources = resourceService.getAllResources(type, location, minCapacity);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable UUID id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @PostMapping
    public ResponseEntity<Resource> createResource(@Valid @RequestBody Resource resource) {
        Resource createdResource = resourceService.createResource(resource);
        URI location = URI.create("/api/v1/resources/" + createdResource.getId());
        return ResponseEntity
                .created(Objects.requireNonNull(location, "location URI must not be null"))
                .body(createdResource);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable UUID id, @Valid @RequestBody Resource resource) {
        return ResponseEntity.ok(resourceService.updateResource(id, resource));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable UUID id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
