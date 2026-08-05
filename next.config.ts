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
      {
        // Temporary: free-license stock photos standing in for real product/
        // site photography for client demo purposes. Remove once Cloudinary
        // is wired up and real photography replaces every ContentImage src.
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
