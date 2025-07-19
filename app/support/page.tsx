"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, Search, Phone, Mail, MessageCircle, Clock, HeadphonesIcon, Globe, Shield, CreditCard, Plane, Building, FileText } from 'lucide-react';
import { useLanguage } from '@/components/providers/language-provider';
import { toast } from 'sonner';

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    category: '',
    priority: '',
    subject: '',
    description: ''
  });
  const { t, isRTL } = useLanguage();

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Support ticket submitted successfully! We\'ll get back to you within 2 hours.');
    setTicketForm({
      name: '',
      email: '',
      category: '',
      priority: '',
      subject: '',
      description: ''
    });
  };

  const supportChannels = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: 'Available 24/7',
      responseTime: 'Instant',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our travel experts',
      availability: 'Available 24/7',
      responseTime: 'Immediate',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us detailed questions and concerns',
      availability: 'Always open',
      responseTime: 'Within 2 hours',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: HeadphonesIcon,
      title: 'Emergency Hotline',
      description: 'For urgent travel assistance',
      availability: '24/7 Emergency only',
      responseTime: 'Immediate',
      color: 'bg-red-100 text-red-600'
    }
  ];

  const quickHelp = [
    {
      icon: Plane,
      title: 'Flight Issues',
      topics: ['Flight cancellation', 'Seat selection', 'Baggage problems', 'Check-in help']
    },
    {
      icon: Building,
      title: 'Hotel Problems',
      topics: ['Booking modification', 'Room upgrades', 'Cancellation policy', 'Special requests']
    },
    {
      icon: FileText,
      title: 'Visa Services',
      topics: ['Application status', 'Document requirements', 'Processing time', 'Visa fees']
    },
    {
      icon: CreditCard,
      title: 'Payment & Refunds',
      topics: ['Refund status', 'Payment methods', 'Billing issues', 'Price protection']
    }
  ];

  const faqData = [
    {
      question: 'How can I cancel or modify my booking?',
      answer: 'You can cancel or modify your booking through your account dashboard or by contacting our support team. Cancellation and modification policies vary by airline, hotel, and fare type. Most bookings allow free cancellation within 24 hours.'
    },
    {
      question: 'What is your refund policy?',
      answer: 'Refund policies depend on the type of booking and fare conditions. Refundable tickets can be cancelled for a full refund minus applicable fees. Non-refundable tickets may only be eligible for taxes and fees refund. Hotel bookings typically offer free cancellation up to 24-48 hours before check-in.'
    },
    {
      question: 'How do I check-in for my flight?',
      answer: 'You can check-in online through the airline\'s website or mobile app, typically 24 hours before departure. You\'ll need your booking reference and last name. Some airlines also offer check-in through our platform.'
    },
    {
      question: 'What documents do I need for international travel?',
      answer: 'For international travel, you typically need a valid passport (with at least 6 months validity) and may require a visa depending on your destination. Check our visa services section for specific requirements for your destination country.'
    },
    {
      question: 'How can I add special requests to my booking?',
      answer: 'Special requests like meal preferences, wheelchair assistance, or room preferences can be added during booking or by contacting our support team. Some requests may incur additional charges.'
    },
    {
      question: 'What if my flight is delayed or cancelled?',
      answer: 'If your flight is delayed or cancelled, contact the airline directly for rebooking options. You may be entitled to compensation depending on the circumstances and regulations. Our support team can also assist with rebooking and finding alternative flights.'
    }
  ];

  const contactInfo = [
    {
      region: 'North America',
      phone: '+1 (555) 123-4567',
      email: 'support-na@skywings.com',
      hours: '24/7'
    },
    {
      region: 'Europe',
      phone: '+44 20 7123 4567',
      email: 'support-eu@skywings.com',
      hours: '24/7'
    },
    {
      region: 'Asia Pacific',
      phone: '+65 6123 4567',
      email: 'support-ap@skywings.com',
      hours: '24/7'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 text-sm text-muted-foreground mb-2`}>
            <span>Home</span>
            <ArrowRight className="h-4 w-4" />
            <span>{t('nav.support')}</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{t('nav.support')} Center</h1>
          <p className="text-muted-foreground">
            We're here to help you 24/7. Get instant support for all your travel needs.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
              <Input
                placeholder="Search for help articles, FAQs, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 text-lg`}
              />
            </div>
          </CardContent>
        </Card>

        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${isRTL ? 'lg:grid-flow-col-dense' : ''}`}>
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Support Channels */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Get Help Now</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supportChannels.map((channel, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className={`flex items-start ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
                        <div className={`p-3 rounded-lg ${channel.color}`}>
                          <channel.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{channel.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {channel.description}
                          </p>
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-xs">
                              {channel.availability}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              Response: {channel.responseTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Help */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Quick Help Topics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickHelp.map((category, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 mb-4`}>
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                          <category.icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold">{category.title}</h3>
                      </div>
                      <div className="space-y-2">
                        {category.topics.map((topic, topicIndex) => (
                          <button
                            key={topicIndex}
                            className={`block w-full text-left text-sm text-blue-600 hover:text-blue-700 hover:underline ${isRTL ? 'text-right' : ''}`}
                          >
                            {topic}
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <Card>
                <CardContent className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {faqData.map((faq, index) => (
                      <AccordionItem key={index} value={`faq-${index}`}>
                        <AccordionTrigger className={isRTL ? 'text-right' : 'text-left'}>
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            {/* Submit Ticket */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Submit a Support Ticket</h2>
              <Card>
                <CardContent className="p-6">
                  <form onSubmit={handleTicketSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={ticketForm.name}
                          onChange={(e) => setTicketForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={ticketForm.email}
                          onChange={(e) => setTicketForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="booking">Booking Issues</SelectItem>
                            <SelectItem value="payment">Payment & Refunds</SelectItem>
                            <SelectItem value="technical">Technical Support</SelectItem>
                            <SelectItem value="visa">Visa Services</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={ticketForm.subject}
                        onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        rows={5}
                        value={ticketForm.description}
                        onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Please provide detailed information about your issue..."
                        required
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full">
                      Submit Ticket
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Emergency Contact */}
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader className="bg-red-50 dark:bg-red-950">
                <CardTitle className="text-red-800 dark:text-red-200 flex items-center space-x-2">
                  <HeadphonesIcon className="h-5 w-5" />
                  <span>Emergency Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                  For urgent travel emergencies, flight disruptions, or immediate assistance.
                </p>
                <div className="space-y-2">
                  <p className="font-medium text-red-800 dark:text-red-200">
                    📞 +1 (555) 911-HELP
                  </p>
                  <p className="font-medium text-red-800 dark:text-red-200">
                    📧 emergency@skywings.com
                  </p>
                  <Badge variant="destructive" className="text-xs">
                    Available 24/7
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Regional Contact */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                  <Globe className="h-5 w-5" />
                  <span>Regional Support</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {contactInfo.map((region, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <h4 className="font-medium mb-2">{region.region}</h4>
                      <div className="space-y-1 text-sm">
                        <p>📞 {region.phone}</p>
                        <p>📧 {region.email}</p>
                        <Badge variant="outline" className="text-xs">
                          {region.hours}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Service Status */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                  <Shield className="h-5 w-5" />
                  <span>Service Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm">Booking System</span>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm">Payment Processing</span>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm">Mobile App</span>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className="text-sm">Email Notifications</span>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Times */}
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                  <Clock className="h-5 w-5" />
                  <span>Response Times</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 text-sm">
                  <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>Live Chat</span>
                    <span className="font-medium">Instant</span>
                  </div>
                  <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>Phone Support</span>
                    <span className="font-medium">Immediate</span>
                  </div>
                  <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>Email Support</span>
                    <span className="font-medium">2 hours</span>
                  </div>
                  <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span>Support Tickets</span>
                    <span className="font-medium">4 hours</span>
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