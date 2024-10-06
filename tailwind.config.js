/** @type {import('tailwindcss').Config} */

import { PRIMARY_COLOR_VARIATIONS } from './shared/packages/constants/colors';

// import Color from 'color';

export default {
  darkMode: 'class',
  content: [
    './components/**/*.vue',
    './components/*.vue',
    './layouts/*.vue',
    './pages/**/*.vue',
    './pages/*.vue',
    './app/**/*.vue',
  ],
  theme: {
    fontSize: {
      '2xs': '0.5rem',
      xs: '0.6rem',
      sm: '0.75rem',
      md: '0.875rem',
      base: '0.875rem',
      lg: '1rem',
      xl: '1.125rem',
      '2xl': '1.25rem',
      '3xl': '1.5rem',
      '4xl': '1.875rem',
      '5xl': '2.25rem',
      '6xl': '3rem',
      '7xl': '3.75rem',
      '8xl': '4.5rem',
      '9xl': '6rem',
    },
    extend: {
      colors: {
        default: {
          light: '#27272a',
          dark: '#fafafa',
        },
        primary: PRIMARY_COLOR_VARIATIONS
      },
      backgroundImage: {
        'gradient-circle': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      }
    }
  },
}
