"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building, Star, MapPin, TrendingUp } from 'lucide-react';
import HotelSearchForm from '@/components/search/hotel-search-form';

const popularDestinations = [
  { city: 'Paris', hotels: 1250, avgPrice: 199, rating: 4.5 },
  { city: 'London', hotels: 980, avgPrice: 249, rating: 4.3 },
  { city: 'New York', hotels: 1500, avgPrice: 299, rating: 4.4 },
  { city: 'Tokyo', hotels: 850, avgPrice: 179, rating: 4.6 },
];

const featuredHotels = [
  {
    name: 'Grand Palace Hotel',
    location: 'Paris, France',
    rating: 4.8,
    price: 299,
    originalPrice: 399,
    image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
  },
  {
    name: 'Seaside Resort',
    location: 'Bali, Indonesia',
    rating: 4.9,
    price: 199,
    originalPrice: 299,
    image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
  },
  {
    name: 'City Center Inn',
    location: 'New York, USA',
    rating: 4.4,
    price: 249,
    originalPrice: 349,
    image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
  },
];

export default function HotelsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <span>Home</span>
            <ArrowRight className="h-4 w-4" />
            <span>Hotels</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Find Your Perfect Stay</h1>
          <p className="text-muted-foreground">Discover amazing hotels and accommodations worldwide</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Search Hotels</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HotelSearchForm />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Popular Destinations */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Popular Destinations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularDestinations.map((dest, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {dest.city}
                        </h4>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm">{dest.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {dest.hotels} hotels available
                      </p>
                      <p className="font-bold text-green-600">
                        From ${dest.avgPrice}/night
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Hotels */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Hotels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featuredHotels.map((hotel, index) => (
                    <div key={index} className="flex space-x-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-24 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{hotel.name}</h4>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {hotel.location}
                        </p>
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm">{hotel.rating}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">${hotel.price}</p>
                        <p className="text-sm text-muted-foreground line-through">
                          ${hotel.originalPrice}
                        </p>
                        <p className="text-xs text-muted-foreground">per night</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  View All Destinations
                </Button>
                <Button className="w-full" variant="outline">
                  Special Offers
                </Button>
                <Button className="w-full" variant="outline">
                  Last Minute Deals
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Why Book With Us?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Star className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Best Price Guarantee</p>
                    <p className="text-xs text-muted-foreground">We'll match any lower price</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Building className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Verified Reviews</p>
                    <p className="text-xs text-muted-foreground">Real reviews from real guests</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">24/7 Support</p>
                    <p className="text-xs text-muted-foreground">Help when you need it</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}