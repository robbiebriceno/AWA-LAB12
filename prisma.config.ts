import "dotenv/config"; // Carga variables de .env
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Usa la variable de entorno DATABASE_URL; si falta, Prisma lanzará error antes de conectar.
    url: env("DATABASE_URL"),
  },
});
