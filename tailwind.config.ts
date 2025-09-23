import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // Dark mode support via class
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        
        // Enhanced Brand Colors
        brand: {
          orange: {
            50: 'hsl(var(--brand-orange-50))',
            100: 'hsl(var(--brand-orange-100))',
            200: 'hsl(var(--brand-orange-200))',
            300: 'hsl(var(--brand-orange-300))',
            400: 'hsl(var(--brand-orange-400))',
            500: 'hsl(var(--brand-orange-500))',
            600: 'hsl(var(--brand-orange-600))',
            700: 'hsl(var(--brand-orange-700))',
            800: 'hsl(var(--brand-orange-800))',
            900: 'hsl(var(--brand-orange-900))',
            DEFAULT: 'hsl(var(--brand-orange))',
            light: 'hsl(var(--brand-orange-light))',
            dark: 'hsl(var(--brand-orange-dark))',
          },
          gold: 'hsl(var(--brand-gold))',
          blue: 'hsl(var(--brand-blue))',
          green: 'hsl(var(--brand-green))',
          red: 'hsl(var(--brand-red))',
          yellow: 'hsl(var(--brand-yellow))',
          purple: 'hsl(var(--brand-purple))',
          teal: 'hsl(var(--brand-teal))',
        },
        
        // Slate colors for enhanced UI
        slate: {
          50: 'hsl(var(--slate-50))',
          100: 'hsl(var(--slate-100))',
          200: 'hsl(var(--slate-200))',
          300: 'hsl(var(--slate-300))',
          400: 'hsl(var(--slate-400))',
          500: 'hsl(var(--slate-500))',
          600: 'hsl(var(--slate-600))',
          700: 'hsl(var(--slate-700))',
          800: 'hsl(var(--slate-800))',
          900: 'hsl(var(--slate-900))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'brand': '0 4px 6px -1px rgba(251, 146, 60, 0.1), 0 2px 4px -1px rgba(251, 146, 60, 0.06)',
        'brand-lg': '0 10px 15px -3px rgba(251, 146, 60, 0.1), 0 4px 6px -2px rgba(251, 146, 60, 0.05)',
        'brand-xl': '0 20px 25px -5px rgba(251, 146, 60, 0.1), 0 10px 10px -5px rgba(251, 146, 60, 0.04)',
        'inner-brand': 'inset 0 2px 4px 0 rgba(251, 146, 60, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, hsl(var(--brand-orange)), hsl(var(--brand-gold)))',
        'gradient-brand-soft': 'linear-gradient(135deg, hsl(var(--brand-orange-100)), hsl(var(--brand-orange-200)))',
        'gradient-brand-dark': 'linear-gradient(135deg, hsl(var(--brand-orange-600)), hsl(var(--brand-orange-800)))',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function({ addUtilities }: any) {
      const newUtilities = {
        '.text-gradient': {
          'background': 'linear-gradient(135deg, hsl(var(--brand-orange)), hsl(var(--brand-gold)))',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.border-gradient': {
          'border': '2px solid transparent',
          'background': 'linear-gradient(white, white) padding-box, linear-gradient(135deg, hsl(var(--brand-orange)), hsl(var(--brand-gold))) border-box',
        },
        '.glass-effect': {
          'background': 'rgba(255, 255, 255, 0.8)',
          'backdrop-filter': 'blur(8px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'hsl(var(--brand-orange-300)) hsl(var(--slate-100))',
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: 'hsl(var(--slate-100))'
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'hsl(var(--brand-orange-300))',
            'border-radius': '3px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'hsl(var(--brand-orange-400))'
          }
        }
      }
      addUtilities(newUtilities)
    }
  ],
};

export default config;