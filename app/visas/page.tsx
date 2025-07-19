"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText, Clock, CheckCircle, Globe } from 'lucide-react';
import VisaSearchForm from '@/components/search/visa-search-form';

const popularVisas = [
  {
    country: 'United States',
    flag: '🇺🇸',
    types: ['Tourist', 'Business', 'Student'],
    processingTime: '15-30 days',
    fee: 185,
    difficulty: 'Medium'
  },
  {
    country: 'United Kingdom',
    flag: '🇬🇧',
    types: ['Tourist', 'Business', 'Work'],
    processingTime: '10-15 days',
    fee: 115,
    difficulty: 'Easy'
  },
  {
    country: 'Canada',
    flag: '🇨🇦',
    types: ['Tourist', 'Business', 'Study'],
    processingTime: '20-25 days',
    fee: 100,
    difficulty: 'Medium'
  },
  {
    country: 'Australia',
    flag: '🇦🇺',
    types: ['Tourist', 'Work', 'Student'],
    processingTime: '12-20 days',
    fee: 145,
    difficulty: 'Easy'
  },
];

const visaServices = [
  {
    title: 'Document Review',
    description: 'Expert review of your documents before submission',
    icon: FileText,
  },
  {
    title: 'Application Assistance',
    description: 'Step-by-step guidance through the application process',
    icon: CheckCircle,
  },
  {
    title: 'Status Tracking',
    description: 'Real-time updates on your application status',
    icon: Clock,
  },
  {
    title: 'Embassy Coordination',
    description: 'Direct coordination with embassy officials',
    icon: Globe,
  },
];

export default function VisasPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <span>Home</span>
            <ArrowRight className="h-4 w-4" />
            <span>Visas</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Visa Services</h1>
          <p className="text-muted-foreground">Get expert help with your visa applications</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Apply for Visa</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VisaSearchForm />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Popular Visas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Popular Visa Destinations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularVisas.map((visa, index) => (
                    <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{visa.flag}</span>
                          <h4 className="font-semibold">{visa.country}</h4>
                        </div>
                        <Badge variant={visa.difficulty === 'Easy' ? 'default' : 'secondary'}>
                          {visa.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{visa.processingTime}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-medium">Fee: ${visa.fee}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Available types:</p>
                        <div className="flex flex-wrap gap-1">
                          {visa.types.map((type, typeIndex) => (
                            <Badge key={typeIndex} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => router.push(`/visas/application?country=${visa.country.split(' ')[0]}&type=tourist`)}
                      >
                        Apply Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Our Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {visaServices.map((service, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <service.icon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{service.title}</h4>
                        <p className="text-xs text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Why Choose Us?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">98% Success Rate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Expert Guidance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Fast Processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">24/7 Support</span>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Our visa experts are here to help you with any questions.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}