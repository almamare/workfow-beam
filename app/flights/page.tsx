"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plane, Clock, Star, TrendingUp } from 'lucide-react';
import FlightSearchForm from '@/components/search/flight-search-form';

const popularRoutes = [
  { from: 'New York', to: 'London', price: 899, duration: '7h 15m' },
  { from: 'Los Angeles', to: 'Tokyo', price: 1299, duration: '11h 30m' },
  { from: 'Miami', to: 'Paris', price: 799, duration: '8h 45m' },
  { from: 'Chicago', to: 'Rome', price: 949, duration: '9h 20m' },
];

const flightDeals = [
  { destination: 'Bali', discount: '40%', price: 699, originalPrice: 1199 },
  { destination: 'Dubai', discount: '35%', price: 899, originalPrice: 1399 },
  { destination: 'Bangkok', discount: '30%', price: 799, originalPrice: 1149 },
];

export default function FlightsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <span>Home</span>
            <ArrowRight className="h-4 w-4" />
            <span>Flights</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Book Your Flight</h1>
          <p className="text-muted-foreground">Find the best deals on flights worldwide</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plane className="h-5 w-5" />
              <span>Search Flights</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FlightSearchForm />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Popular Routes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Popular Routes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularRoutes.map((route, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="font-semibold">{route.from}</p>
                          <p className="text-sm text-muted-foreground">From</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <div className="text-center">
                          <p className="font-semibold">{route.to}</p>
                          <p className="text-sm text-muted-foreground">To</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">${route.price}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {route.duration}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flight Deals */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Special Deals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {flightDeals.map((deal, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{deal.destination}</h4>
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                          {deal.discount} OFF
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-green-600">${deal.price}</p>
                        <p className="text-sm text-muted-foreground line-through">
                          ${deal.originalPrice}
                        </p>
                      </div>
                      <Button size="sm" className="w-full mt-3">
                        Book Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}