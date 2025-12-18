import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployments
  // Set DOCKER_BUILD=true in CI/CD or when building Docker images
  ...(process.env.DOCKER_BUILD === 'true' && { output: 'standalone' as const }),
};

export default nextConfig;
