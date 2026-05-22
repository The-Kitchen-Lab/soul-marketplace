/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        soul: {
          bg: '#050508',
          card: '#0d0d14',
          border: '#1a1a2e',
          purple: '#7c3aed',
          cyan: '#06b6d4',
          muted: '#6b7280',
        },
      },
      fontFamily: {
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #7c3aed40' },
          '100%': { boxShadow: '0 0 20px #7c3aed80, 0 0 40px #7c3aed20' },
        },
      },
    },
  },
  plugins: [],
}
