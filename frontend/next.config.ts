import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@stacks/transactions', '@stacks/connect', '@stacks/network'],
};

export default nextConfig;