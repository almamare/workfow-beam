"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Phone, Mail, MapPin, Clock, MessageCircle, HeadphonesIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: '',
    message: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      category: '',
      message: ''
    });
  };

  const contactMethods = [
    {
      icon: Phone,
      title: '24/7 Phone Support',
      description: 'Speak with our travel experts anytime',
      contact: '+1 (555) 123-4567',
      available: 'Available 24/7'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us your questions and concerns',
      contact: 'support@skywings.com',
      available: 'Response within 2 hours'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team instantly',
      contact: 'Available on website',
      available: 'Available 24/7'
    },
    {
      icon: HeadphonesIcon,
      title: 'Emergency Hotline',
      description: 'For urgent travel assistance',
      contact: '+1 (555) 911-HELP',
      available: 'Emergency only'
    }
  ];

  const officeLocations = [
    {
      city: 'New York',
      address: '123 Travel Street, Manhattan, NY 10001',
      phone: '+1 (555) 123-4567',
      hours: 'Mon-Fri: 9AM-6PM EST'
    },
    {
      city: 'London',
      address: '456 Aviation Road, London, UK SW1A 1AA',
      phone: '+44 20 7123 4567',
      hours: 'Mon-Fri: 9AM-6PM GMT'
    },
    {
      city: 'Tokyo',
      address: '789 Sky Tower, Shibuya, Tokyo 150-0002',
      phone: '+81 3 1234 5678',
      hours: 'Mon-Fri: 9AM-6PM JST'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <span>Home</span>
            <ArrowRight className="h-4 w-4" />
            <span>Contact</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
          <p className="text-muted-foreground">
            We're here to help with all your travel needs. Get in touch with our expert team.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="booking">Booking Assistance</SelectItem>
                          <SelectItem value="cancellation">Cancellation/Refund</SelectItem>
                          <SelectItem value="modification">Booking Modification</SelectItem>
                          <SelectItem value="visa">Visa Services</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="feedback">Feedback/Complaint</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please describe your inquiry in detail..."
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">How can I cancel my booking?</h4>
                    <p className="text-sm text-muted-foreground">
                      You can cancel your booking through your account dashboard or by contacting our support team. 
                      Cancellation policies vary by airline and hotel.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">What documents do I need for international travel?</h4>
                    <p className="text-sm text-muted-foreground">
                      You'll need a valid passport and may require a visa depending on your destination. 
                      Check our visa services for detailed requirements.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">How do I check my booking status?</h4>
                    <p className="text-sm text-muted-foreground">
                      Log into your account and visit the "My Bookings" section to view all your reservations 
                      and their current status.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactMethods.map((method, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <method.icon className="h-5 w-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium">{method.title}</h4>
                        <p className="text-sm text-muted-foreground mb-1">{method.description}</p>
                        <p className="text-sm font-medium">{method.contact}</p>
                        <p className="text-xs text-muted-foreground">{method.available}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Office Locations */}
            <Card>
              <CardHeader>
                <CardTitle>Office Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {officeLocations.map((office, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <h4 className="font-semibold flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {office.city}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">{office.address}</p>
                      <p className="text-sm mt-1">
                        <Phone className="h-3 w-3 inline mr-1" />
                        {office.phone}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {office.hours}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                    24/7 Emergency Assistance
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                    For urgent travel emergencies, flight disruptions, or immediate assistance while traveling.
                  </p>
                  <div className="space-y-1">
                    <p className="font-medium text-red-800 dark:text-red-200">
                      📞 +1 (555) 911-HELP
                    </p>
                    <p className="font-medium text-red-800 dark:text-red-200">
                      📧 emergency@skywings.com
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}