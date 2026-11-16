import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  css: {
    modules: {
      // 👇 Treat all CSS as global
      scopeBehaviour: "global",
    }
  },

  build: {
    // 👇 Correct place for output directory
    outDir: 'dist'
  },

  server: {
  proxy: {
    "/api": {
      target: "http://localhost:5000",
      changeOrigin: true
    }
  }
  }
});




