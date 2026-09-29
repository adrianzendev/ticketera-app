import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// Tests de fechas "locales" asumen la zona horaria del público (Lima), no la de la máquina.
process.env.TZ = "America/Lima";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
