/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Material Design 3 tokens (CSS variable backed, opacity-modifier friendly) ──
        'background':               'rgb(var(--c-background) / <alpha-value>)',
        'surface':                  'rgb(var(--c-surface) / <alpha-value>)',
        'surface-container-lowest': 'rgb(var(--c-surface-lowest) / <alpha-value>)',
        'surface-container-low':    'rgb(var(--c-surface-low) / <alpha-value>)',
        'surface-container':        'rgb(var(--c-surface-container) / <alpha-value>)',
        'surface-container-high':   'rgb(var(--c-surface-high) / <alpha-value>)',
        'surface-container-highest':'rgb(var(--c-surface-highest) / <alpha-value>)',
        'primary':                  'rgb(var(--c-primary) / <alpha-value>)',
        'primary-container':        'rgb(var(--c-primary-container) / <alpha-value>)',
        'on-primary':               'rgb(var(--c-on-primary) / <alpha-value>)',
        'on-primary-container':     'rgb(var(--c-on-primary-container) / <alpha-value>)',
        'on-surface':               'rgb(var(--c-on-surface) / <alpha-value>)',
        'on-surface-variant':       'rgb(var(--c-on-surface-variant) / <alpha-value>)',
        'outline':                  'rgb(var(--c-outline) / <alpha-value>)',
        'outline-variant':          'rgb(var(--c-outline-variant) / <alpha-value>)',
        'error':                    'rgb(var(--c-error) / <alpha-value>)',
        'error-container':          'rgb(var(--c-error-container) / <alpha-value>)',
        'on-error':                 'rgb(var(--c-on-error) / <alpha-value>)',
        'on-error-container':       'rgb(var(--c-on-error-container) / <alpha-value>)',
        'secondary':                'rgb(var(--c-secondary) / <alpha-value>)',
        'secondary-container':      'rgb(var(--c-secondary-container) / <alpha-value>)',
        'on-secondary-container':   'rgb(var(--c-on-secondary-container) / <alpha-value>)',
        'secondary-fixed-dim':      'rgb(var(--c-secondary-fixed-dim) / <alpha-value>)',
        'tertiary':                 'rgb(var(--c-tertiary) / <alpha-value>)',
        'tertiary-container':       'rgb(var(--c-tertiary-container) / <alpha-value>)',
        'tertiary-fixed':           'rgb(var(--c-tertiary-fixed) / <alpha-value>)',
        'inverse-primary':          'rgb(var(--c-inverse-primary) / <alpha-value>)',
        // ── Legacy dark tokens (kept for non-redesigned components) ──
        dark: {
          DEFAULT: 'rgb(var(--c-background) / <alpha-value>)',
          card:    'rgb(var(--c-surface-lowest) / <alpha-value>)',
          border:  'rgb(var(--c-outline-variant) / <alpha-value>)',
          muted:   'rgb(var(--c-surface-container) / <alpha-value>)',
        },
        gold: {
          DEFAULT: 'rgb(var(--c-primary) / <alpha-value>)',
          light:   'rgb(var(--c-inverse-primary) / <alpha-value>)',
          dark:    'rgb(var(--c-primary-container) / <alpha-value>)',
        },
        priority: {
          emergency: '#FF4444',
          high:      '#FF8C00',
          medium:    '#D4A855',
          low:       '#5C614D',
          done:      '#888888',
        },
      },
      fontFamily: {
        sans:     ['Manrope', 'system-ui', 'sans-serif'],
        headline: ['Noto Serif', 'Georgia', 'serif'],
        serif:    ['Noto Serif', 'Georgia', 'serif'],
        body:     ['Manrope', 'system-ui', 'sans-serif'],
        label:    ['Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'ambient':    '0 32px 48px rgba(27,28,25,0.05)',
        'ambient-sm': '0 8px 24px rgba(27,28,25,0.04)',
        'ambient-up': '0 -8px 24px rgba(27,28,25,0.04)',
      },
    },
  },
  plugins: [],
};
