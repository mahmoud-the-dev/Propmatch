# Image Upload System Documentation

## Overview

The PropMatch application implements a robust image upload system using **Supabase Storage** for file storage and **FormData** for efficient client-server communication. The system handles property images with features like upload validation, automatic cleanup, and optimized storage organization.

## Architecture

### Storage Structure

```
Supabase Storage Bucket: property-images/
├── property-{id-1}/
│   ├── 1704012345-abc123.jpg
│   ├── 1704012346-def456.png
│   └── ...
├── property-{id-2}/
│   ├── 1704012347-ghi789.jpg
│   └── ...
└── ...
```

### Database Schema

```sql
-- Property table stores metadata
Property {
  id: UUID (primary key)
  user_id: UUID (foreign key to auth.users)
  listing_title: TEXT
  // ... other property fields
}

-- PropertyImage table stores image URLs
PropertyImage {
  id: UUID (primary key)
  property_id: UUID (foreign key to Property)
  image_url: TEXT (public Supabase Storage URL)
}
```

## Core Components

### 1. Server Actions (`app/actions/property-actions.ts`)

#### Image Upload Helper

```typescript
uploadImageToStorage(file: File, propertyId: string, supabase: SupabaseClient): Promise<string>
```

-   **Purpose**: Uploads a single image file to Supabase Storage
-   **Naming Strategy**: `{timestamp}-{random}.{extension}` prevents conflicts
-   **Organization**: Files stored in `property-images/{propertyId}/` folders
-   **Output**: Returns public URL for immediate use

#### Image Deletion Helper

```typescript
deleteImageFromStorage(imageUrl: string, supabase: SupabaseClient): Promise<void>
```

-   **Purpose**: Removes images from storage when no longer needed
-   **Safe Operation**: Non-blocking, errors logged but don't stop execution
-   **URL Parsing**: Extracts file path from public URL automatically

#### Database Management

```typescript
saveImageUrls(propertyId: string, imageUrls: string[], supabase: SupabaseClient): Promise<void>
```

-   **Purpose**: Batch insert image URLs into PropertyImage table
-   **Relationship**: Links images to specific properties via foreign key

### 2. Property Operations

#### Creating Properties with Images

```typescript
createProperty(formData: FormData): Promise<void>
```

**Process Flow:**

1. **Authentication Check** → Validates user session
2. **Form Data Extraction** → Parses text fields and image files
3. **Property Creation** → Inserts property record in database
4. **Image Processing** → Uploads each image to storage
5. **URL Storage** → Saves image URLs in PropertyImage table
6. **Error Handling** → Rolls back property creation if image upload fails
7. **Page Refresh** → Revalidates cache and redirects

#### Updating Properties with Image Changes

```typescript
updateProperty(propertyId: string, formData: FormData): Promise<void>
```

**Process Flow:**

1. **Ownership Verification** → Ensures user owns the property
2. **Change Detection** → Identifies new images and deleted images
3. **Property Update** → Updates property metadata
4. **Image Cleanup** → Removes deleted images from database and storage
5. **New Uploads** → Processes and stores new images
6. **Database Sync** → Links new images to property

#### Property Deletion with Cleanup

```typescript
deleteProperty(propertyId: string): Promise<void>
```

**Process Flow:**

1. **Image Inventory** → Retrieves all associated image URLs
2. **Database Deletion** → Removes property (cascades to images via FK)
3. **Storage Cleanup** → Removes all image files from storage
4. **Non-blocking** → Storage cleanup happens asynchronously

## Frontend Integration

### Form Data Preparation

```typescript
// In React components (AddPropertyForm, EditPropertyForm)
const formData = new FormData();

// Text fields
formData.append("title", values.title);
formData.append("location", values.location);
// ... other fields

// Image files
images.forEach((image) => {
	formData.append("images", image);
});

// For updates: track deletions
deletedImageUrls.forEach((url) => {
	formData.append("deletedImages", url);
});
```

### State Management

```typescript
// Local state for image handling
const [images, setImages] = useState<File[]>([]); // New uploads
const [existingImages, setExistingImages] = useState<string[]>(); // Current images
const [originalImages] = useState<string[]>(); // Track deletions
```

### User Interface Features

