import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    proxy: {
      "/api": "http://localhost:5000",
      "/auth": "http://localhost:5000",
      "/register": "http://localhost:5000",
      "/login": "http://localhost:5000",
      "/profile": "http://localhost:5000",
      "/logout": "http://localhost:5000",
      "/session": "http://localhost:5000",
    },
  },
});
