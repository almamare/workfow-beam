"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, Globe, Award, Shield, Heart, Plane, Building, FileText, Star, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/components/providers/language-provider';

export default function AboutPage() {
  const { t, isRTL } = useLanguage();

  const stats = [
    { icon: Users, label: 'Happy Customers', value: '2M+' },
    { icon: Globe, label: 'Countries Served', value: '150+' },
    { icon: Plane, label: 'Flight Partners', value: '500+' },
    { icon: Building, label: 'Hotel Partners', value: '1M+' },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your personal and payment information is protected with industry-leading security measures.'
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'We put our customers at the heart of everything we do, ensuring exceptional service and support.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for excellence in every aspect of our service, from booking to post-travel support.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Connecting travelers worldwide with comprehensive travel solutions and local expertise.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      bio: '15+ years in travel industry'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      bio: 'Technology innovation expert'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Head of Customer Experience',
      image: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      bio: 'Customer service excellence'
    },
    {
      name: 'David Kim',
      role: 'VP of Operations',
      image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop',
      bio: 'Global operations specialist'
    }
  ];

  const milestones = [
    { year: '2020', event: 'SkyWings founded with a vision to simplify travel booking' },
    { year: '2021', event: 'Reached 100,000 satisfied customers and expanded to 50 countries' },
    { year: '2022', event: 'Launched visa services and mobile app with 1M+ downloads' },
    { year: '2023', event: 'Achieved 2M+ customers and 150+ country coverage' },
    { year: '2024', event: 'Introduced AI-powered travel recommendations and 24/7 support' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 text-sm text-muted-foreground mb-2`}>
            <span>Home</span>
            <ArrowRight className="h-4 w-4" />
            <span>{t('nav.about')}</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{t('nav.about')} SkyWings</h1>
          <p className="text-muted-foreground text-lg">
            Your trusted travel companion, making dreams take flight since 2020
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Making Travel Dreams Come True</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            At SkyWings, we believe that travel has the power to transform lives, create lasting memories, 
            and bring people together. Since our founding in 2020, we've been dedicated to making travel 
            accessible, affordable, and unforgettable for millions of travelers worldwide.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                </div>
                <p className="text-3xl font-bold text-sky-600 mb-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                <Heart className="h-5 w-5 text-red-500" />
                <span>Our Mission</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To democratize travel by providing seamless, secure, and affordable booking experiences 
                that connect people with the world. We strive to remove barriers and make every journey 
                possible, from spontaneous weekend getaways to once-in-a-lifetime adventures.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                <Star className="h-5 w-5 text-yellow-500" />
                <span>Our Vision</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To become the world's most trusted travel platform, where every traveler feels confident, 
                supported, and inspired. We envision a future where travel planning is effortless, 
                sustainable, and accessible to everyone, regardless of their background or budget.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-8">Our Core Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-sky-600 dark:text-sky-400" />
                  </div>
                  <h4 className="font-semibold mb-3">{value.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>What We Offer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`flex items-start ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plane className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Flight Booking</h4>
                  <p className="text-sm text-muted-foreground">
                    Access to 500+ airlines worldwide with competitive prices and flexible booking options.
                  </p>
                </div>
              </div>
              <div className={`flex items-start ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Hotel Reservations</h4>
                  <p className="text-sm text-muted-foreground">
                    Over 1 million properties from budget-friendly to luxury accommodations worldwide.
                  </p>
                </div>
              </div>
              <div className={`flex items-start ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Visa Services</h4>
                  <p className="text-sm text-muted-foreground">
                    Expert visa assistance and application processing for 150+ countries with 98% success rate.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-8">Our Journey</h3>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div key={index} className={`flex items-start ${isRTL ? 'space-x-reverse' : ''} space-x-4`}>
                    <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{milestone.year}</span>
                    </div>
                    <div className="flex-1 pt-3">
                      <p className="text-muted-foreground">{milestone.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-8">Meet Our Leadership Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h4 className="font-semibold mb-1">{member.name}</h4>
                  <p className="text-sm text-sky-600 mb-2">{member.role}</p>
                  <p className="text-xs text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Awards & Recognition */}
        <Card>
          <CardHeader>
            <CardTitle className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
              <Award className="h-5 w-5 text-yellow-500" />
              <span>Awards & Recognition</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Best Travel Platform 2024 - Travel Awards</span>
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Customer Choice Award 2023 - TripAdvisor</span>
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Innovation in Travel Technology 2023</span>
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Best Mobile App 2022 - App Store</span>
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Fastest Growing Travel Company 2022</span>
              </div>
              <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">ISO 27001 Security Certification</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="bg-gradient-to-r from-sky-500 to-blue-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
            <p className="text-lg mb-6 opacity-90">
              Join millions of travelers who trust SkyWings for their adventures
            </p>
            <div className={`flex flex-wrap justify-center gap-4 ${isRTL ? 'space-x-reverse' : ''}`}>
              <Badge variant="secondary" className="text-sky-600">
                2M+ Happy Customers
              </Badge>
              <Badge variant="secondary" className="text-sky-600">
                24/7 Support
              </Badge>
              <Badge variant="secondary" className="text-sky-600">
                Best Price Guarantee
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}