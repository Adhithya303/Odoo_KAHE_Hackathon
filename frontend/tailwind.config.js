/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0F6E56', light: '#1D9E75', dark: '#0A5A45' },
        sand: { DEFAULT: '#F5ECD7', dark: '#E8DCC5', light: '#FAF6ED' },
        coral: { DEFAULT: '#D85A30', hover: '#B84820', light: '#E8764F' },
        body: '#2C2C2A',
        muted: '#6B6B68',
        border: '#E0D8CC',
        success: '#1D9E75',
        warning: '#BA7517',
        danger: '#A32D2D',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        input: '8px',
        badge: '999px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.08)',
        elevated: '0 8px 30px rgba(0,0,0,0.12)',
        glow: '0 0 20px rgba(15,110,86,0.15)',
      },
      spacing: {
        section: '48px',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.45s ease forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
