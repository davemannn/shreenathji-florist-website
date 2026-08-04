import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Whitelist Cloudinary's CDN host — next/image blocks unrecognized
    // external image hosts by default. Product/gallery images are served
    // from here once Cloudinary is wired up.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
