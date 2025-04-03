import type { Config } from 'tailwindcss';
import { theme } from './lib/theme';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: theme.colors.primary,
          hover: theme.colors.primaryHover,
          light: theme.colors.primaryLight,
        },
        secondary: {
          DEFAULT: theme.colors.secondary,
          hover: theme.colors.secondaryHover,
        }
      },
    },
  },
  plugins: [],
};

export default config;