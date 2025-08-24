/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        charcoal: '#1F2937',
        'slate-dark': '#374151',
        slate: 'hsl(215, 14%, 34%)',
        'slate-light': '#6B7280',
        silver: '#9CA3AF',
        platinum: '#D1D5DB',
        pearl: '#F3F4F6',
        'accent-blue': '#3B82F6',
        'accent-green': '#10B981',
        'accent-red': '#EF4444',
        'accent-yellow': '#F59E0B',
      },
      fontFamily: {
        sans: ['Satoshi', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}