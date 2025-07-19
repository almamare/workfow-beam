"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Users, ArrowLeftRight } from 'lucide-react';
import { useLanguage } from '@/components/providers/language-provider';
import { useRouter } from 'next/navigation';

export default function FlightSearchForm() {
  const [tripType, setTripType] = useState('round-trip');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureDate, setDepartureDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [passengers, setPassengers] = useState(1);
  const { t } = useLanguage();
  const router = useRouter();

  const handleSearch = () => {
    const searchParams = new URLSearchParams({
      from,
      to,
      departure: departureDate ? format(departureDate, 'yyyy-MM-dd') : '',
      return: returnDate ? format(returnDate, 'yyyy-MM-dd') : '',
      passengers: passengers.toString(),
      type: tripType,
    });

    router.push(`/flights/search?${searchParams.toString()}`);
  };

  const swapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Trip Type */}
      <RadioGroup value={tripType} onValueChange={setTripType} className="flex space-x-6">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="round-trip" id="round-trip" />
          <Label htmlFor="round-trip">Round Trip</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="one-way" id="one-way" />
          <Label htmlFor="one-way">One Way</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="multi-city" id="multi-city" />
          <Label htmlFor="multi-city">Multi City</Label>
        </div>
      </RadioGroup>

      {/* Location and Date Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* From */}
        <div className="relative">
          <Label htmlFor="from">{t('search.from')}</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="from"
              placeholder="New York (NYC)"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex items-end justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={swapLocations}
            className="mb-0.5"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>

        {/* To */}
        <div className="relative">
          <Label htmlFor="to">{t('search.to')}</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="to"
              placeholder="London (LHR)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Passengers */}
        <div className="relative">
          <Label htmlFor="passengers">{t('search.passengers')}</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="passengers"
              type="number"
              min="1"
              max="9"
              value={passengers}
              onChange={(e) => setPassengers(parseInt(e.target.value))}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Departure Date */}
        <div>
          <Label>{t('search.departure')}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !departureDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {departureDate ? format(departureDate, "PPP") : <span>Pick departure date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={departureDate}
                onSelect={setDepartureDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Return Date */}
        {tripType === 'round-trip' && (
          <div>
            <Label>{t('search.return')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !returnDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {returnDate ? format(returnDate, "PPP") : <span>Pick return date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={setReturnDate}
                  disabled={(date) => date < (departureDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        size="lg"
        className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700"
      >
        {t('search.search_flights')}
      </Button>
    </div>
  );
}