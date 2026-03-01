/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for Cloudflare Pages
  // Pin Turbopack root to frontend so it doesn't use a parent lockfile (faster dev)
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
  },
  // Environment variable for API URL
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  },
  trailingSlash: false,
}

export default nextConfig
