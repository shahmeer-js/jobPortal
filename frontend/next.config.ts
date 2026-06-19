import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      new URL("https://res.cloudinary.com/dxmsqw48i/image/upload/**"),
    ],
  },
  devIndicators: false,
};

export default nextConfig;
