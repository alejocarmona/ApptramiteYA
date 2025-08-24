import type {NextConfig} from 'next';
import {env} from './src/config/env.ts';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // This is needed to allow the Next.js dev server to accept requests from the
  // Firebase Studio environment.
  allowedDevOrigins: ['https://*.cloudworkstations.dev'],
};

export default nextConfig;
