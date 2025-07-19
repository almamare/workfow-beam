"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Building, Calendar, Users, CreditCard, Shield, CheckCircle, Star, Wifi, Car, Coffee } from 'lucide-react';
import { useCurrency } from '@/components/providers/currency-provider';
import { toast } from 'sonner';

function HotelBookingContent() {
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const [step, setStep] = useState(1);
  const [guestData, setGuestData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Mock hotel data
  const hotelData = {
    name: 'Grand Palace Hotel',
    location: 'Downtown, 0.5 km from center',
    rating: 4.8,
    reviews: 1247,
    checkIn: '2024-12-15',
    checkOut: '2024-12-18',
    nights: 3,
    rooms: 1,
    guests: 2,
    roomType: 'Deluxe Room',
    pricePerNight: 299,
    amenities: ['wifi', 'parking', 'restaurant', 'pool'],
    image: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop'
  };

  const amenityIcons = {
    wifi: { icon: Wifi, label: 'Free WiFi' },
    parking: { icon: Car, label: 'Free Parking' },
    restaurant: { icon: Coffee, label: 'Restaurant' },
    pool: { icon: Building, label: 'Swimming Pool' }
  };

  const handleGuestChange = (field: string, value: string) => {
    setGuestData(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handleBooking = () => {
    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    
    toast.success('Hotel booked successfully!');
    // Redirect to confirmation page
  };

  const totalPrice = hotelData.pricePerNight * hotelData.nights * hotelData.rooms;
  const taxes = Math.round(totalPrice * 0.12);
  const fees = 15;
  const finalTotal = totalPrice + taxes + fees;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <span>Home</span>
            <ArrowRight className="h-4 w-4" />
            <span>Hotels</span>
            <ArrowRight className="h-4 w-4" />
            <span>Booking</span>
          </div>
          <h1 className="text-2xl font-bold">Complete Your Hotel Booking</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step >= stepNum ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step > stepNum ? <CheckCircle className="h-4 w-4" /> : stepNum}
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {stepNum === 1 ? 'Guest Info' : stepNum === 2 ? 'Payment' : 'Confirmation'}
                  </span>
                  {stepNum < 3 && <ArrowRight className="h-4 w-4 mx-4 text-gray-400" />}
                </div>
              ))}
            </div>

            {/* Step 1: Guest Information */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Guest Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={guestData.firstName}
                        onChange={(e) => handleGuestChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={guestData.lastName}
                        onChange={(e) => handleGuestChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={guestData.email}
                        onChange={(e) => handleGuestChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={guestData.phone}
                        onChange={(e) => handleGuestChange('phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                    <Input
                      id="specialRequests"
                      placeholder="e.g., Late check-in, room preferences, accessibility needs"
                      value={guestData.specialRequests}
                      onChange={(e) => handleGuestChange('specialRequests', e.target.value)}
                    />
                  </div>

                  <Button onClick={() => setStep(2)} className="w-full">
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Information */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="cardholderName">Cardholder Name *</Label>
                      <Input
                        id="cardholderName"
                        value={paymentData.cardholderName}
                        onChange={(e) => handlePaymentChange('cardholderName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentData.cardNumber}
                        onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date *</Label>
                      <Input
                        id="expiryDate"
                        placeholder="MM/YY"
                        value={paymentData.expiryDate}
                        onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV *</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={paymentData.cvv}
                        onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold">Billing Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="billingAddress">Address *</Label>
                        <Input
                          id="billingAddress"
                          value={paymentData.billingAddress}
                          onChange={(e) => handlePaymentChange('billingAddress', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={paymentData.city}
                          onChange={(e) => handlePaymentChange('city', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          value={paymentData.zipCode}
                          onChange={(e) => handlePaymentChange('zipCode', e.target.value)}
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="country">Country *</Label>
                        <Select onValueChange={(value) => handlePaymentChange('country', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="ca">Canada</SelectItem>
                            <SelectItem value="au">Australia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to the hotel's terms and conditions, cancellation policy, and privacy policy.
                    </Label>
                  </div>

                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleBooking} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      Complete Booking
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Hotel Details */}
                <div className="space-y-3">
                  <img
                    src={hotelData.image}
                    alt={hotelData.name}
                    className="w-full h-32 object-cover rounded"
                  />
                  
                  <div>
                    <h3 className="font-bold">{hotelData.name}</h3>
                    <p className="text-sm text-muted-foreground">{hotelData.location}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(hotelData.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm ml-1">{hotelData.rating} ({hotelData.reviews} reviews)</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Check-in:</span>
                      <span>{hotelData.checkIn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Check-out:</span>
                      <span>{hotelData.checkOut}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nights:</span>
                      <span>{hotelData.nights}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Room:</span>
                      <Badge variant="secondary">{hotelData.roomType}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Guests:</span>
                      <span>{hotelData.guests}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Amenities */}
                  <div>
                    <p className="text-sm font-medium mb-2">Amenities:</p>
                    <div className="grid grid-cols-2 gap-1">
                      {hotelData.amenities.map((amenity) => {
                        const amenityInfo = amenityIcons[amenity as keyof typeof amenityIcons];
                        const Icon = amenityInfo.icon;
                        return (
                          <div key={amenity} className="flex items-center space-x-1 text-xs">
                            <Icon className="h-3 w-3" />
                            <span>{amenityInfo.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{hotelData.nights} nights × {formatPrice(hotelData.pricePerNight)}</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Taxes & Fees</span>
                    <span>{formatPrice(taxes)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Service Fee</span>
                    <span>{formatPrice(fees)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-emerald-600">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure payment protected by SSL</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HotelBookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HotelBookingContent />
    </Suspense>
  );
}