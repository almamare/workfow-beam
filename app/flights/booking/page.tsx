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
import { ArrowRight, Plane, Clock, Users, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { useCurrency } from '@/components/providers/currency-provider';
import { toast } from 'sonner';

function FlightBookingContent() {
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const [step, setStep] = useState(1);
  const [passengerData, setPassengerData] = useState([
    { firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', passport: '' }
  ]);
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

  // Mock flight data
  const flightData = {
    airline: 'SkyWings Airlines',
    from: 'JFK',
    to: 'LHR',
    fromCity: 'New York',
    toCity: 'London',
    departure: '08:30',
    arrival: '20:45',
    duration: '7h 15m',
    date: '2024-12-15',
    price: 899,
    class: 'Economy'
  };

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const updated = [...passengerData];
    updated[index] = { ...updated[index], [field]: value };
    setPassengerData(updated);
  };

  const handlePaymentChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handleBooking = () => {
    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    
    toast.success('Flight booked successfully!');
    // Redirect to confirmation page
  };

  const totalPrice = flightData.price * passengerData.length;
  const taxes = Math.round(totalPrice * 0.15);
  const fees = 25;
  const finalTotal = totalPrice + taxes + fees;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <span>Home</span>
            <ArrowRight className="h-4 w-4" />
            <span>Flights</span>
            <ArrowRight className="h-4 w-4" />
            <span>Booking</span>
          </div>
          <h1 className="text-2xl font-bold">Complete Your Booking</h1>
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
                    step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step > stepNum ? <CheckCircle className="h-4 w-4" /> : stepNum}
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {stepNum === 1 ? 'Passenger Info' : stepNum === 2 ? 'Payment' : 'Confirmation'}
                  </span>
                  {stepNum < 3 && <ArrowRight className="h-4 w-4 mx-4 text-gray-400" />}
                </div>
              ))}
            </div>

            {/* Step 1: Passenger Information */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Passenger Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {passengerData.map((passenger, index) => (
                    <div key={index} className="space-y-4 mb-6">
                      <h4 className="font-semibold">Passenger {index + 1}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`firstName-${index}`}>First Name *</Label>
                          <Input
                            id={`firstName-${index}`}
                            value={passenger.firstName}
                            onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`lastName-${index}`}>Last Name *</Label>
                          <Input
                            id={`lastName-${index}`}
                            value={passenger.lastName}
                            onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`email-${index}`}>Email *</Label>
                          <Input
                            id={`email-${index}`}
                            type="email"
                            value={passenger.email}
                            onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`phone-${index}`}>Phone *</Label>
                          <Input
                            id={`phone-${index}`}
                            value={passenger.phone}
                            onChange={(e) => handlePassengerChange(index, 'phone', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`dateOfBirth-${index}`}>Date of Birth *</Label>
                          <Input
                            id={`dateOfBirth-${index}`}
                            type="date"
                            value={passenger.dateOfBirth}
                            onChange={(e) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`passport-${index}`}>Passport Number *</Label>
                          <Input
                            id={`passport-${index}`}
                            value={passenger.passport}
                            onChange={(e) => handlePassengerChange(index, 'passport', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      {index < passengerData.length - 1 && <Separator />}
                    </div>
                  ))}
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
                      I agree to the terms and conditions and privacy policy. I understand the cancellation and refund policies.
                    </Label>
                  </div>

                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button onClick={handleBooking} className="flex-1">
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
                {/* Flight Details */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Plane className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{flightData.airline}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="font-bold">{flightData.departure}</p>
                      <p className="text-sm text-muted-foreground">{flightData.from}</p>
                      <p className="text-xs text-muted-foreground">{flightData.fromCity}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{flightData.duration}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">{flightData.arrival}</p>
                      <p className="text-sm text-muted-foreground">{flightData.to}</p>
                      <p className="text-xs text-muted-foreground">{flightData.toCity}</p>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Date:</span>
                    <span>{flightData.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Class:</span>
                    <Badge variant="secondary">{flightData.class}</Badge>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Flight ({passengerData.length} passenger{passengerData.length > 1 ? 's' : ''})</span>
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
                    <span className="text-green-600">{formatPrice(finalTotal)}</span>
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

export default function FlightBookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FlightBookingContent />
    </Suspense>
  );
}