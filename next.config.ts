import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Evita ejecutar rutas de API durante el build en Vercel (no SSG para /api)
    staleTimes: {
      dynamic: 0,
    },
  },
};

export default nextConfig;
