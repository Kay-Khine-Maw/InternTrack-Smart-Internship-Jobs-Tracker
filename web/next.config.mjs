/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "playwright",
      "tesseract.js",
      "tesseract.js-core",
      "pdf-parse",
      "mammoth",
      "@prisma/client",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve = config.resolve || {};
      config.resolve.aliasFields = [];
      config.resolve.mainFields = ["main", "module"];
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push({
          "tesseract.js": "commonjs tesseract.js",
          "tesseract.js-core": "commonjs tesseract.js-core",
        });
      }
    }
    return config;
  },
};

export default nextConfig;
