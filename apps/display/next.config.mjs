import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const withBundleAnalyzer =
  () =>
  (config = {}) =>
    config;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
};

export default withBundleAnalyzer()(nextConfig);
