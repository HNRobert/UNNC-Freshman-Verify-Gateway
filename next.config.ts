import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(yml|yaml)$/,
      use: "raw-loader",
    });

    return config;
  },
};

export default nextConfig;
