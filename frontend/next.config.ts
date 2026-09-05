import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const imageHostname = process.env.NEXT_PUBLIC_IMAGE_HOSTNAME;

const nextConfig: NextConfig = {
  output: "standalone",
  basePath,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: imageHostname ? [{ protocol: "https", hostname: imageHostname }] : [],
  },
  async redirects() {
    return [
      { source: "/:locale(ar|en)/lifestyle/new-arrivals", destination: "/:locale/new-arrivals", permanent: true },
      { source: "/:locale(ar|en)/smart/new-arrivals", destination: "/:locale/new-arrivals", permanent: true },
      { source: "/:locale(ar|en)/lifestyle", destination: "/:locale", permanent: true },
      { source: "/:locale(ar|en)/smart", destination: "/:locale", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" }
        ]
      }
    ];
  }
};

export default nextConfig;
