import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-1': '#09090a',
        'dark-2': '#101012',
        'dark-3': '#16161a',
        'dark-4': '#1f1f22',
        'light-1': '#ffffff',
        'light-2': '#efefef',
        'light-3': '#7878a3',
        'light-4': '#5c5c7b',
        'primary-500': '#877eff',
        'red': '#ff5a5a',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      screens: {
        'xs': '480px',
      },
      width: {
        '465': '465px',
      },
    },
  },
  plugins: [],
};

export default config;