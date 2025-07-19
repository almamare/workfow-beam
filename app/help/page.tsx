"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, Search, BookOpen, CreditCard, Plane, Building, FileText, Phone, MessageCircle } from 'lucide-react';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      icon: Plane,
      title: 'Flight Bookings',
      description: 'Everything about booking and managing flights',
      articles: 12,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Building,
      title: 'Hotel Reservations',
      description: 'Hotel booking and accommodation help',
      articles: 8,
      color: 'bg-emerald-100 text-emerald-600'
    },
    {
      icon: FileText,
      title: 'Visa Services',
      description: 'Visa application and documentation',
      articles: 6,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: CreditCard,
      title: 'Payments & Refunds',
      description: 'Payment methods and refund policies',
      articles: 10,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const popularArticles = [
    {
      title: 'How to cancel or modify my booking?',
      category: 'Bookings',
      views: '15.2k views'
    },
    {
      title: 'What documents do I need for international travel?',
      category: 'Travel',
      views: '12.8k views'
    },
    {
      title: 'How to check-in online for my flight?',
      category: 'Flights',
      views: '11.5k views'
    },
    {
      title: 'Baggage allowance and restrictions',
      category: 'Flights',
      views: '9.7k views'
    },
    {
      title: 'How to request a refund?',
      category: 'Payments',
      views: '8.9k views'
    }
  ];

  const faqData = [
    {
      category: 'Booking',
      questions: [
        {
          question: 'How do I book a flight on SkyWings?',
          answer: 'To book a flight, simply enter your departure and destination cities, select your travel dates, choose the number of passengers, and click "Search Flights". Browse through available options, select your preferred flight, and proceed to payment.'
        },
        {
          question: 'Can I book flights for someone else?',
          answer: 'Yes, you can book flights for other passengers. During the booking process, you\'ll be able to enter the passenger details for each traveler. Make sure to enter the exact names as they appear on their passports.'
        },
        {
          question: 'How far in advance can I book a flight?',
          answer: 'You can typically book flights up to 11 months in advance, depending on the airline. We recommend booking 2-8 weeks in advance for domestic flights and 1-3 months for international flights for the best prices.'
        }
      ]
    },
    {
      category: 'Cancellation & Changes',
      questions: [
        {
          question: 'What is your cancellation policy?',
          answer: 'Cancellation policies vary by airline and fare type. Most economy tickets allow cancellation within 24 hours of booking for a full refund. After that, cancellation fees may apply. Check your booking details for specific terms.'
        },
        {
          question: 'How do I change my flight dates?',
          answer: 'You can modify your booking through your account dashboard or by contacting our support team. Date change fees may apply depending on the airline and fare type. Some flexible tickets allow free changes.'
        },
        {
          question: 'Can I get a refund if I cancel my booking?',
          answer: 'Refund eligibility depends on the fare type and timing of cancellation. Refundable tickets can be cancelled for a full refund minus any applicable fees. Non-refundable tickets may only be eligible for taxes and fees refund.'
        }
      ]
    },
    {
      category: 'Payment & Pricing',
      questions: [
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, and bank transfers. Some bookings may also offer installment payment options.'
        },
        {
          question: 'Are there any hidden fees?',
          answer: 'No, we believe in transparent pricing. All mandatory taxes and fees are included in the displayed price. Optional services like seat selection, baggage, and meals are clearly marked as additional.'
        },
        {
          question: 'Why do prices change when I search again?',
          answer: 'Flight prices are dynamic and change based on demand, availability, and time. Airlines use sophisticated pricing algorithms that adjust prices in real-time. We recommend booking quickly when you find a good price.'
        }
      ]
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
            <span>Help Center</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Help Center</h1>
          <p className="text-muted-foreground">
            Find answers to your questions and get the help you need
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for help articles, FAQs, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Help Categories */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {helpCategories.map((category, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${category.color}`}>
                          <category.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{category.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {category.description}
                          </p>
                          <Badge variant="secondary">
                            {category.articles} articles
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <Card>
                <CardContent className="p-6">
                  {faqData.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-6 last:mb-0">
                      <h3 className="text-lg font-semibold mb-4 text-blue-600">
                        {category.category}
                      </h3>
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((faq, faqIndex) => (
                          <AccordionItem key={faqIndex} value={`${categoryIndex}-${faqIndex}`}>
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Articles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Popular Articles</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularArticles.map((article, index) => (
                    <div key={index} className="pb-4 border-b last:border-b-0 last:pb-0">
                      <h4 className="font-medium text-sm mb-1 hover:text-blue-600 cursor-pointer">
                        {article.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {article.views}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle>Still Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Contact Form
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <a href="/profile" className="block text-blue-600 hover:underline">
                    My Bookings
                  </a>
                  <a href="/contact" className="block text-blue-600 hover:underline">
                    Contact Us
                  </a>
                  <a href="/terms" className="block text-blue-600 hover:underline">
                    Terms of Service
                  </a>
                  <a href="/privacy" className="block text-blue-600 hover:underline">
                    Privacy Policy
                  </a>
                  <a href="/refund" className="block text-blue-600 hover:underline">
                    Refund Policy
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}