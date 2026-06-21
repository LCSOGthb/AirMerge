import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_AQICN_TOKEN: process.env.AQICN_TOKEN,
  },
};

export default nextConfig;
