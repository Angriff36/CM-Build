import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@caterkingapp/shared': path.resolve(__dirname, '../../libs/shared/src'),
      '@caterkingapp/supabase': path.resolve(__dirname, '../../libs/supabase/src'),
      '@caterkingapp/ui': path.resolve(__dirname, '../../libs/ui/src'),
    },
  },
});
