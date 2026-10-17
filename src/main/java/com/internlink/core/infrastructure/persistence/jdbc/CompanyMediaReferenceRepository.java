package com.internlink.core.infrastructure.persistence.jdbc;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class CompanyMediaReferenceRepository {
    private final JdbcTemplate jdbc;

    public boolean publicReference(MediaAssetRepository.Asset asset) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM companies WHERE id=? AND verification_status='VERIFIED'"
                        + " AND (logo_url=? OR cover_image_url=?))",
                Boolean.class, asset.context(), asset.url(), asset.url()));
    }
}
