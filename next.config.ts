import type { NextConfig } from "next";

// STATIC_EXPORT=1 genera una versión estática (carpeta out/) para vistas previas.
const nextConfig: NextConfig = {
  ...(process.env.STATIC_EXPORT ? { output: "export", trailingSlash: true } : {}),
};

export default nextConfig;
