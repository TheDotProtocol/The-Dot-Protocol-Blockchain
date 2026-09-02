/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure path aliases
  webpack: (config) => {
    config.resolve.alias['@'] = __dirname;
    return config;
  },
};

module.exports = nextConfig;
