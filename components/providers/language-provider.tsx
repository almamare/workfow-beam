"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ar' | 'zh' | 'ja' | 'ko';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.flights': 'Flights',
    'nav.hotels': 'Hotels',
    'nav.visas': 'Visas',
    'nav.my_bookings': 'My Bookings',
    'nav.profile': 'Profile',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.logout': 'Logout',
    'nav.about': 'About',
    'nav.support': 'Support',
    'nav.check_booking': 'Check Booking',
    
    // Hero
    'hero.title': 'Discover Your Next Adventure',
    'hero.subtitle': 'Book flights, hotels, and visas all in one place. Best prices guaranteed.',
    
    // Search
    'search.flights': 'Flights',
    'search.hotels': 'Hotels',
    'search.visas': 'Visas',
    'search.from': 'From',
    'search.to': 'To',
    'search.departure': 'Departure',
    'search.return': 'Return',
    'search.passengers': 'Passengers',
    'search.rooms': 'Rooms',
    'search.check_in': 'Check In',
    'search.check_out': 'Check Out',
    'search.guests': 'Guests',
    'search.search_flights': 'Search Flights',
    'search.search_hotels': 'Search Hotels',
    'search.country': 'Country',
    'search.visa_type': 'Visa Type',
    'search.apply_visa': 'Apply for Visa',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.success': 'Success!',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.book_now': 'Book Now',
    'common.select_flight': 'Select Flight',
    'common.filters': 'Filters',
    'common.sort_by': 'Sort by',
    'common.price': 'Price',
    'common.duration': 'Duration',
    'common.departure_time': 'Departure Time',
    'common.rating': 'Rating',
    'common.reviews': 'Reviews',
  },
  es: {
    // Navigation
    'nav.flights': 'Vuelos',
    'nav.hotels': 'Hoteles',
    'nav.visas': 'Visas',
    'nav.my_bookings': 'Mis Reservas',
    'nav.profile': 'Perfil',
    'nav.login': 'Iniciar Sesión',
    'nav.signup': 'Registrarse',
    'nav.logout': 'Cerrar Sesión',
    'nav.about': 'Acerca de',
    'nav.support': 'Soporte',
    'nav.check_booking': 'Verificar Reserva',
    
    // Hero
    'hero.title': 'Descubre tu Próxima Aventura',
    'hero.subtitle': 'Reserva vuelos, hoteles y visas en un solo lugar. Los mejores precios garantizados.',
    
    // Search
    'search.flights': 'Vuelos',
    'search.hotels': 'Hoteles',
    'search.visas': 'Visas',
    'search.from': 'Desde',
    'search.to': 'Hasta',
    'search.departure': 'Salida',
    'search.return': 'Regreso',
    'search.passengers': 'Pasajeros',
    'search.rooms': 'Habitaciones',
    'search.check_in': 'Entrada',
    'search.check_out': 'Salida',
    'search.guests': 'Huéspedes',
    'search.search_flights': 'Buscar Vuelos',
    'search.search_hotels': 'Buscar Hoteles',
    'search.country': 'País',
    'search.visa_type': 'Tipo de Visa',
    'search.apply_visa': 'Solicitar Visa',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Algo salió mal',
    'common.success': '¡Éxito!',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.save': 'Guardar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.book_now': 'Reservar Ahora',
    'common.select_flight': 'Seleccionar Vuelo',
    'common.filters': 'Filtros',
    'common.sort_by': 'Ordenar por',
    'common.price': 'Precio',
    'common.duration': 'Duración',
    'common.departure_time': 'Hora de Salida',
    'common.rating': 'Calificación',
    'common.reviews': 'Reseñas',
  },
  fr: {
    // Navigation
    'nav.flights': 'Vols',
    'nav.hotels': 'Hôtels',
    'nav.visas': 'Visas',
    'nav.my_bookings': 'Mes Réservations',
    'nav.profile': 'Profil',
    'nav.login': 'Se Connecter',
    'nav.signup': 'S\'inscrire',
    'nav.logout': 'Se Déconnecter',
    'nav.about': 'À Propos',
    'nav.support': 'Support',
    'nav.check_booking': 'Vérifier Réservation',
    
    // Hero
    'hero.title': 'Découvrez Votre Prochaine Aventure',
    'hero.subtitle': 'Réservez vols, hôtels et visas en un seul endroit. Meilleurs prix garantis.',
    
    // Search
    'search.flights': 'Vols',
    'search.hotels': 'Hôtels',
    'search.visas': 'Visas',
    'search.from': 'De',
    'search.to': 'À',
    'search.departure': 'Départ',
    'search.return': 'Retour',
    'search.passengers': 'Passagers',
    'search.rooms': 'Chambres',
    'search.check_in': 'Arrivée',
    'search.check_out': 'Départ',
    'search.guests': 'Invités',
    'search.search_flights': 'Rechercher des Vols',
    'search.search_hotels': 'Rechercher des Hôtels',
    'search.country': 'Pays',
    'search.visa_type': 'Type de Visa',
    'search.apply_visa': 'Demander un Visa',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Quelque chose a mal tourné',
    'common.success': 'Succès!',
    'common.cancel': 'Annuler',
    'common.confirm': 'Confirmer',
    'common.save': 'Sauvegarder',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.book_now': 'Réserver Maintenant',
    'common.select_flight': 'Sélectionner Vol',
    'common.filters': 'Filtres',
    'common.sort_by': 'Trier par',
    'common.price': 'Prix',
    'common.duration': 'Durée',
    'common.departure_time': 'Heure de Départ',
    'common.rating': 'Note',
    'common.reviews': 'Avis',
  },
  ar: {
    // Navigation
    'nav.flights': 'الرحلات الجوية',
    'nav.hotels': 'الفنادق',
    'nav.visas': 'التأشيرات',
    'nav.my_bookings': 'حجوزاتي',
    'nav.profile': 'الملف الشخصي',
    'nav.login': 'تسجيل الدخول',
    'nav.signup': 'إنشاء حساب',
    'nav.logout': 'تسجيل الخروج',
    'nav.about': 'حول',
    'nav.support': 'الدعم',
    'nav.check_booking': 'التحقق من الحجز',
    
    // Hero
    'hero.title': 'اكتشف مغامرتك القادمة',
    'hero.subtitle': 'احجز الرحلات الجوية والفنادق والتأشيرات في مكان واحد. أفضل الأسعار مضمونة.',
    
    // Search
    'search.flights': 'الرحلات الجوية',
    'search.hotels': 'الفنادق',
    'search.visas': 'التأشيرات',
    'search.from': 'من',
    'search.to': 'إلى',
    'search.departure': 'المغادرة',
    'search.return': 'العودة',
    'search.passengers': 'المسافرون',
    'search.rooms': 'الغرف',
    'search.check_in': 'تسجيل الوصول',
    'search.check_out': 'تسجيل المغادرة',
    'search.guests': 'الضيوف',
    'search.search_flights': 'البحث عن رحلات',
    'search.search_hotels': 'البحث عن فنادق',
    'search.country': 'البلد',
    'search.visa_type': 'نوع التأشيرة',
    'search.apply_visa': 'طلب تأشيرة',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'حدث خطأ ما',
    'common.success': 'نجح!',
    'common.cancel': 'إلغاء',
    'common.confirm': 'تأكيد',
    'common.save': 'حفظ',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.book_now': 'احجز الآن',
    'common.select_flight': 'اختر الرحلة',
    'common.filters': 'المرشحات',
    'common.sort_by': 'ترتيب حسب',
    'common.price': 'السعر',
    'common.duration': 'المدة',
    'common.departure_time': 'وقت المغادرة',
    'common.rating': 'التقييم',
    'common.reviews': 'المراجعات',
  },
  // Add more languages as needed
  de: { 'nav.flights': 'Flüge', 'hero.title': 'Entdecken Sie Ihr nächstes Abenteuer' },
  it: { 'nav.flights': 'Voli', 'hero.title': 'Scopri la tua prossima avventura' },
  pt: { 'nav.flights': 'Voos', 'hero.title': 'Descubra sua próxima aventura' },
  zh: { 'nav.flights': '航班', 'hero.title': '发现您的下一次冒险' },
  ja: { 'nav.flights': 'フライト', 'hero.title': '次の冒険を発見' },
  ko: { 'nav.flights': '항공편', 'hero.title': '다음 모험을 발견하세요' },
};

const rtlLanguages = ['ar'];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Update document direction and language
    const isRTL = rtlLanguages.includes(language);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const isRTL = rtlLanguages.includes(language);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: handleSetLanguage, 
      t, 
      isRTL 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}