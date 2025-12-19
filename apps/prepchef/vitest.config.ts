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
      '@codemachine/shared': path.resolve(__dirname, '../../libs/shared/src'),
      '@codemachine/supabase': path.resolve(__dirname, '../../libs/supabase/src'),
      '@codemachine/ui': path.resolve(__dirname, '../../libs/ui/src'),
    },
  },
});