-   **Click to Upload**: Hidden file input triggered by styled label with camera icon
-   **Image Preview**: Immediate preview using `URL.createObjectURL()`
-   **Delete Controls**: Remove buttons for both existing and new images
-   **Upload Limits**: Maximum 5 images per property enforced in handler
-   **File Validation**: Accepts only image file types (`accept="image/*"`)
-   **Visual Feedback**: Camera icon and "Add Photos" text in upload area

## Error Handling & Recovery

### Upload Failures

-   **Rollback Strategy**: If image upload fails during property creation, the entire property is deleted
-   **Partial Success**: During updates, property metadata is saved even if some images fail
-   **User Feedback**: Toast notifications provide clear success/error messages

### Storage Management

-   **Orphan Prevention**: Database foreign keys ensure images are always linked to properties
-   **Cleanup Guarantee**: Property deletion automatically removes all associated files
-   **Non-blocking Deletes**: Storage deletion failures don't interrupt user workflow

## Security Features

### Authentication

-   All operations require authenticated user session
-   Users can only manage their own properties (enforced by user_id checks)

### Row Level Security (RLS)

```sql
-- Example policies applied to PropertyImage table
CREATE POLICY "Users can view images of own properties" ON "PropertyImage"
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM "Property"
        WHERE "Property".id = "PropertyImage".property_id
        AND "Property".user_id = auth.uid()
    )
);
```

### File Validation

-   **Client-side**: File type validation in forms (`accept="image/*"`)
-   **Server-side**: File instance verification before processing
-   **Storage Rules**: Bucket policies restrict file types and sizes

## Performance Optimizations

### Efficient Uploads

-   **Sequential Processing**: Images uploaded one by one to prevent overwhelming server
-   **FormData Usage**: Efficient binary data transfer
-   **Cache Control**: Images cached for 1 hour (`cacheControl: '3600'`)

### Database Efficiency

-   **Batch Operations**: Multiple image URLs inserted in single query
-   **Selective Updates**: Only changed data is transmitted
-   **Indexed Queries**: Foreign key relationships enable fast lookups

### Storage Organization

-   **Logical Grouping**: Images organized by property for easy management
-   **Unique Naming**: Timestamp + random string prevents conflicts
-   **Public Access**: Direct URL access eliminates proxy overhead

## Usage Examples

### Adding a Property with Images

```typescript
const formData = new FormData();
formData.append("title", "Beautiful Apartment");
formData.append("location", "Downtown");
formData.append("priceDay", "150");
formData.append("images", imageFile1);
formData.append("images", imageFile2);

await createProperty(formData);
// Result: Property created with 2 images uploaded to storage
```

### Updating Property Images

```typescript
const formData = new FormData();
formData.append("title", "Updated Title");
formData.append("images", newImageFile); // New image to add
formData.append("deletedImages", "https://old-image-url.jpg"); // Image to remove

await updateProperty("property-123", formData);
// Result: Property updated, old image deleted, new image added
```

## Supabase Setup Requirements

### Storage Bucket Configuration

```javascript
// Required bucket setup in Supabase Dashboard
{
  name: 'property-images',
  public: true,
  fileSizeLimit: '50MB',
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}
```

### Implemented Policies

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
);

-- Allow public read access
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

-- Allow users to delete their images
CREATE POLICY "Allow authenticated delete" ON storage.objects
FOR DELETE USING (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
);
```

## Monitoring & Maintenance

### Health Indicators

-   **Upload Success Rate**: Monitor failed uploads in console logs
-   **Storage Usage**: Track bucket size and file count
-   **Orphaned Files**: Periodic cleanup of files without database references

### Common Issues & Solutions

1. **Large File Uploads**: Implement progress indicators and file size limits
2. **Network Timeouts**: Add retry logic for failed uploads
3. **Storage Quota**: Monitor usage and implement cleanup policies
4. **Browser Compatibility**: Test with different browsers and devices

## Current Limitations & Future Enhancements

### Not Yet Implemented

-   **Drag & Drop Upload**: Currently uses click-to-upload only
-   **Image Compression**: Images uploaded at original size
-   **Progress Indicators**: No upload progress feedback
-   **Image Cropping/Editing**: No built-in image editing tools
-   **Bulk Upload**: No batch upload optimization beyond 5 image limit

### Potential Improvements

-   Add drag and drop functionality for better UX
-   Implement client-side image compression before upload
-   Add upload progress bars for large files
-   Include image editing capabilities (crop, rotate, filters)
-   Implement advanced file validation (dimensions, quality checks)

This documentation provides a complete and accurate overview of the image upload system's current implementation within the PropMatch application.
