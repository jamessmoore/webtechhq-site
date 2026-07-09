/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/sign-up',
        destination: '/signup',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
