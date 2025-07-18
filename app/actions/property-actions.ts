"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface PropertyFormData {
    title: string;
    location: string;
    city: string;
    priceDay: string;
    propertyTypeId: string;
    bedrooms: string;
    bathrooms: string;
    rate: number;
    description: string;
}

/**
 * Uploads a single image file to Supabase Storage
 * 
 * @param file - The image file to upload
 * @param propertyId - Unique identifier for the property (used for organizing files)
 * @param supabase - Supabase client instance
 * @returns Promise<string> - Public URL of the uploaded image
 * 
 * @throws Error if upload fails
 * 
 * @example
 * ```typescript
 * const imageUrl = await uploadImageToStorage(file, "propertyId", supabase);
 * console.log(imageUrl); // imageUrl
 * ```
 */
async function uploadImageToStorage(file: File, propertyId: string, supabase: SupabaseClient): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `property-images/${propertyId}/${fileName}`;

    const { data, error } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
}

/**
 * Deletes an image file from Supabase Storage
 * 
 * @param imageUrl - Full public URL of the image to delete
 * @param supabase - Supabase client instance
 * 
 * @description
 * Extracts the file path from the public URL and removes the file from storage.
 * Errors are logged but not thrown to prevent blocking other operations.
 * 
 * @example
 * ```typescript
 * await deleteImageFromStorage("imageUrl", supabase);
 * ```
 */
async function deleteImageFromStorage(imageUrl: string, supabase: SupabaseClient): Promise<void> {
    try {
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.findIndex(part => part === 'property-images');

        if (bucketIndex !== -1) {
            const filePath = pathParts.slice(bucketIndex).join('/');

            const { error } = await supabase.storage
                .from('property-images')
                .remove([filePath]);

            if (error) {
                console.error('Storage delete error:', error);
            }
        }
    } catch (error) {
        console.error('Error parsing image URL for deletion:', error);
    }
}

/**
 * Saves multiple image URLs to the PropertyImage table
 * 
 * @param propertyId - ID of the property to associate images with
 * @param imageUrls - Array of public image URLs to save
 * @param supabase - Supabase client instance
 * 
 * @throws Error if database insert fails
 * 
 * @example
 * ```typescript
 * const imageUrls = ["image1Url", "image2Url"];
 * await saveImageUrls("property-123", imageUrls, supabase);
 * ```
 */
async function saveImageUrls(propertyId: string, imageUrls: string[], supabase: SupabaseClient): Promise<void> {
    if (imageUrls.length === 0) return;

    const imageRecords = imageUrls.map(url => ({
        property_id: propertyId,
        image_url: url
    }));

    const { error } = await supabase
        .from('PropertyImage')
        .insert(imageRecords);

    if (error) {
        throw new Error(`Failed to save image records: ${error.message}`);
    }
}

/**
 * Fetches all available property types from the database
 * 
 * @returns Promise<Array> - Array of property type objects with id and name
 * 
 * @example
 * ```typescript
 * const types = await getPropertyTypes();
 * // [{ id: 1, name: "Apartment" }, { id: 2, name: "House" }]
 * ```
 */
export async function getPropertyTypes() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('PropertyType')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching property types:', error);
        return [];
    }

    return data || [];
}

/**
 * Creates a new property with associated images
 * 
 * @param formData - FormData containing property details and image files
 * 
 * @description
 * Process:
 * 1. Validates user authentication
 * 2. Extracts form fields and image files
 * 3. Creates property record in database
 * 4. Uploads images to Supabase Storage
 * 5. Saves image URLs to PropertyImage table
 * 6. Handles rollback if image upload fails
 * 7. Redirects to home page on success
 * 
 * @throws Error if user not authenticated, property creation fails, or image upload fails
 * 
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('title', 'Beautiful Apartment');
 * formData.append('images', imageFile1);
 * formData.append('images', imageFile2);
 * await createProperty(formData);
 * ```
 */
export async function createProperty(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("You must be logged in to add a property");
    }

    const title = formData.get('title') as string;
    const location = formData.get('location') as string;
    const city = formData.get('city') as string;
    const priceDay = formData.get('priceDay') as string;
    const propertyTypeId = formData.get('propertyTypeId') as string;
    const bedrooms = formData.get('bedrooms') as string;
    const bathrooms = formData.get('bathrooms') as string;
    const rate = parseInt(formData.get('rate') as string);
    const description = formData.get('description') as string;

    const images = formData.getAll('images') as File[];
    const validImages = images.filter(file => file instanceof File && file.size > 0);

    const { data: property, error: propertyError } = await supabase
        .from('Property')
        .insert({
            user_id: user.id,
            listing_title: title,
            address: location,
            city: city,
            property_type_id: parseInt(propertyTypeId),
            price: parseFloat(priceDay),
            bedrooms: bedrooms ? parseInt(bedrooms) : null,
            bathrooms: bathrooms ? parseInt(bathrooms) : null,
            rate: rate,
            description: description,
        })
        .select()
        .single();

    if (propertyError) {
        throw new Error(propertyError.message);
    }

    if (validImages.length > 0) {
        try {
            const imageUrls: string[] = [];

            for (const image of validImages) {
                const imageUrl = await uploadImageToStorage(image, property.id, supabase);
                imageUrls.push(imageUrl);
            }

            await saveImageUrls(property.id, imageUrls, supabase);
        } catch (error) {
            await supabase.from('Property').delete().eq('id', property.id);
            throw error;
        }
    }

    revalidatePath('/');
    redirect('/');
}

