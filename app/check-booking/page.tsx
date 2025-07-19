"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Search, Plane, Building, FileText, Calendar, MapPin, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/components/providers/language-provider';
import { useCurrency } from '@/components/providers/currency-provider';
import { toast } from 'sonner';

export default function CheckBookingPage() {
  const [bookingReference, setBookingReference] = useState('');
  const [lastName, setLastName] = useState('');
  const [bookingType, setBookingType] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { t, isRTL } = useLanguage();
  const { formatPrice } = useCurrency();

  // Mock booking data
  const mockBookings = {
    'SKY123456': {
      type: 'flight',
      reference: 'SKY123456',
      status: 'confirmed',
      passenger: 'John Doe',
      airline: 'SkyWings Airlines',
      from: 'JFK',
      to: 'LHR',
      fromCity: 'New York',
      toCity: 'London',
      departure: '08:30',
      arrival: '20:45',
      date: '2024-12-15',
      duration: '7h 15m',
      class: 'Economy',
      price: 899,
      bookingDate: '2024-11-15',
    },
    'HTL789012': {
      type: 'hotel',
      reference: 'HTL789012',
      status: 'confirmed',
      guest: 'Jane Smith',
      hotel: 'Grand Palace Hotel',
      location: 'Paris, France',
      checkIn: '2024-12-20',
      checkOut: '2024-12-23',
      nights: 3,
      roomType: 'Deluxe Room',
      guests: 2,
      price: 897,
      bookingDate: '2024-11-18',
    },
    'VIS345678': {
      type: 'visa',
      reference: 'VIS345678',
      status: 'processing',
      applicant: 'Mike Johnson',
      country: 'United States',
      visaType: 'Tourist Visa',
      applicationDate: '2024-11-10',
      expectedProcessing: '15-30 business days',
      price: 235,
    }
  };

  const handleSearch = async () => {
    if (!bookingReference || !lastName) {
      toast.error('Please enter both booking reference and last name');
      return;
    }

    setIsSearching(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const booking = mockBookings[bookingReference as keyof typeof mockBookings];
    
    if (booking) {
      setSearchResult(booking);
      toast.success('Booking found!');
    } else {
      setSearchResult(null);
      toast.error('Booking not found. Please check your details and try again.');
    }
    
    setIsSearching(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return CheckCircle;
      case 'processing': return AlertCircle;
      default: return AlertCircle;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 text-sm text-muted-foreground mb-2`}>
            <span>Home</span>
            <ArrowRight className="h-4 w-4" />
            <span>{t('nav.check_booking')}</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{t('nav.check_booking')}</h1>
          <p className="text-muted-foreground">
            Enter your booking details to check your reservation status and manage your booking
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                <Search className="h-5 w-5" />
                <span>Find Your Booking</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bookingReference">Booking Reference *</Label>
                  <Input
                    id="bookingReference"
                    placeholder="e.g., SKY123456"
                    value={bookingReference}
                    onChange={(e) => setBookingReference(e.target.value.toUpperCase())}
                    className="uppercase"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bookingType">Booking Type (Optional)</Label>
                  <Select value={bookingType} onValueChange={setBookingType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="flight">Flight</SelectItem>
                      <SelectItem value="hotel">Hotel</SelectItem>
                      <SelectItem value="visa">Visa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleSearch} 
                size="lg" 
                className="w-full"
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Search Booking'}
              </Button>

              <div className="text-sm text-muted-foreground">
                <p className="mb-2"><strong>Sample booking references to try:</strong></p>
                <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
                  <Badge variant="outline" className="cursor-pointer" onClick={() => setBookingReference('SKY123456')}>
                    SKY123456 (Flight)
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer" onClick={() => setBookingReference('HTL789012')}>
                    HTL789012 (Hotel)
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer" onClick={() => setBookingReference('VIS345678')}>
                    VIS345678 (Visa)
                  </Badge>
                </div>
                <p className="mt-2 text-xs">Use any last name for demo purposes</p>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {searchResult && (
            <Card>
              <CardHeader>
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <CardTitle className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                    {searchResult.type === 'flight' && <Plane className="h-5 w-5" />}
                    {searchResult.type === 'hotel' && <Building className="h-5 w-5" />}
                    {searchResult.type === 'visa' && <FileText className="h-5 w-5" />}
                    <span>Booking Details</span>
                  </CardTitle>
                  <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                    {(() => {
                      const StatusIcon = getStatusIcon(searchResult.status);
                      return <StatusIcon className="h-4 w-4" />;
                    })()}
                    <Badge className={getStatusColor(searchResult.status)}>
                      {searchResult.status.charAt(0).toUpperCase() + searchResult.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Booking Reference</p>
                    <p className="font-semibold">{searchResult.reference}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {searchResult.type === 'flight' ? 'Passenger' : 
                       searchResult.type === 'hotel' ? 'Guest' : 'Applicant'}
                    </p>
                    <p className="font-semibold">
                      {searchResult.passenger || searchResult.guest || searchResult.applicant}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Flight Details */}
                {searchResult.type === 'flight' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Flight Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Airline</p>
                        <p className="font-medium">{searchResult.airline}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Route</p>
                        <p className="font-medium">{searchResult.fromCity} → {searchResult.toCity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Date & Time</p>
                        <p className="font-medium">{searchResult.date} at {searchResult.departure}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Class</p>
                        <p className="font-medium">{searchResult.class}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hotel Details */}
                {searchResult.type === 'hotel' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Hotel Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Hotel</p>
                        <p className="font-medium">{searchResult.hotel}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{searchResult.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Check-in / Check-out</p>
                        <p className="font-medium">{searchResult.checkIn} - {searchResult.checkOut}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Room Type</p>
                        <p className="font-medium">{searchResult.roomType}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Visa Details */}
                {searchResult.type === 'visa' && (
                  <div className="space-y-4">
                    <h4 className="font-semibold">Visa Application Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Destination Country</p>
                        <p className="font-medium">{searchResult.country}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Visa Type</p>
                        <p className="font-medium">{searchResult.visaType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Expected Processing</p>
                        <p className="font-medium">{searchResult.expectedProcessing}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold text-green-600">{formatPrice(searchResult.price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Booking Date</p>
                    <p className="font-medium">
                      {searchResult.bookingDate || searchResult.applicationDate}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className={`flex flex-wrap gap-3 ${isRTL ? 'justify-end' : ''}`}>
                  <Button variant="outline">
                    <Calendar className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    Modify Booking
                  </Button>
                  <Button variant="outline">
                    <FileText className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    Download Ticket
                  </Button>
                  {searchResult.status === 'confirmed' && (
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium mb-2">Can't Find Your Booking?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Check your email for the booking confirmation or contact our support team.
                  </p>
                  <Button variant="outline" size="sm">Contact Support</Button>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium mb-2">Need to Make Changes?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Modify your booking dates, passenger details, or other preferences.
                  </p>
                  <Button variant="outline" size="sm">Modify Booking</Button>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium mb-2">Download Documents</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get your tickets, vouchers, and other travel documents.
                  </p>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}