/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://an-gi-o-dau-api-64eh.onrender.com/api'
      : 'http://localhost:5000/api';
    
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['react-leaflet', 'leaflet'],
  webpack: (config) => {
    return config;
  },
}

export default nextConfig
