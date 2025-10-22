import { defineConfig } from "drizzle-kit";
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const drizzleConfig = defineConfig({
  /* config options here */
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schema: "./src/db/schemas.ts",
  out: "./src/db/migrations",
  breakpoints: true,
  strict: true,
  verbose: true,
});

export default drizzleConfig;
