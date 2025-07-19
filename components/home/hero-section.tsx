"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/providers/language-provider';
import SearchTabs from '@/components/home/search-tabs';

const heroSlides = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    title: 'Discover Paradise Islands',
    subtitle: 'Escape to crystal clear waters and pristine beaches',
    overlay: 'from-blue-900/50 to-transparent'
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    title: 'Mountain Adventures Await',
    subtitle: 'Explore breathtaking peaks and scenic landscapes',
    overlay: 'from-gray-900/50 to-transparent'
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/161251/road-trip-travel-route-66-usa-161251.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    title: 'Epic Road Trips',
    subtitle: 'Journey through iconic routes and hidden gems',
    overlay: 'from-orange-900/50 to-transparent'
  },
  {
    id: 4,
    image: 'https://images.pexels.com/photos/1371360/pexels-photo-1371360.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    title: 'City Lights & Culture',
    subtitle: 'Immerse yourself in vibrant urban experiences',
    overlay: 'from-purple-900/50 to-transparent'
  }
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="relative">
      {/* Hero Slider */}
      <div className="relative h-[70vh] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />
            
            {/* Content */}
            <div className="relative z-10 flex items-center justify-center h-full">
              <div className="text-center text-white px-4 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
                  {slide.subtitle}
                </p>
                <p className="text-lg md:text-xl mb-12 opacity-80 max-w-3xl mx-auto">
                  {t('hero.subtitle')}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 border-white/30 text-white hover:bg-white/30"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 border-white/30 text-white hover:bg-white/30"
          onClick={nextSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'bg-white scale-110'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Search Forms Section */}
      <div className="relative -mt-16 z-30 px-4">
        <SearchTabs />
      </div>
    </section>
  );
}