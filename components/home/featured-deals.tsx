import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plane, Calendar, MapPin } from 'lucide-react';

const featuredDeals = [
  {
    id: 1,
    type: 'flight',
    title: 'New York to Paris',
    price: 899,
    originalPrice: 1299,
    discount: 31,
    image: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    validUntil: '2024-12-31',
    airline: 'Air France',
  },
  {
    id: 2,
    type: 'hotel',
    title: 'Luxury Resort Bali',
    price: 299,
    originalPrice: 499,
    discount: 40,
    image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    validUntil: '2024-11-30',
    rating: 4.8,
  },
  {
    id: 3,
    type: 'flight',
    title: 'London to Tokyo',
    price: 1299,
    originalPrice: 1799,
    discount: 28,
    image: 'https://images.pexels.com/photos/2339009/pexels-photo-2339009.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    validUntil: '2024-12-15',
    airline: 'JAL',
  },
  {
    id: 4,
    type: 'hotel',
    title: 'Beach Resort Maldives',
    price: 899,
    originalPrice: 1299,
    discount: 31,
    image: 'https://images.pexels.com/photos/1287460/pexels-photo-1287460.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
    validUntil: '2024-12-20',
    rating: 4.9,
  },
];

export default function FeaturedDeals() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Deals
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't miss out on these amazing offers! Limited time deals on flights and hotels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDeals.map((deal) => (
            <Card key={deal.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <div className="relative">
                <img
                  src={deal.image}
                  alt={deal.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">
                  -{deal.discount}%
                </Badge>
                {deal.type === 'flight' && (
                  <div className="absolute top-3 right-3 bg-white/90 rounded-full p-2">
                    <Plane className="h-4 w-4 text-blue-600" />
                  </div>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{deal.title}</h3>
                </div>
                
                {deal.airline && (
                  <p className="text-sm text-muted-foreground mb-2">{deal.airline}</p>
                )}
                {deal.rating && (
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-xs ${i < Math.floor(deal.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground ml-1">({deal.rating})</span>
                  </div>
                )}
                
                <div className="flex items-center mb-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-sm text-muted-foreground">
                    Valid until: {new Date(deal.validUntil).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-green-600">
                      ${deal.price}
                    </span>
                    <span className="text-sm text-muted-foreground line-through ml-2">
                      ${deal.originalPrice}
                    </span>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700">
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            View All Deals
          </Button>
        </div>
      </div>
    </section>
  );
}