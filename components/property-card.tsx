"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PropertyCardProps {
  property: {
    id: string;
    listing_title: string;
    address: string;
    city: string;
    rate: number;
    price: number;
    bedrooms: number;
    bathrooms: number;
    description: string;
    PropertyType?: {
      name: string;
    };
    PropertyImage: {
      image_url: string;
    }[];
  };
}

export function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter();
  
  // Get the first image or use a placeholder
  const primaryImage = property.PropertyImage?.[0]?.image_url || '/images/property-placeholder.jpg';
  
  // Generate star rating display
  const renderStars = () => {
    const stars = [];
    const rating = property.rate || 0;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  // Format price display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  // Get property type with fallback
  const propertyType = property.PropertyType?.name || 'Property';

  // Format address display
  const fullAddress = property.address && property.city 
    ? `${property.address}, ${property.city}`
    : property.address || property.city || 'Location not specified';

  const handleCardClick = () => {
    router.push(`/edit-property/${property.id}`);
  };

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Property Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={primaryImage}
          alt={property.listing_title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback image
            const target = e.target as HTMLImageElement;
            target.src = `data:image/svg+xml;base64,${btoa(`
              <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f1f5f9"/>
                <rect x="150" y="100" width="100" height="80" rx="8" fill="#e2e8f0"/>
                <rect x="120" y="140" width="160" height="40" rx="4" fill="#cbd5e1"/>
                <circle cx="200" cy="160" r="15" fill="#94a3b8"/>
                <text x="200" y="220" text-anchor="middle" fill="#64748b" font-size="14">Property Image</text>
              </svg>
            `)}`;
          }}
        />
        
        {/* Availability Badge - Top Right */}
        <div className="absolute top-3 right-3">
          <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold px-3 py-1 rounded-full text-xs">
            Available
          </Badge>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 space-y-3">
        {/* Rating and Property Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {renderStars()}
          </div>
          <Badge variant="secondary" className="text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-100">
            {propertyType}
          </Badge>
        </div>

        {/* Property Title */}
        <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-purple-600 transition-colors duration-200">
          {property.listing_title}
        </h3>

        {/* Address */}
        <p className="text-gray-600 text-sm leading-relaxed">
          {fullAddress}
        </p>

        {/* Price */}
        <div className="pt-2">
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-purple-600">
              {formatPrice(property.price)}
            </span>
            <span className="text-purple-600 font-medium">Day</span>
          </div>
        </div>

        {/* Property Details (Optional) */}
        {(property.bedrooms || property.bathrooms) && (
          <div className="flex items-center space-x-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
            {property.bedrooms && (
              <span className="flex items-center">
                🛏️ {property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}
              </span>
            )}
            {property.bathrooms && (
              <span className="flex items-center">
                🚿 {property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 