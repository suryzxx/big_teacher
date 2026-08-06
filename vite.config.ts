import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // 默认部署在域名根路径；GitHub Pages 等子路径场景通过 VITE_APP_BASE 覆盖
  base: process.env.VITE_APP_BASE ?? "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
