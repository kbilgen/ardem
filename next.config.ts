import type { NextConfig } from "next";

/**
 * Static export: the whole site is pre-rendered to /out and can be hosted on
 * any static host or CDN (Vercel, Netlify, S3 + CloudFront, Nginx).
 * Images are pre-optimised by scripts/prepare-images.py, so Next's runtime
 * image optimiser isn't needed.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
