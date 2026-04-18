package com.smartcampus.operationshub.bookings.config;

import jakarta.annotation.PostConstruct;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;
import java.util.Locale;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class BookingSchemaRepair {

    private static final Logger log = LoggerFactory.getLogger(BookingSchemaRepair.class);

    private final DataSource dataSource;
    private final JdbcTemplate jdbcTemplate;

    public BookingSchemaRepair(DataSource dataSource, JdbcTemplate jdbcTemplate) {
        this.dataSource = dataSource;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void repairLegacyBookingsSchemaIfNeeded() {
        if (!isPostgres()) {
            return;
        }

        String idDataType = jdbcTemplate.query(
                "SELECT data_type FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'id' LIMIT 1",
                rs -> rs.next() ? rs.getString(1) : null);

        if (idDataType == null) {
            return;
        }

        String normalizedType = idDataType.toLowerCase(Locale.ROOT);
        if ("bigint".equals(normalizedType)) {
            return;
        }

        log.warn("Detected incompatible bookings.id type '{}' in PostgreSQL. Recreating bookings table with BIGSERIAL id.", idDataType);

        jdbcTemplate.execute("DROP TABLE IF EXISTS bookings CASCADE");
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS bookings (
                    id BIGSERIAL PRIMARY KEY,
                    facility_id BIGINT NOT NULL,
                    user_email VARCHAR(255) NOT NULL,
                    start_time TIMESTAMP NOT NULL,
                    end_time TIMESTAMP NOT NULL,
                    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
                    purpose VARCHAR(500) NOT NULL,
                    attendees INTEGER,
                    rejection_reason TEXT,
                    created_at TIMESTAMP DEFAULT now(),
                    updated_at TIMESTAMP DEFAULT now()
                )
                """);

        log.warn("Recreated bookings table. Existing legacy booking rows were removed.");
    }

    private boolean isPostgres() {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            String productName = metaData.getDatabaseProductName();
            return productName != null && productName.toLowerCase(Locale.ROOT).contains("postgresql");
        } catch (SQLException ex) {
            log.warn("Could not determine database product name for schema repair check: {}", ex.getMessage());
            return false;
        }
    }
}
