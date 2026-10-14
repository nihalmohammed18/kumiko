import type { NextConfig } from "next";

const config: NextConfig = {
  // Kumiko's docs tell every Next app to add this: it keeps unused components out of client bundles.
  experimental: { optimizePackageImports: ["kumiko-ui"] },
};

export default config;
