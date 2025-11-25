/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        slide: 'slide var(--duration) linear infinite',
        'slide-reverse': 'slide-reverse var(--duration) linear infinite',
      },
      keyframes: {
        slide: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-100% - var(--gap)))' },
        },
        'slide-reverse': {
          '0%': { transform: 'translateX(calc(-100% - var(--gap)))' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
