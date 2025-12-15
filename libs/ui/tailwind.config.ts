import type { Config } from 'tailwindcss';

const config: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        ink: {
          950: 'var(--ck-color-ink-950)',
          900: 'var(--ck-color-ink-900)',
        },
        graphite: {
          800: 'var(--ck-color-graphite-800)',
        },
        paper: {
          0: 'var(--ck-color-paper-0)',
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
