import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const envDevOrigins = (process.env.ALLOWED_DEV_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  ...(isDev && {
    allowedDevOrigins: [
      "localhost",
      "127.0.0.1",
      "192.168.*.*",
      "10.*.*.*",
      ...envDevOrigins,
    ],
  }),
};

export default nextConfig;