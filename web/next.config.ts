import type { NextConfig } from "next";

/** Project Pages URL: https://davepartin.github.io/spacetribe-dice/ */
const basePath = process.env.BASE_PATH ?? "/spacetribe-dice";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
