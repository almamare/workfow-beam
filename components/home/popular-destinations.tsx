import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

const popularDestinations = [
  {
    id: 1,
    name: 'Paris, France',
    image: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    description: 'City of Love and Lights',
    flightPrice: 899,
    hotelPrice: 199,
    trending: true,
  },
  {
    id: 2,
    name: 'Tokyo, Japan',
    image: 'https://images.pexels.com/photos/2339009/pexels-photo-2339009.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    description: 'Modern metropolis meets tradition',
    flightPrice: 1299,
    hotelPrice: 249,
    trending: false,
  },
  {
    id: 3,
    name: 'Bali, Indonesia',
    image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    description: 'Tropical paradise awaits',
    flightPrice: 799,
    hotelPrice: 149,
    trending: true,
  },
  {
    id: 4,
    name: 'New York, USA',
    image: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    description: 'The city that never sleeps',
    flightPrice: 599,
    hotelPrice: 299,
    trending: false,
  },
  {
    id: 5,
    name: 'Dubai, UAE',
    image: 'https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    description: 'Luxury in the desert',
    flightPrice: 999,
    hotelPrice: 349,
    trending: true,
  },
  {
    id: 6,
    name: 'Rome, Italy',
    image: 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
    description: 'Eternal city of history',
    flightPrice: 749,
    hotelPrice: 179,
    trending: false,
  },
];

export default function PopularDestinations() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Popular Destinations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the world's most beloved destinations with our curated travel experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularDestinations.map((destination) => (
            <Card key={destination.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md">
              <div className="relative">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {destination.trending && (
                  <Badge className="absolute top-4 left-4 bg-orange-500 hover:bg-orange-600">
                    🔥 Trending
                  </Badge>
                )}
                
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <h3 className="text-xl font-bold">{destination.name}</h3>
                  </div>
                  <p className="text-sm opacity-90">{destination.description}</p>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Flights from</p>
                    <p className="font-semibold text-sky-600">${destination.flightPrice}</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Hotels from</p>
                    <p className="font-semibold text-emerald-600">${destination.hotelPrice}/night</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="text-sky-600 hover:text-sky-700 font-semibold text-lg hover:underline">
            Explore All Destinations →
          </button>
        </div>
      </div>
    </section>
  );
}