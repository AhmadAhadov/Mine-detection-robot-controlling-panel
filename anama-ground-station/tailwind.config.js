/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'military-black': '#0a0e0a',
        'military-dark': '#121712',
        'military-panel': '#0d110d',
        'military-border': '#1a2a1a',
        'neon-green': '#39ff14',
        'neon-green-dim': '#1a7a08',
        'alert-red': '#ff2020',
        'alert-orange': '#ff8c00',
        'alert-yellow': '#ffd700',
        'panel-bg': '#0f150f',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Roboto Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 8px #39ff14, 0 0 16px #39ff1440',
        'neon-red': '0 0 8px #ff2020, 0 0 16px #ff202040',
        'panel': 'inset 0 0 30px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
}
