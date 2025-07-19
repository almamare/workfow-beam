"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import FlightSearchForm from '@/components/search/flight-search-form';
import HotelSearchForm from '@/components/search/hotel-search-form';
import VisaSearchForm from '@/components/search/visa-search-form';
import { Plane, Building, FileText } from 'lucide-react';
import { useLanguage } from '@/components/providers/language-provider';

export default function SearchTabs() {
  const [activeTab, setActiveTab] = useState('flights');
  const { t } = useLanguage();

  return (
    <section className="relative -mt-20 z-30 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm dark:bg-gray-900/95">
          <CardContent className="p-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="flights" className="flex items-center space-x-2">
                  <Plane className="h-4 w-4" />
                  <span>{t('search.flights')}</span>
                </TabsTrigger>
                <TabsTrigger value="hotels" className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>{t('search.hotels')}</span>
                </TabsTrigger>
                <TabsTrigger value="visas" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>{t('search.visas')}</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="flights" className="mt-0">
                <FlightSearchForm />
              </TabsContent>

              <TabsContent value="hotels" className="mt-0">
                <HotelSearchForm />
              </TabsContent>

              <TabsContent value="visas" className="mt-0">
                <VisaSearchForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}