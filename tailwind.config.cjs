module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        lmsgreen: 'rgb(var(--primary-rgb) / <alpha-value>)',
        primary: 'rgb(var(--primary-rgb) / <alpha-value>)',
        accent: 'rgb(var(--info-rgb) / <alpha-value>)',
        neutral: {
          DEFAULT: 'rgb(var(--text-main-rgb) / <alpha-value>)',
          muted: 'rgb(var(--text-muted-rgb) / <alpha-value>)'
        },
        app: 'rgb(var(--app-bg-rgb) / <alpha-value>)',
        sidebar: 'rgb(var(--sidebar-bg-rgb) / <alpha-value>)',
        header: 'rgb(var(--header-bg-rgb) / <alpha-value>)',
        surface: 'rgb(var(--surface-bg-rgb) / <alpha-value>)',
        'surface-alt': 'rgb(var(--surface-alt-rgb) / <alpha-value>)',
        'surface-elevated': 'rgb(var(--surface-elevated-rgb) / <alpha-value>)',
        'surface-quiet': 'rgb(var(--surface-quiet-rgb) / <alpha-value>)',
        token: 'rgb(var(--border-color-rgb) / <alpha-value>)',
        main: 'rgb(var(--text-main-rgb) / <alpha-value>)',
        muted: 'rgb(var(--text-muted-rgb) / <alpha-value>)',
        subtle: 'rgb(var(--text-subtle-rgb) / <alpha-value>)',
        success: {
          DEFAULT: 'rgb(var(--success-rgb) / <alpha-value>)',
          soft: 'rgb(var(--success-soft-rgb) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--warning-rgb) / <alpha-value>)',
          soft: 'rgb(var(--warning-soft-rgb) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--danger-rgb) / <alpha-value>)',
          soft: 'rgb(var(--danger-soft-rgb) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--info-rgb) / <alpha-value>)',
          soft: 'rgb(var(--info-soft-rgb) / <alpha-value>)',
        }
      },
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial']
      }
    }
  },
  plugins: [],
}
