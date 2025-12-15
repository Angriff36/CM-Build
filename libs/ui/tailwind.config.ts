import type { Config } from 'tailwindcss';

const config: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        ink: {
          950: 'var(--ck-color-ink-950)',
          900: 'var(--ck-color-ink-900)',
          600: 'var(--ck-color-ink-600)',
        },
        graphite: {
          800: 'var(--ck-color-graphite-800)',
        },
        paper: {
          0: 'var(--ck-color-paper-0)',
          50: 'var(--ck-color-paper-50)',
          100: 'var(--ck-color-paper-100)',
        },
        foam: {
          200: 'var(--ck-color-foam-200)',
        },
        slate: {
          300: 'var(--ck-color-slate-300)',
        },
        steel: {
          400: 'var(--ck-color-steel-400)',
        },
        azure: {
          500: 'var(--ck-color-azure-500)',
          600: 'var(--ck-color-azure-600)',
        },
        emerald: {
          500: 'var(--ck-color-emerald-500)',
          600: 'var(--ck-color-emerald-600)',
        },
        sun: {
          400: 'var(--ck-color-sun-400)',
        },
        amber: {
          600: 'var(--ck-color-amber-600)',
        },
        rose: {
          500: 'var(--ck-color-rose-500)',
        },
        plum: {
          500: 'var(--ck-color-plum-500)',
        },
        mint: {
          300: 'var(--ck-color-mint-300)',
        },
        ocean: {
          700: 'var(--ck-color-ocean-700)',
        },
        cloud: {
          100: 'var(--ck-color-cloud-100)',
        },
        carbon: {
          900: 'var(--ck-color-carbon-900)',
        },
      },
      animation: {
        shake: 'shake 0.3s ease-in-out',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
      },
    },
  },
};

export default config;
