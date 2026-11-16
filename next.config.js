/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // KX uses a server-side Route Handler as a backend-for-frontend.
  // Static export would prevent that authenticated proxy from running.
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
