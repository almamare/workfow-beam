"use client";

import { useState } from 'react';
import { X, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-sky-600 to-blue-600 text-white py-2 px-4 text-center text-sm relative">
      <div className="flex items-center justify-center space-x-2">
        <Gift className="h-4 w-4" />
        <span className="font-medium">
          🎉 Special Offer: Get 20% off on all international flights! Use code TRAVEL20
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-white hover:bg-white/20"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}