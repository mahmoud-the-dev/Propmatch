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

// Helper function to upload a single image to Supabase Storage
async function uploadImageToStorage(file: File, propertyId: string, supabase: SupabaseClient): Promise<string> {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `property-images/${propertyId}/${fileName}`;

    // Upload file to Supabase Storage
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

    // Get public URL
    const { data: publicUrlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
}

// Helper function to delete an image from Supabase Storage
async function deleteImageFromStorage(imageUrl: string, supabase: SupabaseClient): Promise<void> {
    try {
        // Extract file path from URL
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
                // Don't throw error for delete failures as it's not critical
            }
        }
    } catch (error) {
        console.error('Error parsing image URL for deletion:', error);
        // Don't throw error for delete failures as it's not critical
    }
}

// Helper function to save image URLs to database
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

export async function createProperty(formData: FormData) {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("You must be logged in to add a property");
    }

    // Extract form fields
    const title = formData.get('title') as string;
    const location = formData.get('location') as string;
    const city = formData.get('city') as string;
    const priceDay = formData.get('priceDay') as string;
    const propertyTypeId = formData.get('propertyTypeId') as string;
    const bedrooms = formData.get('bedrooms') as string;
    const bathrooms = formData.get('bathrooms') as string;
    const rate = parseInt(formData.get('rate') as string);
    const description = formData.get('description') as string;

    // Extract images
    const images = formData.getAll('images') as File[];
    const validImages = images.filter(file => file instanceof File && file.size > 0);

    // Create property record first
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

    // Upload images if any
    if (validImages.length > 0) {
        try {
            const imageUrls: string[] = [];

            for (const image of validImages) {
                const imageUrl = await uploadImageToStorage(image, property.id, supabase);
                imageUrls.push(imageUrl);
            }

            // Save image URLs to database
            await saveImageUrls(property.id, imageUrls, supabase);
        } catch (error) {
            // If image upload fails, delete the property and throw error
            await supabase.from('Property').delete().eq('id', property.id);
            throw error;
        }
    }

    revalidatePath('/');
    redirect('/');
}

export async function updateProperty(propertyId: string, formData: FormData) {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("You must be logged in to update a property");
    }

    // Extract form fields
    const title = formData.get('title') as string;
    const location = formData.get('location') as string;
    const city = formData.get('city') as string;
    const priceDay = formData.get('priceDay') as string;
    const propertyTypeId = formData.get('propertyTypeId') as string;
    const bedrooms = formData.get('bedrooms') as string;
    const bathrooms = formData.get('bathrooms') as string;
    const rate = parseInt(formData.get('rate') as string);
    const description = formData.get('description') as string;

    // Extract images and deleted image URLs
    const images = formData.getAll('images') as File[];
    const validImages = images.filter(file => file instanceof File && file.size > 0);
    const deletedImageUrls = formData.getAll('deletedImages') as string[];

    // Update property record
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
        .eq('user_id', user.id); // Ensure user owns this property

    if (propertyError) {
        throw new Error(propertyError.message);
    }

    // Handle deleted images
    if (deletedImageUrls.length > 0) {
        // Delete from database
        const { error: deleteDbError } = await supabase
            .from('PropertyImage')
            .delete()
            .in('image_url', deletedImageUrls);

        if (deleteDbError) {
            console.error('Error deleting image records:', deleteDbError);
        }

        // Delete from storage (non-blocking)
        for (const imageUrl of deletedImageUrls) {
            deleteImageFromStorage(imageUrl, supabase).catch(console.error);
        }
    }

    // Upload new images if any
    if (validImages.length > 0) {
        const imageUrls: string[] = [];

        for (const image of validImages) {
            try {
                const imageUrl = await uploadImageToStorage(image, propertyId, supabase);
                imageUrls.push(imageUrl);
            } catch (error) {
                console.error('Error uploading image:', error);
                // Continue with other images even if one fails
            }
        }

        // Save new image URLs to database
        if (imageUrls.length > 0) {
            await saveImageUrls(propertyId, imageUrls, supabase);
        }
    }

    revalidatePath('/');
    redirect('/');
}

export async function deleteProperty(propertyId: string) {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("You must be logged in to delete a property");
    }

    // Get all images for this property before deletion
    const { data: images } = await supabase
        .from('PropertyImage')
        .select('image_url')
        .eq('property_id', propertyId);

    // Delete property (this will cascade delete images and tags due to foreign key constraints)
    const { error } = await supabase
        .from('Property')
        .delete()
        .eq('id', propertyId)
        .eq('user_id', user.id); // Ensure user owns this property

    if (error) {
        throw new Error(error.message);
    }

    // Delete images from storage (non-blocking)
    if (images && images.length > 0) {
        for (const image of images) {
            deleteImageFromStorage(image.image_url, supabase).catch(console.error);
        }
    }

    revalidatePath('/');
    redirect('/');
} 