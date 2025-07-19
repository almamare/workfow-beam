"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Download, Mail, Calendar, MapPin, Plane, Building, FileText, Share2, Printer as Print } from 'lucide-react';
import { useCurrency } from '@/components/providers/currency-provider';

export default function ConfirmationPage() {
  const { formatPrice } = useCurrency();
  const [bookingType] = useState('flight'); // This would come from URL params or state
  const [confirmationNumber] = useState('SKY' + Math.random().toString(36).substr(2, 9).toUpperCase());

  // Mock booking data
  const bookingData = {
    flight: {
      confirmationNumber,
      airline: 'SkyWings Airlines',
      from: 'JFK',
      to: 'LHR',
      fromCity: 'New York',
      toCity: 'London',
      departure: '08:30',
      arrival: '20:45',
      date: '2024-12-15',
      duration: '7h 15m',
      passengers: ['John Doe'],
      class: 'Economy',
      price: 899
    },
    hotel: {
      confirmationNumber,
      name: 'Grand Palace Hotel',
      location: 'Downtown, Paris',
      checkIn: '2024-12-15',
      checkOut: '2024-12-18',
      nights: 3,
      roomType: 'Deluxe Room',
      guests: 2,
      price: 897
    }
  };

  const currentBooking = bookingData[bookingType as keyof typeof bookingData];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-muted-foreground">
              Your {bookingType} has been successfully booked
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Confirmation Number: <span className="font-bold">{confirmationNumber}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {bookingType === 'flight' ? (
                      <Plane className="h-5 w-5" />
                    ) : bookingType === 'hotel' ? (
                      <Building className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                    <span>Booking Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingType === 'flight' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{currentBooking.airline}</h3>
                        <Badge>{currentBooking.class}</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{currentBooking.departure}</p>
                          <p className="text-sm text-muted-foreground">{currentBooking.from}</p>
                          <p className="text-xs text-muted-foreground">{currentBooking.fromCity}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <Plane className="h-6 w-6 text-blue-600 mb-1" />
                          <p className="text-xs text-muted-foreground">{currentBooking.duration}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{currentBooking.arrival}</p>
                          <p className="text-sm text-muted-foreground">{currentBooking.to}</p>
                          <p className="text-xs text-muted-foreground">{currentBooking.toCity}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">{currentBooking.date}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Passengers</p>
                          <p className="font-medium">{currentBooking.passengers.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {bookingType === 'hotel' && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{currentBooking.name}</h3>
                        <p className="text-muted-foreground flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {currentBooking.location}
                        </p>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Check-in</p>
                          <p className="font-medium">{currentBooking.checkIn}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Check-out</p>
                          <p className="font-medium">{currentBooking.checkOut}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Nights</p>
                          <p className="font-medium">{currentBooking.nights}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Guests</p>
                          <p className="font-medium">{currentBooking.guests}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Room Type</p>
                          <Badge variant="secondary">{currentBooking.roomType}</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Important Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Important Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bookingType === 'flight' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Check-in Requirements</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Please arrive at the airport at least 3 hours before international flights. 
                          Ensure your passport is valid for at least 6 months.
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Baggage Allowance</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Economy class includes 1 carry-on bag (8kg) and 1 checked bag (23kg).
                        </p>
                      </div>
                    </div>
                  )}

                  {bookingType === 'hotel' && (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <h4 className="font-medium text-green-900 dark:text-green-100">Check-in Information</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Check-in time: 3:00 PM | Check-out time: 11:00 AM
                          Please bring a valid ID and credit card for incidentals.
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Cancellation Policy</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Free cancellation until 24 hours before check-in. 
                          After that, one night's stay will be charged.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Actions & Summary */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Ticket
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Confirmation
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Add to Calendar
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Details
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Print className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(currentBooking.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Taxes & Fees</span>
                      <span>{formatPrice(Math.round(currentBooking.price * 0.15))}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Paid</span>
                      <span className="text-green-600">
                        {formatPrice(currentBooking.price + Math.round(currentBooking.price * 0.15))}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Payment method: •••• •••• •••• 1234
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Transaction ID: TXN{Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our customer support team is available 24/7 to assist you.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                    <p><strong>Email:</strong> support@skywings.com</p>
                    <p><strong>Live Chat:</strong> Available on our website</p>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Next Steps */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Check Your Email</h4>
                  <p className="text-sm text-muted-foreground">
                    We've sent a confirmation email with all the details
                  </p>
                </div>
                <div className="text-center p-4">
                  <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Prepare for Travel</h4>
                  <p className="text-sm text-muted-foreground">
                    Check travel requirements and prepare necessary documents
                  </p>
                </div>
                <div className="text-center p-4">
                  <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium mb-1">Enjoy Your Trip</h4>
                  <p className="text-sm text-muted-foreground">
                    Have a wonderful journey and create amazing memories
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}