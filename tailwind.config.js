/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#080808',
        surface: '#0e0e0e',
        'surface-hi': '#141414',
        hi: '#f2f2f2',
        mid: '#737373',
        lo: '#3a3a3a',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Menlo', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4' }],
        display: ['32px', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
      },
      letterSpacing: {
        label: '0.12em',
      },
      borderWidth: {
        '0.5': '0.5px',
      },
    },
  },
  plugins: [],
}
