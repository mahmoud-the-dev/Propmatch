"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter } from "lucide-react";
import { PropertyCard } from "@/components/property-card";

interface Property {
    id: string;
    listing_title: string;
    address: string;
    city: string;
    rate: number;
    price: number;
    bedrooms: number;
    bathrooms: number;
    description: string;
    created_at: string;
    PropertyType?: {
        name: string;
    };
    PropertyImage: {
        image_url: string;
    }[];
}

export function PropertyDashboard() {
    const router = useRouter();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            const supabase = createClient();

            const { data, error } = await supabase
                .from('Property')
                .select(`
          *,
          PropertyType(name),
          PropertyImage(image_url)
        `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching properties:', error);
            } else {
                setProperties(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProperties = properties.filter(property =>
        property.listing_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your properties...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-navy-900 mb-2" style={{ color: '#1e293b' }}>
                        More Productive
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-bold text-navy-900" style={{ color: '#1e293b' }}>
                        with Organized Properties
                    </h2>
                </div>

                {/* Search and Filter Section */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            type="text"
                            placeholder="Search properties..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 h-12 bg-white border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="lg"
                        className="h-12 px-4 rounded-xl border-gray-200 hover:bg-gray-50"
                    >
                        <Filter className="h-5 w-5" />
                    </Button>
                </div>

                {/* Add New Property Button */}
                <div className="flex justify-end mb-6">
                    <Button
                        onClick={() => router.push('/add-property')}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add new property
                    </Button>
                </div>

                {/* Properties Grid */}
                {filteredProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProperties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <Plus className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {properties.length === 0
                                ? "You haven't added any properties yet"
                                : "No properties match your search"
                            }
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {properties.length === 0
                                ? "Add new property to get started!"
                                : "Try adjusting your search terms"
                            }
                        </p>
                        {properties.length === 0 && (
                            <Button
                                onClick={() => router.push('/add-property')}
                                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Add your first property
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 