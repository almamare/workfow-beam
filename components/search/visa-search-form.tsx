"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/components/providers/language-provider';
import { useRouter } from 'next/navigation';

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'UAE' },
  { code: 'CN', name: 'China' },
];

const visaTypes = [
  { value: 'tourist', name: 'Tourist Visa' },
  { value: 'business', name: 'Business Visa' },
  { value: 'student', name: 'Student Visa' },
  { value: 'work', name: 'Work Visa' },
  { value: 'transit', name: 'Transit Visa' },
  { value: 'family', name: 'Family/Visit Visa' },
];

export default function VisaSearchForm() {
  const [country, setCountry] = useState('');
  const [visaType, setVisaType] = useState('');
  const { t } = useLanguage();
  const router = useRouter();

  const handleSearch = () => {
    const searchParams = new URLSearchParams({
      country,
      type: visaType,
    });

    router.push(`/visas/application?${searchParams.toString()}`);
  };

  return (
    <div className="space-y-6 p-4">
      {/* Country Selection */}
      <div className="space-y-2">
        <Label>{t('search.country')}</Label>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger>
            <SelectValue placeholder="Select destination country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Visa Type Selection */}
      <div className="space-y-2">
        <Label>{t('search.visa_type')}</Label>
        <Select value={visaType} onValueChange={setVisaType}>
          <SelectTrigger>
            <SelectValue placeholder="Select visa type" />
          </SelectTrigger>
          <SelectContent>
            {visaTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Visa Information</h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Our visa experts will help you with the complete application process, document preparation, 
          and submission. Processing times vary by country and visa type.
        </p>
      </div>

      {/* Search Button */}
      <Button
        onClick={handleSearch}
        size="lg"
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        disabled={!country || !visaType}
      >
        {t('search.apply_visa')}
      </Button>
    </div>
  );
}