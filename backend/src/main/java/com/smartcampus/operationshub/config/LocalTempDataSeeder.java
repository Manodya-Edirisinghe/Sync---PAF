package com.smartcampus.operationshub.config;

import com.smartcampus.operationshub.facilities.entity.Resource;
import com.smartcampus.operationshub.facilities.entity.ResourceStatus;
import com.smartcampus.operationshub.facilities.entity.ResourceType;
import com.smartcampus.operationshub.facilities.repository.ResourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("local")
public class LocalTempDataSeeder {

    private static final Logger log = LoggerFactory.getLogger(LocalTempDataSeeder.class);
    private static final String TEMP_RESOURCE_NAME = "TEMP_SYNC_DB_CHECK";

    @Bean
    CommandLineRunner seedTemporaryResource(ResourceRepository resourceRepository) {
        return args -> {
            if (resourceRepository.existsByName(TEMP_RESOURCE_NAME)) {
                log.info("Temporary DB check record already exists: {}", TEMP_RESOURCE_NAME);
                return;
            }

            Resource resource = new Resource();
            resource.setName(TEMP_RESOURCE_NAME);
            resource.setType(ResourceType.LAB);
            resource.setCapacity(10);
            resource.setLocation("Sync Test Zone");
            resource.setStatus(ResourceStatus.ACTIVE);

            Resource saved = resourceRepository.save(resource);
            log.info("Inserted temporary DB check record id={} name={}", saved.getId(), saved.getName());
        };
    }
}
