"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Building, Star, MapPin, Filter, ArrowRight, Wifi, Car, Coffee, Waves } from 'lucide-react';
import { useCurrency } from '@/components/providers/currency-provider';

// Mock hotel data
const mockHotels = [
  {
    id: '1',
    name: 'Grand Palace Hotel',
    image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    rating: 4.8,
    reviews: 1247,
    location: 'Downtown, 0.5 km from center',
    price: 299,
    originalPrice: 399,
    amenities: ['wifi', 'parking', 'pool', 'restaurant'],
    description: 'Luxury hotel in the heart of the city with stunning views.',
  },
  {
    id: '2',
    name: 'Seaside Resort & Spa',
    image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    rating: 4.9,
    reviews: 892,
    location: 'Beachfront, 2.1 km from center',
    price: 449,
    originalPrice: 549,
    amenities: ['wifi', 'pool', 'spa', 'restaurant'],
    description: 'Beachfront resort with world-class spa facilities.',
  },
  {
    id: '3',
    name: 'Business Center Inn',
    image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    rating: 4.3,
    reviews: 634,
    location: 'Business District, 1.2 km from center',
    price: 179,
    originalPrice: 229,
    amenities: ['wifi', 'parking', 'gym', 'restaurant'],
    description: 'Modern hotel perfect for business travelers.',
  },
];

const amenityIcons = {
  wifi: Wifi,
  parking: Car,
  restaurant: Coffee,
  pool: Waves,
  spa: Star,
  gym: Building,
};

function HotelSearchContent() {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState(mockHotels);
  const [sortBy, setSortBy] = useState('price');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedRating, setSelectedRating] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const { formatPrice } = useCurrency();

  const destination = searchParams.get('destination') || 'London';
  const checkin = searchParams.get('checkin') || '2024-12-15';
  const checkout = searchParams.get('checkout') || '2024-12-18';
  const rooms = searchParams.get('rooms') || '1';
  const guests = searchParams.get('guests') || '2';

  useEffect(() => {
    // Filter hotels based on selected criteria
    let filteredHotels = mockHotels.filter(hotel => {
      const withinPriceRange = hotel.price >= priceRange[0] && hotel.price <= priceRange[1];
      const matchesRating = selectedRating.length === 0 || selectedRating.some(rating => {
        const ratingNum = parseInt(rating);
        return hotel.rating >= ratingNum && hotel.rating < ratingNum + 1;
      });
      const matchesAmenities = selectedAmenities.length === 0 || selectedAmenities.every(amenity => 
        hotel.amenities.includes(amenity)
      );
      
      return withinPriceRange && matchesRating && matchesAmenities;
    });

    // Sort hotels
    filteredHotels.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviews - a.reviews;
        default:
          return 0;
      }
    });

    setHotels(filteredHotels);
  }, [sortBy, priceRange, selectedRating, selectedAmenities]);

  const handleRatingChange = (rating: string, checked: boolean) => {
    if (checked) {
      setSelectedRating([...selectedRating, rating]);
    } else {
      setSelectedRating(selectedRating.filter(r => r !== rating));
    }
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities([...selectedAmenities, amenity]);
    } else {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Search Results Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <span>Home</span>
            <ArrowRight className="h-4 w-4" />
            <span>Hotels</span>
            <ArrowRight className="h-4 w-4" />
            <span>Search Results</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">
            Hotels in {destination}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{checkin} - {checkout}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4" />
              <span>{rooms} room{rooms !== '1' ? 's' : ''}, {guests} guest{guests !== '1' ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="w-80 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Filter className="h-5 w-5" />
                  <h3 className="font-semibold">Filters</h3>
                </div>

                <div className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <h4 className="font-medium mb-3">Price per night</h4>
                    <div className="space-y-3">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={1000}
                        min={0}
                        step={25}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatPrice(priceRange[0])}</span>
                        <span>{formatPrice(priceRange[1])}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Star Rating */}
                  <div>
                    <h4 className="font-medium mb-3">Star Rating</h4>
                    <div className="space-y-2">
                      {['4', '3', '2', '1'].map((rating) => (
                        <div key={rating} className="flex items-center space-x-2">
                          <Checkbox
                            id={`rating-${rating}`}
                            checked={selectedRating.includes(rating)}
                            onCheckedChange={(checked) => handleRatingChange(rating, checked as boolean)}
                          />
                          <label htmlFor={`rating-${rating}`} className="text-sm flex items-center">
                            {[...Array(parseInt(rating))].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                            <span className="ml-1">{rating}+ stars</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Amenities */}
                  <div>
                    <h4 className="font-medium mb-3">Amenities</h4>
                    <div className="space-y-2">
                      {Object.entries(amenityIcons).map(([amenity, Icon]) => (
                        <div key={amenity} className="flex items-center space-x-2">
                          <Checkbox
                            id={`amenity-${amenity}`}
                            checked={selectedAmenities.includes(amenity)}
                            onCheckedChange={(checked) => handleAmenityChange(amenity, checked as boolean)}
                          />
                          <label htmlFor={`amenity-${amenity}`} className="text-sm flex items-center">
                            <Icon className="h-4 w-4 mr-1" />
                            {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hotel Results */}
          <div className="flex-1 space-y-6">
            {/* Sort Options */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {hotels.length} hotels found
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">Sort by:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                        <SelectItem value="reviews">Reviews</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hotel Cards */}
            <div className="space-y-4">
              {hotels.map((hotel) => (
                <Card key={hotel.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="flex">
                      <div className="w-80 h-64">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-full object-cover rounded-l-lg"
                        />
                      </div>
                      
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-2">{hotel.name}</h3>
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(hotel.rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">{hotel.rating}</span>
                              <span className="text-sm text-muted-foreground">
                                ({hotel.reviews} reviews)
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mb-3">
                              <MapPin className="h-4 w-4 mr-1" />
                              {hotel.location}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {hotel.originalPrice > hotel.price && (
                              <p className="text-sm text-muted-foreground line-through">
                                {formatPrice(hotel.originalPrice)}
                              </p>
                            )}
                            <p className="text-2xl font-bold text-green-600 mb-2">
                              {formatPrice(hotel.price)}
                            </p>
                            <p className="text-sm text-muted-foreground mb-4">per night</p>
                            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                              Book Now
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-4">{hotel.description}</p>
                        
                        <div className="flex items-center space-x-4">
                          {hotel.amenities.map((amenity) => {
                            const Icon = amenityIcons[amenity as keyof typeof amenityIcons];
                            return (
                              <div key={amenity} className="flex items-center space-x-1 text-sm text-muted-foreground">
                                <Icon className="h-4 w-4" />
                                <span className="capitalize">{amenity}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {hotels.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No hotels found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search criteria to find more hotels.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HotelSearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HotelSearchContent />
    </Suspense>
  );
}