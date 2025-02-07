/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
  },
  serverRuntimeConfig: {
    maxDuration: 60, // Set max duration to 60 seconds for hobby plan
  },
}

export default nextConfig
