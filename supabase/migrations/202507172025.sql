/**
  # Row Level Security Policies for PropMatch

  1. Property Table Policies
    - Users can view their own properties
    - Users can create properties for themselves
    - Users can update their own properties 
    - Users can delete their own properties

  2. PropertyImage Table Policies
    - Users can view images of their own properties
    - Users can add images to their own properties
    - Users can delete images from their own properties

  3. Property_Tag_Join Table Policies
    - Users can manage tags for their own properties

  4. Public Read Access for Lookup Tables
    - PropertyType table is readable by all authenticated users
    - PropertyTag table is readable by all authenticated users
*/

-- Property Table Policies
CREATE POLICY "Users can view own properties" ON "Property"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own properties" ON "Property" 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties" ON "Property"
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties" ON "Property"
  FOR DELETE USING (auth.uid() = user_id);

-- PropertyImage Table Policies  
CREATE POLICY "Users can view images of own properties" ON "PropertyImage"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Property" 
      WHERE "Property".id = "PropertyImage".property_id 
      AND "Property".user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create images for own properties" ON "PropertyImage"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Property"
      WHERE "Property".id = "PropertyImage".property_id
      AND "Property".user_id = auth.uid()  
    )
  );

CREATE POLICY "Users can delete images from own properties" ON "PropertyImage"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "Property"
      WHERE "Property".id = "PropertyImage".property_id
      AND "Property".user_id = auth.uid()
    )
  );

-- Property_Tag_Join Table Policies
CREATE POLICY "Users can view tags of own properties" ON "Property_Tag_Join"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Property"
      WHERE "Property".id = "Property_Tag_Join".property_id
      AND "Property".user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tags for own properties" ON "Property_Tag_Join"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Property" 
      WHERE "Property".id = "Property_Tag_Join".property_id
      AND "Property".user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tags from own properties" ON "Property_Tag_Join"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "Property"
      WHERE "Property".id = "Property_Tag_Join".property_id 
      AND "Property".user_id = auth.uid()
    )
  );

-- Lookup Tables - Public read access for authenticated users
CREATE POLICY "Allow read access to property types" ON "PropertyType"
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to property tags" ON "PropertyTag"
  FOR SELECT USING (auth.role() = 'authenticated'); 