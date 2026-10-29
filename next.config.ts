import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.dummyjson.com" },
      { protocol: "https", hostname: "res.cloudinary.com" }, // for admin uploads in Module 11
    ],
  },
};

export default nextConfig;
