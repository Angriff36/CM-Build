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
      '@caterkingapp/shared': path.resolve(__dirname, '../../libs/shared/src'),
      '@caterkingapp/supabase': path.resolve(__dirname, '../../libs/supabase/src'),
      '@caterkingapp/ui': path.resolve(__dirname, '../../libs/ui/src'),
    },
  },
});
