import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // 👇 This line forces index.css to be treated as a global stylesheet
      scopeBehaviour: "global",
    },
  },
});
