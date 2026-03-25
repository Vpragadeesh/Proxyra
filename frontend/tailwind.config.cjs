/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#08111f',
        slateNight: '#0d1828',
        panel: '#112036',
        accent: '#4fd1c5',
        signal: '#f59e0b',
        danger: '#f87171',
      },
      boxShadow: {
        panel: '0 30px 60px -20px rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
};
