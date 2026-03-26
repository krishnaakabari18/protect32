/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  

  eslint: {
    ignoreDuringBuilds: true, // ✅ VERY IMPORTANT
  },
};

module.exports = nextConfig;