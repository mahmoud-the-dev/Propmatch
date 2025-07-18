/**
  # Seed Data for PropMatch Database

  1. Property Types
    - Insert common property types (Apartment, House, Duplex, etc.)

  2. Sample Properties 
    - Insert a few sample properties for testing the home page

  3. Sample Images
    - Add some sample property images
*/

-- Insert Property Types
INSERT INTO "PropertyType" (name) VALUES 
  ('Apartment'),
  ('House'), 
  ('Duplex'),
  ('Villa'),
  ('Studio'),
  ('Penthouse')
ON CONFLICT (name) DO NOTHING;

-- Note: Sample properties and images would be inserted here
-- but we'll let users add their own properties through the UI
-- This file serves as a template for future data seeding