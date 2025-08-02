/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow access from local network devices during development
  // Note: allowedDevOrigins is not available in current Next.js version
  // Using headers instead for CORS support
  
  // Optional: Add CORS headers for development
  async headers() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Access-Control-Allow-Origin',
              value: '*'
            },
            {
              key: 'Access-Control-Allow-Methods',
              value: 'GET, POST, PUT, DELETE, OPTIONS'
            },
            {
              key: 'Access-Control-Allow-Headers',
              value: 'Content-Type, Authorization'
            }
          ]
        }
      ]
    }
    return []
  }
}

module.exports = nextConfig
