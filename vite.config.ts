import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/ 
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/user': {
        target: 'http://localhost:8000', // Your backend URL
        changeOrigin: true,
        secure: false, // Disable SSL check (for dev)
      },
    },
  },
});