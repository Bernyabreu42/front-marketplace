import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  css: {
    transformer: "postcss",
    postcss: {
      plugins: [tailwindcss({ config: path.resolve(__dirname, "tailwind.config.cjs") }), autoprefixer()],
    },
  },
});
