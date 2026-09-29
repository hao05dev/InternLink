package com.internlink.core.infrastructure.migration;

import java.nio.charset.StandardCharsets;

import org.flywaydb.core.api.Location;
import org.flywaydb.core.internal.resolver.ChecksumCalculator;
import org.flywaydb.core.internal.resource.classpath.ClassPathResource;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

class MigrationIntegrityTest {

    // Released migrations are immutable, including comments and whitespace.
    // Put schema changes in a new migration instead of changing these checksums.
    @ParameterizedTest(name = "{0} retains its released Flyway checksum")
    @CsvSource({
        "V1__create_lean_26_tables.sql, 53838402",
        "V2__seed_demo_data.sql, 1863760666",
        "V3__align_base_entity_columns.sql, 1577717303",
        "V4__align_base_entity_created_at.sql, 1093366627",
        "V5__add_created_by_to_job_positions.sql, 471768028",
        "V6__sync_ai_skill_taxonomy.sql, 159263373",
        "V7__academic_internship_assessment.sql, -19775325",
        "V8__seed_real_portal_accounts.sql, 86449966",
        "V9__fix_seed_account_passwords.sql, -916209890",
        "V10__add_class_code_to_student_rosters.sql, -657407365",
        "V11__internship_portfolio.sql, -339308798",
        "V12__portfolio_score_evidence.sql, -1598937548"
    })
    void releasedMigrationChecksumIsUnchanged(String filename, int expectedChecksum) {
        var migration = new ClassPathResource(
            new Location("classpath:db/migration"), "db/migration/" + filename,
            getClass().getClassLoader(), StandardCharsets.UTF_8);

        assertThat(migration.exists()).as("Migration %s must remain available", filename).isTrue();
        assertThat(ChecksumCalculator.calculate(migration))
            .as("%s is immutable; create a new migration for further changes", filename)
            .isEqualTo(expectedChecksum);
    }
}
