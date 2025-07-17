/*
  # Seed Property Types

  1. Data Setup
    - Insert common property types for real estate application
    - Provides foundation data for property listings

  2. Property Types
    - Apartment
    - House
    - Condo
    - Townhouse
    - Studio
    - Loft
*/

-- Insert common property types
INSERT INTO "PropertyType" ("name") VALUES
    ('Apartment'),
    ('House'),
    ('Condo'),
    ('Townhouse'),
    ('Studio'),
    ('Loft')
ON CONFLICT ("name") DO NOTHING;