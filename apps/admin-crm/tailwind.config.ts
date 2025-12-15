import type { Config } from 'tailwindcss';
import uiConfig from '@caterkingapp/ui/tailwind.config';

const config: Config = {
  presets: [uiConfig],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../libs/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
};

export default config;
