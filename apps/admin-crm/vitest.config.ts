import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
      '@codemachine/shared': path.resolve(__dirname, '../../libs/shared/src'),
      '@codemachine/supabase': path.resolve(__dirname, '../../libs/supabase/src'),
      '@codemachine/ui': path.resolve(__dirname, '../../libs/ui/src'),
    },
  },
});
