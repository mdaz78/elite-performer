/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'monospace'],
      },
      colors: {
        // Primary Colors
        primary: {
          50: '#F0F4FF',
          100: '#E0E9FF',
          200: '#C7D7FE',
          300: '#A4BCFD',
          400: '#8098F9',
          500: '#6366F1', // Main Primary
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        // Success / Progress Colors
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#10B981', // Main Success
          600: '#059669',
          700: '#047857',
        },
        // Accent / Warning Colors
        accent: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          500: '#F59E0B', // Main Accent
          600: '#D97706',
        },
        // Neutral Colors
        neutral: {
          0: '#FFFFFF', // Background
          50: '#F9FAFB', // Secondary Background
          100: '#F3F4F6', // Tertiary Background
          200: '#E5E7EB', // Borders
          300: '#D1D5DB', // Dividers
          400: '#9CA3AF', // Disabled
          500: '#6B7280', // Secondary Text
          600: '#4B5563', // Body Text
          700: '#374151',
          800: '#1F2937', // Headings
          900: '#111827', // Primary Text
        },
        // Semantic Colors
        error: {
          500: '#EF4444',
          600: '#DC2626',
        },
        warning: {
          500: '#F59E0B',
        },
        info: {
          500: '#3B82F6',
        },
      },
      fontSize: {
        // Typography Scale
        display: ['48px', { lineHeight: '1.1', fontWeight: '700' }],
        h1: ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['30px', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        h4: ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        h5: ['18px', { lineHeight: '1.5', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        body: ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        overline: [
          '11px',
          {
            lineHeight: '1.5',
            fontWeight: '600',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          },
        ],
      },
      spacing: {
        // 4px base unit spacing system
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        7: '28px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
        24: '96px',
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      boxShadow: {
        // Light Theme Shadows
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        DEFAULT: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        md: '0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)',
        lg: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
        xl: '0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)',
        // Dark Theme Shadows (use with dark: prefix)
        'dark-sm': '0 1px 2px rgba(0,0,0,0.3)',
        dark: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'dark-md': '0 4px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
        'dark-lg': '0 10px 15px rgba(0,0,0,0.5), 0 4px 6px rgba(0,0,0,0.3)',
        'dark-xl': '0 20px 25px rgba(0,0,0,0.6), 0 10px 10px rgba(0,0,0,0.4)',
      },
      transitionDuration: {
        DEFAULT: '150ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      // Background colors for dark mode
      backgroundColor: {
        dark: {
          primary: '#0A0A0B',
          secondary: '#1A1A1D',
          tertiary: '#27272A',
        },
      },
    },
  },
  plugins: [],
};
