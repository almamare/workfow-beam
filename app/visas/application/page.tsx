"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Clock, CheckCircle, ArrowRight, Upload, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const visaInfo = {
  US: {
    name: 'United States',
    flag: '🇺🇸',
    processingTime: '15-30 business days',
    fee: 185,
    requirements: [
      'Valid passport (6+ months validity)',
      'Completed DS-160 form',
      'Passport-style photograph',
      'Proof of financial support',
      'Travel itinerary',
      'Employment letter',
    ],
  },
  UK: {
    name: 'United Kingdom',
    flag: '🇬🇧',
    processingTime: '10-15 business days',
    fee: 115,
    requirements: [
      'Valid passport',
      'Bank statements (3 months)',
      'Employment letter',
      'Travel insurance',
      'Accommodation proof',
      'Return flight tickets',
    ],
  },
  CA: {
    name: 'Canada',
    flag: '🇨🇦',
    processingTime: '20-25 business days',
    fee: 100,
    requirements: [
      'Valid passport',
      'Completed application form',
      'Photographs',
      'Financial proof',
      'Travel purpose letter',
      'Medical exam (if required)',
    ],
  },
};

function VisaApplicationContent() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    passportNumber: '',
    dateOfBirth: '',
    travelPurpose: '',
    travelDates: '',
    additionalInfo: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const country = searchParams.get('country') || 'US';
  const visaType = searchParams.get('type') || 'tourist';
  const info = visaInfo[country as keyof typeof visaInfo] || visaInfo.US;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('Visa application submitted successfully!');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
            <span>Home</span>
            <ArrowRight className="h-4 w-4" />
            <span>Visas</span>
            <ArrowRight className="h-4 w-4" />
            <span>Application</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">
            {info.flag} {info.name} Visa Application
          </h1>
          <Badge variant="secondary" className="capitalize">
            {visaType} Visa
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Visa Application Form</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
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
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="nationality">Nationality *</Label>
                        <Select onValueChange={(value) => handleInputChange('nationality', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select nationality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="indian">Indian</SelectItem>
                            <SelectItem value="chinese">Chinese</SelectItem>
                            <SelectItem value="british">British</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Passport Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Passport Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="passportNumber">Passport Number *</Label>
                        <Input
                          id="passportNumber"
                          value={formData.passportNumber}
                          onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Travel Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Travel Information</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="travelPurpose">Purpose of Travel *</Label>
                        <Select onValueChange={(value) => handleInputChange('travelPurpose', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select purpose" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tourism">Tourism</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="family">Family Visit</SelectItem>
                            <SelectItem value="medical">Medical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="travelDates">Intended Travel Dates</Label>
                        <Input
                          id="travelDates"
                          placeholder="e.g., January 15 - February 15, 2025"
                          value={formData.travelDates}
                          onChange={(e) => handleInputChange('travelDates', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="additionalInfo">Additional Information</Label>
                        <Textarea
                          id="additionalInfo"
                          placeholder="Any additional information about your travel plans..."
                          value={formData.additionalInfo}
                          onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Document Upload */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Document Upload</h3>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload your documents (passport, photos, etc.)
                        </p>
                        <Button variant="outline" type="button">
                          Choose Files
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Terms and Conditions */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to the terms and conditions and confirm that all information provided is accurate. 
                      I understand that providing false information may result in visa rejection.
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Visa Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>{info.flag}</span>
                  <span>{info.name} Visa</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Processing Time:</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{info.processingTime}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Visa Fee:</span>
                  <span className="text-lg font-bold text-green-600">${info.fee}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Service Fee:</span>
                  <span className="text-sm font-medium">$50</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total:</span>
                  <span className="text-xl font-bold">${info.fee + 50}</span>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Required Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {info.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{requirement}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Process Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Application Process</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <span className="text-sm">Submit application & documents</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <span className="text-sm">Document verification</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <span className="text-sm">Embassy processing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <span className="text-sm">Visa approval & delivery</span>
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

export default function VisaApplicationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VisaApplicationContent />
    </Suspense>
  );
}