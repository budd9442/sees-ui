import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove turbo config as it's not valid in this Next.js version
  output: "standalone",
};

export default nextConfig;
