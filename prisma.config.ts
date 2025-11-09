import "dotenv/config"; // Carga variables de .env en local (Vercel usa env del proyecto)
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // No usar env() directo aquí para evitar fallo si falta en build; Prisma tomará la URL del schema.
    // Esta clave es requerida por el tipo, pero podemos dejarla vacía y que la resolución ocurra vía schema.
    url: process.env.DATABASE_URL || "postgresql://user:pass@localhost:5432/db?schema=public",
  },
});
