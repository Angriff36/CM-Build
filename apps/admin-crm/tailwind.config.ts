import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@caterkingapp/ui/**/*.{js,ts,jsx,tsx}',
  ],
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
    },
  },
  plugins: [],
};

export default config;
