/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts}"],
  theme: {
    extend: {
      colors: {
        'wm': {
          'bg': '#0f172a',
          'surface': '#1e293b',
          'surface-light': '#334155',
          'border': '#475569',
          'primary': '#6366f1',
          'primary-hover': '#818cf8',
          'accent': '#22d3ee',
          'success': '#10b981',
          'warning': '#f59e0b',
          'danger': '#ef4444',
          'text': '#f1f5f9',
          'text-muted': '#94a3b8',
          'text-dim': '#64748b',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
