"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Plane, Clock, MapPin, Filter, ArrowRight, Star } from 'lucide-react';
import { useCurrency } from '@/components/providers/currency-provider';
import { useLanguage } from '@/components/providers/language-provider';

// Mock flight data with more details for filtering
const mockFlights = [
  {
    id: '1',
    airline: 'SkyWings Airlines',
    logo: 'https://images.pexels.com/photos/912050/pexels-photo-912050.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
    from: 'JFK',
    to: 'LHR',
    fromCity: 'New York',
    toCity: 'London',
    departure: '08:30',
    arrival: '20:45',
    duration: '7h 15m',
    stops: 0,
    price: 899,
    class: 'Economy',
    date: '2024-12-15',
    aircraft: 'Boeing 777',
    rating: 4.5,
    departureTime: 8.5, // for filtering
  },
  {
    id: '2',
    airline: 'Atlantic Airways',
    logo: 'https://images.pexels.com/photos/912050/pexels-photo-912050.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
    from: 'JFK',
    to: 'LHR',
    fromCity: 'New York',
    toCity: 'London',
    departure: '14:20',
    arrival: '02:15+1',
    duration: '7h 55m',
    stops: 1,
    price: 649,
    class: 'Economy',
    date: '2024-12-15',
    aircraft: 'Airbus A330',
    rating: 4.2,
    departureTime: 14.33,
  },
  {
    id: '3',
    airline: 'Premium Air',
    logo: 'https://images.pexels.com/photos/912050/pexels-photo-912050.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
    from: 'JFK',
    to: 'LHR',
    fromCity: 'New York',
    toCity: 'London',
    departure: '22:10',
    arrival: '09:30+1',
    duration: '7h 20m',
    stops: 0,
    price: 1299,
    class: 'Business',
    date: '2024-12-15',
    aircraft: 'Boeing 787',
    rating: 4.8,
    departureTime: 22.17,
  },
  {
    id: '4',
    airline: 'Budget Wings',
    logo: 'https://images.pexels.com/photos/912050/pexels-photo-912050.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
    from: 'JFK',
    to: 'LHR',
    fromCity: 'New York',
    toCity: 'London',
    departure: '06:00',
    arrival: '18:30',
    duration: '8h 30m',
    stops: 2,
    price: 499,
    class: 'Economy',
    date: '2024-12-15',
    aircraft: 'Boeing 737',
    rating: 3.8,
    departureTime: 6.0,
  },
];

function FlightSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [flights, setFlights] = useState(mockFlights);
  const [sortBy, setSortBy] = useState('price');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedStops, setSelectedStops] = useState<string[]>([]);
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string[]>([]);
  const [selectedDepartureTime, setSelectedDepartureTime] = useState<string[]>([]);
  const [selectedAircraft, setSelectedAircraft] = useState<string[]>([]);
  const [minRating, setMinRating] = useState([0]);
  const { formatPrice } = useCurrency();
  const { t, isRTL } = useLanguage();

  const from = searchParams.get('from') || 'New York';
  const to = searchParams.get('to') || 'London';
  const departure = searchParams.get('departure') || '2024-12-15';
  const passengers = searchParams.get('passengers') || '1';

  useEffect(() => {
    // Filter flights based on selected criteria
    let filteredFlights = mockFlights.filter(flight => {
      const withinPriceRange = flight.price >= priceRange[0] && flight.price <= priceRange[1];
      const matchesStops = selectedStops.length === 0 || selectedStops.includes(flight.stops.toString());
      const matchesAirline = selectedAirlines.length === 0 || selectedAirlines.includes(flight.airline);
      const matchesClass = selectedClass.length === 0 || selectedClass.includes(flight.class);
      const matchesRating = flight.rating >= minRating[0];
      const matchesAircraft = selectedAircraft.length === 0 || selectedAircraft.includes(flight.aircraft);
      
      const matchesDepartureTime = selectedDepartureTime.length === 0 || selectedDepartureTime.some(timeSlot => {
        switch (timeSlot) {
          case 'morning': return flight.departureTime >= 6 && flight.departureTime < 12;
          case 'afternoon': return flight.departureTime >= 12 && flight.departureTime < 18;
          case 'evening': return flight.departureTime >= 18 && flight.departureTime < 24;
          case 'night': return flight.departureTime >= 0 && flight.departureTime < 6;
          default: return true;
        }
      });
      
      return withinPriceRange && matchesStops && matchesAirline && matchesClass && matchesRating && matchesDepartureTime && matchesAircraft;
    });

    // Sort flights
    filteredFlights.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'duration':
          return parseInt(a.duration) - parseInt(b.duration);
        case 'departure':
          return a.departure.localeCompare(b.departure);
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFlights(filteredFlights);
  }, [sortBy, priceRange, selectedStops, selectedAirlines, selectedClass, selectedDepartureTime, selectedAircraft, minRating]);

  const handleFilterChange = (filterType: string, value: string, checked: boolean) => {
    switch (filterType) {
      case 'stops':
        setSelectedStops(prev => checked ? [...prev, value] : prev.filter(s => s !== value));
        break;
      case 'airline':
        setSelectedAirlines(prev => checked ? [...prev, value] : prev.filter(a => a !== value));
        break;
      case 'class':
        setSelectedClass(prev => checked ? [...prev, value] : prev.filter(c => c !== value));
        break;
      case 'departureTime':
        setSelectedDepartureTime(prev => checked ? [...prev, value] : prev.filter(t => t !== value));
        break;
      case 'aircraft':
        setSelectedAircraft(prev => checked ? [...prev, value] : prev.filter(a => a !== value));
        break;
    }
  };

  const handleSelectFlight = (flightId: string) => {
    router.push(`/flights/booking?flightId=${flightId}`);
  };

  const uniqueAirlines = [...new Set(mockFlights.map(f => f.airline))];
  const uniqueClasses = [...new Set(mockFlights.map(f => f.class))];
  const uniqueAircraft = [...new Set(mockFlights.map(f => f.aircraft))];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Search Results Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 text-sm text-muted-foreground mb-2`}>
            <span>Home</span>
            <ArrowRight className="h-4 w-4" />
            <span>Flights</span>
            <ArrowRight className="h-4 w-4" />
            <span>Search Results</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">
            {from} to {to}
          </h1>
          <div className={`flex flex-wrap items-center gap-4 text-sm ${isRTL ? 'space-x-reverse' : ''}`}>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
              <MapPin className="h-4 w-4" />
              <span>{departure}</span>
            </div>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
              <Plane className="h-4 w-4" />
              <span>{passengers} passenger{passengers !== '1' ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className={`flex gap-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Filters Sidebar */}
          <div className="w-80 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 mb-4`}>
                  <Filter className="h-5 w-5" />
                  <h3 className="font-semibold">{t('common.filters')}</h3>
                </div>

                <div className="space-y-6">
                  {/* Price Range */}
                  <div>
                    <h4 className="font-medium mb-3">Price Range</h4>
                    <div className="space-y-3">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={2000}
                        min={0}
                        step={50}
                        className="w-full"
                      />
                      <div className={`flex justify-between text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span>{formatPrice(priceRange[0])}</span>
                        <span>{formatPrice(priceRange[1])}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Stops */}
                  <div>
                    <h4 className="font-medium mb-3">Stops</h4>
                    <div className="space-y-2">
                      {['0', '1', '2+'].map((stops) => (
                        <div key={stops} className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                          <Checkbox
                            id={`stops-${stops}`}
                            checked={selectedStops.includes(stops)}
                            onCheckedChange={(checked) => handleFilterChange('stops', stops, checked as boolean)}
                          />
                          <label htmlFor={`stops-${stops}`} className="text-sm">
                            {stops === '0' ? 'Non-stop' : stops === '1' ? '1 stop' : '2+ stops'}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Airlines */}
                  <div>
                    <h4 className="font-medium mb-3">Airlines</h4>
                    <div className="space-y-2">
                      {uniqueAirlines.map((airline) => (
                        <div key={airline} className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                          <Checkbox
                            id={`airline-${airline}`}
                            checked={selectedAirlines.includes(airline)}
                            onCheckedChange={(checked) => handleFilterChange('airline', airline, checked as boolean)}
                          />
                          <label htmlFor={`airline-${airline}`} className="text-sm">
                            {airline}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Class */}
                  <div>
                    <h4 className="font-medium mb-3">Class</h4>
                    <div className="space-y-2">
                      {uniqueClasses.map((flightClass) => (
                        <div key={flightClass} className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                          <Checkbox
                            id={`class-${flightClass}`}
                            checked={selectedClass.includes(flightClass)}
                            onCheckedChange={(checked) => handleFilterChange('class', flightClass, checked as boolean)}
                          />
                          <label htmlFor={`class-${flightClass}`} className="text-sm">
                            {flightClass}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Departure Time */}
                  <div>
                    <h4 className="font-medium mb-3">Departure Time</h4>
                    <div className="space-y-2">
                      {[
                        { value: 'morning', label: 'Morning (6AM - 12PM)' },
                        { value: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
                        { value: 'evening', label: 'Evening (6PM - 12AM)' },
                        { value: 'night', label: 'Night (12AM - 6AM)' }
                      ].map((time) => (
                        <div key={time.value} className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                          <Checkbox
                            id={`time-${time.value}`}
                            checked={selectedDepartureTime.includes(time.value)}
                            onCheckedChange={(checked) => handleFilterChange('departureTime', time.value, checked as boolean)}
                          />
                          <label htmlFor={`time-${time.value}`} className="text-sm">
                            {time.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Aircraft Type */}
                  <div>
                    <h4 className="font-medium mb-3">Aircraft Type</h4>
                    <div className="space-y-2">
                      {uniqueAircraft.map((aircraft) => (
                        <div key={aircraft} className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                          <Checkbox
                            id={`aircraft-${aircraft}`}
                            checked={selectedAircraft.includes(aircraft)}
                            onCheckedChange={(checked) => handleFilterChange('aircraft', aircraft, checked as boolean)}
                          />
                          <label htmlFor={`aircraft-${aircraft}`} className="text-sm">
                            {aircraft}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Rating */}
                  <div>
                    <h4 className="font-medium mb-3">Minimum Rating</h4>
                    <div className="space-y-3">
                      <Slider
                        value={minRating}
                        onValueChange={setMinRating}
                        max={5}
                        min={0}
                        step={0.5}
                        className="w-full"
                      />
                      <div className={`flex justify-between text-sm text-muted-foreground ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <span>0</span>
                        <span>{minRating[0]} stars</span>
                        <span>5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flight Results */}
          <div className="flex-1 space-y-6">
            {/* Sort Options */}
            <Card>
              <CardContent className="p-4">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-sm text-muted-foreground">
                    {flights.length} flights found
                  </span>
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                    <span className="text-sm">{t('common.sort_by')}:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">{t('common.price')}</SelectItem>
                        <SelectItem value="duration">{t('common.duration')}</SelectItem>
                        <SelectItem value="departure">{t('common.departure_time')}</SelectItem>
                        <SelectItem value="rating">{t('common.rating')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Flight Cards */}
            <div className="space-y-4">
              {flights.map((flight) => (
                <Card key={flight.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
                        <img
                          src={flight.logo}
                          alt={flight.airline}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className={isRTL ? 'text-right' : ''}>
                          <p className="font-medium">{flight.airline}</p>
                          <p className="text-sm text-muted-foreground">{flight.class}</p>
                          <p className="text-xs text-muted-foreground">{flight.aircraft}</p>
                          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-1 mt-1`}>
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{flight.rating}</span>
                          </div>
                        </div>
                      </div>

                      <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-8 flex-1 justify-center`}>
                        <div className={`text-center ${isRTL ? 'text-right' : ''}`}>
                          <p className="text-xl font-bold">{flight.departure}</p>
                          <p className="text-sm text-muted-foreground">{flight.from}</p>
                          <p className="text-xs text-muted-foreground">{flight.fromCity}</p>
                        </div>

                        <div className="flex flex-col items-center">
                          <p className="text-sm text-muted-foreground mb-1">{flight.duration}</p>
                          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                            <div className="h-px bg-gray-300 w-12"></div>
                            <Plane className="h-4 w-4 text-sky-600" />
                            <div className="h-px bg-gray-300 w-12"></div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                          </p>
                        </div>

                        <div className={`text-center ${isRTL ? 'text-left' : ''}`}>
                          <p className="text-xl font-bold">{flight.arrival}</p>
                          <p className="text-sm text-muted-foreground">{flight.to}</p>
                          <p className="text-xs text-muted-foreground">{flight.toCity}</p>
                        </div>
                      </div>

                      <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                        <p className="text-2xl font-bold text-green-600 mb-2">
                          {formatPrice(flight.price)}
                        </p>
                        <Button 
                          className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700"
                          onClick={() => handleSelectFlight(flight.id)}
                        >
                          {t('common.select_flight')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {flights.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Plane className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No flights found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search criteria to find more flights.
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

export default function FlightSearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FlightSearchContent />
    </Suspense>
  );
}