package com.freelance.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Postgres'teki enum kısıtlamasının yeni enum değerlerini engellememesi için 
            // eski kısıtlamayı siliyoruz. Hibernate yeni durumlara izin verecektir.
            jdbcTemplate.execute("ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;");
            System.out.println("✅ Veritabanı kontrolü: 'jobs_status_check' kısıtlaması başarıyla kaldırıldı (eğer varsa).");
        } catch (Exception e) {
            System.err.println("⚠️ Veritabanı kısıtlaması kaldırılırken hata oluştu: " + e.getMessage());
        }
    }
}
