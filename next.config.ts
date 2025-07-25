import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Existing config options */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude modules that perform file system operations at import time
      const externals = Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean);
      config.externals = [...externals, 'pdf2pic', 'gm'];
    }
    return config;
  },
};

export default nextConfig;
