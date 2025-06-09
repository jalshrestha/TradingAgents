/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', 'pdf-parse', 'cheerio']
  },
  images: {
    domains: ['localhost']
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Fix for undici/cheerio compatibility issues
      config.externals.push('cheerio', 'puppeteer', 'pdf-parse')
    }
    return config
  }
}

module.exports = nextConfig 