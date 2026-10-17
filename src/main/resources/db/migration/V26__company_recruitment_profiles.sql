ALTER TABLE companies
 ADD COLUMN description TEXT,
 ADD COLUMN employee_range VARCHAR(100),
 ADD COLUMN logo_url TEXT,
 ADD COLUMN cover_image_url TEXT,
 ADD COLUMN office_address VARCHAR(1000),
 ADD COLUMN map_embed_url TEXT,
 ADD COLUMN maps_url TEXT;

ALTER TABLE job_positions
 ADD COLUMN use_company_location BOOLEAN NOT NULL DEFAULT FALSE,
 ADD COLUMN map_embed_url TEXT,
 ADD COLUMN maps_url TEXT;

ALTER TABLE job_positions ALTER COLUMN location TYPE VARCHAR(1000);

UPDATE companies SET office_address = NULLIF(LEFT(COALESCE(NULLIF(address->>'fullAddress', ''),
 CONCAT_WS(', ', NULLIF(address->>'street', ''), NULLIF(address->>'ward', ''),
 NULLIF(address->>'district', ''), COALESCE(NULLIF(address->>'province', ''), NULLIF(address->>'city', '')))), 1000), '');
