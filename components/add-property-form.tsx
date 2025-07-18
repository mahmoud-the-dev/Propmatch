"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, Star, X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createProperty } from "@/app/actions/property-actions";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    location: z.string().min(1, "Location is required"),
    city: z.string().min(1, "City is required"),
    priceDay: z.string().min(1, "Price per day is required"),
    propertyTypeId: z.string().min(1, "Property type is required"),
    bedrooms: z.string().optional(),
    bathrooms: z.string().optional(),
    rate: z.number().min(0).max(5),
    description: z.string().optional(),
});

interface PropertyType {
    id: number;
    name: string;
}

interface AddPropertyFormProps {
    propertyTypes: PropertyType[];
}

/**
 * AddPropertyForm Component
 * 
 * A comprehensive form for creating new properties with image upload capabilities.
 * Uses React Hook Form for optimized performance and validation.
 * 
 * @param propertyTypes - Array of available property types fetched from database
 * 
 * Features:
 * - Form validation using Zod schema
 * - Multiple image upload with preview
 * - Dynamic tag management
 * - Star rating system
 * - Optimized re-rendering (images/tags use separate state)
 * - FormData submission for efficient file handling
 * 
 * @example
 * ```tsx
 * const propertyTypes = await getPropertyTypes();
 * <AddPropertyForm propertyTypes={propertyTypes} />
 * ```
 */
export function AddPropertyForm({ propertyTypes }: AddPropertyFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState("");
    const [images, setImages] = useState<File[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            location: "",
            city: "",
            priceDay: "",
            propertyTypeId: "",
            bedrooms: "",
            bathrooms: "",
            rate: 0,
            description: "",
        },
    });

    /**
     * Adds a new tag to the property
     * Prevents duplicates and empty tags
     */
    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags(prev => [...prev, newTag.trim()]);
            setNewTag("");
        }
    };

    /**
     * Removes a tag from the property
     * @param tagToRemove - The tag string to remove from the list
     */
    const handleRemoveTag = (tagToRemove: string) => {
        setTags(prev => prev.filter(tag => tag !== tagToRemove));
    };

    /**
     * Handles Enter key press for tag input
     * Prevents form submission and adds tag instead
     */
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    /**
     * Handles file selection for image upload
     * Enforces 5 image limit and filters valid files
     */
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files);
            setImages(prev => [...prev, ...newImages].slice(0, 5));
        }
    };

    /**
     * Removes an image from the upload queue
     * @param index - Array index of the image to remove
     */
    const handleRemoveImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    /**
     * Handles form submission
     * Creates FormData with all form fields and images, then calls server action
     */
    const onSubmit = (values: z.infer<typeof formSchema>) => {
        startTransition(async () => {
            try {
                const formData = new FormData();

                formData.append('title', values.title);
                formData.append('location', values.location);
                formData.append('city', values.city);
                formData.append('priceDay', values.priceDay);
                formData.append('propertyTypeId', values.propertyTypeId);
                formData.append('bedrooms', values.bedrooms || '');
                formData.append('bathrooms', values.bathrooms || '');
                formData.append('rate', values.rate.toString());
                formData.append('description', values.description || '');

                images.forEach((image) => {
                    formData.append('images', image);
                });

                await createProperty(formData);
                toast({
                    title: "Success!",
                    description: "Property added successfully",
                });
            } catch (error) {
                console.error('Error adding property:', error);
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to add property. Please try again.",
                    variant: "destructive",
                });
            }
        });
    };

    /**
     * Renders interactive star rating component
     * @param currentRate - Current rating value
     * @param onRateChange - Callback function when rating changes
     */
    const renderStars = (currentRate: number, onRateChange: (rate: number) => void) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                className={`h-8 w-8 cursor-pointer transition-colors ${index < currentRate
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-400'
                    }`}
                onClick={() => onRateChange(index + 1)}
            />
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl bg-white shadow-sm h-12 w-12"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-3xl font-bold text-navy-900" style={{ color: '#1e293b' }}>
                        Add Property
                    </h1>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold text-navy-900" style={{ color: '#1e293b' }}>
                                        Title
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Your Property Title"
                                            className="h-14 bg-white border-gray-200 rounded-xl text-base"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold text-navy-900" style={{ color: '#1e293b' }}>
                                        Location
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Annwaj, North Coast"
                                            className="h-14 bg-white border-gray-200 rounded-xl text-base"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold text-navy-900" style={{ color: '#1e293b' }}>
                                            City
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Badr city"
                                                className="h-14 bg-white border-gray-200 rounded-xl text-base"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <FormLabel className="text-base font-semibold text-navy-900" style={{ color: '#1e293b' }}>
                                    Tags
                                </FormLabel>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Add tag (e.g., Nile View)"
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            className="h-14 bg-white border-gray-200 rounded-xl text-base flex-1"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleAddTag}
                                            variant="outline"
                                            size="icon"
                                            className="h-14 w-14 rounded-xl"
                                        >
                                            <Plus className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag) => (
                                                <Badge
                                                    key={tag}
                                                    variant="secondary"
                                                    className="px-3 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
                                                >
                                                    {tag}
                                                    <X
                                                        className="h-3 w-3 ml-2 cursor-pointer"
                                                        onClick={() => handleRemoveTag(tag)}
                                                    />
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="priceDay"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold text-navy-900" style={{ color: '#1e293b' }}>
                                        Price Per Day
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="1200"
                                            className="h-14 bg-white border-gray-200 rounded-xl text-base"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <FormLabel className="text-base font-semibold text-navy-900" style={{ color: '#1e293b' }}>
                                Upload Photos
                            </FormLabel>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="photo-upload"
                                />
                                <label
                                    htmlFor="photo-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <Camera className="h-12 w-12 text-gray-400 mb-2" />
                                    <span className="text-gray-500">Add Photos</span>
                                </label>

                                {images.length > 0 && (
                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                        {images.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={URL.createObjectURL(image)}
                                                    alt={`Upload ${index + 1}`}
                                                    className="w-full h-20 object-cover rounded-lg"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6"
                                                    onClick={() => handleRemoveImage(index)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="propertyTypeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold text-navy-900" style={{ color: '#1e293b' }}>
                                            Property Type
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-14 bg-white border-gray-200 rounded-xl text-base">
                                                    <SelectValue placeholder="Select property type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {propertyTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bedrooms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold text-navy-900" style={{ color: '#1e293b' }}>
                                            Bedrooms
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-14 bg-white border-gray-200 rounded-xl text-base">
                                                    <SelectValue placeholder="Number of bedrooms" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Array.from({ length: 10 }, (_, i) => (
                                                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                        {i + 1} Room{i + 1 !== 1 ? 's' : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="bathrooms"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold text-navy-900" style={{ color: '#1e293b' }}>
                                        Bathrooms
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-14 bg-white border-gray-200 rounded-xl text-base w-full md:w-1/2">
                                                <SelectValue placeholder="Number of bathrooms" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Array.from({ length: 6 }, (_, i) => (
                                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                    {i + 1} Bathroom{i + 1 !== 1 ? 's' : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="rate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold text-navy-900" style={{ color: '#1e293b' }}>
                                        Stars
                                    </FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2">
                                            {renderStars(field.value, field.onChange)}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold text-navy-900" style={{ color: '#1e293b' }}>
                                        Description
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Property Description"
                                            className="min-h-[120px] bg-white border-gray-200 rounded-xl text-base resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="pt-6">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-14 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                {isPending ? "Saving Property..." : "Save Property"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
} 