import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const withBundleAnalyzer =
  () =>
  (config = {}) =>
    config;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@codemachine/ui', '@codemachine/shared', '@codemachine/supabase'],
  experimental: {
    typedRoutes: true,
  },
};

export default withBundleAnalyzer()(nextConfig);
