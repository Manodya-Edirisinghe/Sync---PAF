package com.smartcampus.operationshub.users.repository;

import com.smartcampus.operationshub.users.entity.User;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByOauthProviderAndOauthSubject(String oauthProvider, String oauthSubject);
}
