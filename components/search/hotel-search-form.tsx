"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Users } from 'lucide-react';
import { useLanguage } from '@/components/providers/language-provider';
import { useRouter } from 'next/navigation';

export default function HotelSearchForm() {
  const [destination, setDestination] = useState('');
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const { t } = useLanguage();
  const router = useRouter();

  const handleSearch = () => {
    const searchParams = new URLSearchParams({
      destination,
      checkin: checkInDate ? format(checkInDate, 'yyyy-MM-dd') : '',
      checkout: checkOutDate ? format(checkOutDate, 'yyyy-MM-dd') : '',
      rooms: rooms.toString(),
      guests: guests.toString(),
    });

    router.push(`/hotels/search?${searchParams.toString()}`);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Destination */}
      <div className="relative">
        <Label htmlFor="destination">Destination</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="destination"
            placeholder="Enter city or hotel name"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Check-in Date */}
        <div>
          <Label>{t('search.check_in')}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkInDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkInDate ? format(checkInDate, "PPP") : <span>Check-in date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkInDate}
                onSelect={setCheckInDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out Date */}
        <div>
          <Label>{t('search.check_out')}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !checkOutDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {checkOutDate ? format(checkOutDate, "PPP") : <span>Check-out date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={checkOutDate}
                onSelect={setCheckOutDate}
                disabled={(date) => date < (checkInDate || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Rooms and Guests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rooms */}
        <div className="relative">
          <Label htmlFor="rooms">{t('search.rooms')}</Label>
          <div className="relative">
            <Input
              id="rooms"
              type="number"
              min="1"
              max="10"
              value={rooms}
              onChange={(e) => setRooms(parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* Guests */}
        <div className="relative">
          <Label htmlFor="guests">{t('search.guests')}</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="guests"
              type="number"
              min="1"
              max="20"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        size="lg"
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
      >
        {t('search.search_hotels')}
      </Button>
    </div>
  );
}