/**
 * Updates an existing property with new data and manages image changes
 * 
 * @param propertyId - ID of the property to update
 * @param formData - FormData containing updated property details, new images, and deleted image URLs
 * 
 * @description
 * Process:
 * 1. Validates user authentication and ownership
 * 2. Extracts form fields, new images, and deleted image URLs
 * 3. Updates property record in database
 * 4. Removes deleted images from database and storage
 * 5. Uploads new images to storage
 * 6. Saves new image URLs to database
 * 7. Redirects to home page on success
 * 
 * @throws Error if user not authenticated, doesn't own property, or update fails
 * 
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('title', 'Updated Title');
 * formData.append('images', newImageFile);
 * formData.append('deletedImages', 'oldImageUrl');
 * await updateProperty('property-123', formData);
 * ```
 */
export async function updateProperty(propertyId: string, formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("You must be logged in to update a property");
    }

    const title = formData.get('title') as string;
    const location = formData.get('location') as string;
    const city = formData.get('city') as string;
    const priceDay = formData.get('priceDay') as string;
    const propertyTypeId = formData.get('propertyTypeId') as string;
    const bedrooms = formData.get('bedrooms') as string;
    const bathrooms = formData.get('bathrooms') as string;
    const rate = parseInt(formData.get('rate') as string);
    const description = formData.get('description') as string;

    const images = formData.getAll('images') as File[];
    const validImages = images.filter(file => file instanceof File && file.size > 0);
    const deletedImageUrls = formData.getAll('deletedImages') as string[];

    const { error: propertyError } = await supabase
        .from('Property')
        .update({
            listing_title: title,
            address: location,
            city: city,
            property_type_id: parseInt(propertyTypeId),
            price: parseFloat(priceDay),
            bedrooms: bedrooms ? parseInt(bedrooms) : null,
            bathrooms: bathrooms ? parseInt(bathrooms) : null,
            rate: rate,
            description: description,
        })
        .eq('id', propertyId)
        .eq('user_id', user.id);

    if (propertyError) {
        throw new Error(propertyError.message);
    }

    if (deletedImageUrls.length > 0) {
        const { error: deleteDbError } = await supabase
            .from('PropertyImage')
            .delete()
            .in('image_url', deletedImageUrls);

        if (deleteDbError) {
            console.error('Error deleting image records:', deleteDbError);
        }

        for (const imageUrl of deletedImageUrls) {
            deleteImageFromStorage(imageUrl, supabase).catch(console.error);
        }
    }

    if (validImages.length > 0) {
        const imageUrls: string[] = [];

        for (const image of validImages) {
            try {
                const imageUrl = await uploadImageToStorage(image, propertyId, supabase);
                imageUrls.push(imageUrl);
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }

        if (imageUrls.length > 0) {
            await saveImageUrls(propertyId, imageUrls, supabase);
        }
    }

    revalidatePath('/');
    redirect('/');
}

/**
 * Deletes a property and all associated images
 * 
 * @param propertyId - ID of the property to delete
 * 
 * @description
 * Process:
 * 1. Validates user authentication and ownership
 * 2. Retrieves all associated image URLs
 * 3. Deletes property from database (cascades to related tables)
 * 4. Removes images from storage (non-blocking)
 * 5. Redirects to home page on success
 * 
 * @throws Error if user not authenticated, doesn't own property, or deletion fails
 * 
 * @example
 * ```typescript
 * await deleteProperty('property-123');
 * ```
 */
export async function deleteProperty(propertyId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("You must be logged in to delete a property");
    }

    const { data: images } = await supabase
        .from('PropertyImage')
        .select('image_url')
        .eq('property_id', propertyId);

    const { error } = await supabase
        .from('Property')
        .delete()
        .eq('id', propertyId)
        .eq('user_id', user.id);

    if (error) {
        throw new Error(error.message);
    }

    if (images && images.length > 0) {
        for (const image of images) {
            deleteImageFromStorage(image.image_url, supabase).catch(console.error);
        }
    }

    revalidatePath('/');
    redirect('/');
} 