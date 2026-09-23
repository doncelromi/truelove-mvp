import animate from 'tailwindcss-animate'
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        fg: 'var(--text)',
        muted: 'var(--muted)',
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
          hover: 'var(--accent-hover)',
          soft: 'var(--accent-soft)',
          ring: 'var(--accent-ring)',
        },
        ok: '#16a34a',
        warn: '#d97706',
        bad: '#dc2626',
        info: '#2563eb',
      },
      borderRadius: { xl: '12px', lg: '10px' },
      boxShadow: { card: '0 1px 2px rgba(0,0,0,.05)' },
    },
  },
  plugins: [animate],
}
