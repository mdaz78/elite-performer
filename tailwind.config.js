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
      colors: {
        // Notion-inspired color palette
        background: '#FAFAFA',
        'background-dark': '#191919',
        surface: '#FFFFFF',
        'surface-dark': '#1F1F1F',
        border: '#E5E5E5',
        'border-dark': '#2F2F2F',
        'text-primary': '#37352F',
        'text-primary-dark': '#E5E5E5',
        'text-secondary': '#787774',
        'text-secondary-dark': '#9B9A97',
        'text-tertiary': '#9B9A97',
        'text-tertiary-dark': '#6E6D69',
        'accent-blue': '#2383E2',
        'accent-blue-dark': '#4A9EFF',
        'accent-amber': '#F59E0B',
        'accent-amber-dark': '#FBBF24',
        'accent-emerald': '#10B981',
        'accent-emerald-dark': '#34D399',
      },
    },
  },
  plugins: [],
}
