/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    externalDir: true,
  },
};

module.exports = nextConfig; 