import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "lib/db/schema.ts",
  out: "src/generated_files",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgres://aryansh:aryansh@localhost:5432/gator?sslmode=disable",
  },
});

