import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    remotePatterns: [new URL('https://res.cloudinary.com/dxmsqw48i/image/upload/**')],
  },
};

export default nextConfig;
