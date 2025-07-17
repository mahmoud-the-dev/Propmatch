/**
  # PropMatch Database Schema Setup

  1. New Tables
    - `PropertyType` - Lookup table for property types (apartment, house, etc.)
    - `PropertyTag` - Lookup table for property tags (pet-friendly, furnished, etc.)
    - `Property` - Main properties table with user ownership
    - `PropertyImage` - Images associated with properties (1-to-many)
    - `Property_Tag_Join` - Junction table for property-tag relationships (many-to-many)

  2. Security
    - Enable RLS on all tables
    - No policies added yet (will be configured in next step)

  3. Key Features
    - UUID primary keys for scalability
    - Foreign key constraints for data integrity
    - Proper data types and constraints
    - Cascade deletes for related data
*/

-- 1. Create PropertyType Lookup Table
CREATE TABLE IF NOT EXISTS "PropertyType" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE
);

-- 2. Create PropertyTag Lookup Table
CREATE TABLE IF NOT EXISTS "PropertyTag" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL UNIQUE
);

-- 3. Create the Main Property Table
CREATE TABLE IF NOT EXISTS "Property" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES auth.users(id),
    "listing_title" TEXT NOT NULL,
    "property_type_id" INTEGER REFERENCES "PropertyType"(id),
    "address" TEXT,
    "city" TEXT,
    "rate" INTEGER CHECK (rate >= 1 AND rate <= 5),
    "price" NUMERIC(12, 2),
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "description" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- 4. Create PropertyImage Table for 1-to-Many relationship
CREATE TABLE IF NOT EXISTS "PropertyImage" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "property_id" UUID NOT NULL REFERENCES "Property"(id) ON DELETE CASCADE,
    "image_url" TEXT NOT NULL
);

-- 5. Create the Join Table for Many-to-Many relationship between Property and Tag
CREATE TABLE IF NOT EXISTS "Property_Tag_Join" (
    "property_id" UUID NOT NULL REFERENCES "Property"(id) ON DELETE CASCADE,
    "tag_id" UUID NOT NULL REFERENCES "PropertyTag"(id) ON DELETE CASCADE,
    PRIMARY KEY ("property_id", "tag_id")
);

-- Enable Row Level Security on all tables
ALTER TABLE "PropertyType" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PropertyTag" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Property" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PropertyImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Property_Tag_Join" ENABLE ROW LEVEL SECURITY;