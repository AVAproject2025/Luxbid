import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // LuxBid Brand Colors based on the new logo
        luxbid: {
          // Gold/Bronze from "Lux"
          gold: {
            50: '#faf8f2',
            100: '#f4f0e1',
            200: '#e8dec0',
            300: '#dac499',
            400: '#c9a674',
            500: '#B8975A', // Main gold from logo
            600: '#a0824d',
            700: '#886a3f',
            800: '#6f5633',
            900: '#5a4529',
          },
          // Dark/Black from "Bid"
          dark: {
            50: '#f6f6f6',
            100: '#e7e7e7',
            200: '#d1d1d1',
            300: '#b0b0b0',
            400: '#888888',
            500: '#6d6d6d',
            600: '#5d5d5d',
            700: '#4f4f4f',
            800: '#404040',
            900: '#2D2D2D', // Main dark from logo
            950: '#1a1a1a',
          }
        },
        // Custom brand palette
        brand: {
          primary: '#B8975A',    // Gold
          secondary: '#2D2D2D',  // Dark
          accent: '#404040',     // Gray
          light: '#F5F5F5',      // Light background
        },
        // Override default colors for consistency
        primary: {
          DEFAULT: '#B8975A',
          50: '#faf8f2',
          100: '#f4f0e1',
          200: '#e8dec0',
          300: '#dac499',
          400: '#c9a674',
          500: '#B8975A',
          600: '#a0824d',
          700: '#886a3f',
          800: '#6f5633',
          900: '#5a4529',
        }
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #B8975A 0%, #2D2D2D 100%)',
        'gradient-gold': 'linear-gradient(135deg, #faf8f2 0%, #B8975A 100%)',
        'gradient-dark': 'linear-gradient(135deg, #404040 0%, #2D2D2D 100%)',
      }
    },
  },
  plugins: [],
} satisfies Config;

export default config;
