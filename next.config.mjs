/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" }
    ]
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    serverActions: {
      bodySizeLimit: "6mb"
    },
    allowedDevOrigins: ["192.168.100.26:3000", "localhost:3000", "capacitor://localhost", "http://localhost"]
  }
};

export default nextConfig;
