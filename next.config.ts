import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.digitaloceanspaces.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3005",
        pathname: "/sites/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply CORS headers to all API routes under /api/public/
        source: "/api/public/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "false",
          },
          {
            key: "Access-Control-Expose-Headers",
            value: "Content-Length, X-JSON",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
