import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import createHtmlPlugin from "vite-plugin-simple-html";
import { mailServerPlugin } from "./src/server/mail/vitePlugin";
import { employerMessagesServerPlugin } from "./src/server/messages/vitePlugin";
import { loadServerMailEnv } from "./src/server/mail/env";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  loadServerMailEnv();
  const env = loadEnv(mode, process.cwd(), "");
  for (const [k, v] of Object.entries(env)) {
    if (process.env[k] === undefined || process.env[k] === "") {
      process.env[k] = v;
    }
  }

  return {
    server: {
      port: 5173,
      host: true,
    },
    plugins: [
      react(),
      tailwindcss(),
      mailServerPlugin(),
      employerMessagesServerPlugin(),
    visualizer({
      open: process.env.NODE_ENV !== "CI",
      filename: "./dist/stats.html",
    }),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          mainScript: `src/main.tsx`,
        },
      },
    }),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MiB
      },
      manifest: false, // Use existing manifest.json from public/
    }),
  ],
  define:
    process.env.NODE_ENV === "production" && process.env.VITE_SUPABASE_URL
      ? {
          "import.meta.env.VITE_IS_DEMO": JSON.stringify(
            process.env.VITE_IS_DEMO,
          ),
          "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
            process.env.VITE_SUPABASE_URL,
          ),
          "import.meta.env.VITE_SB_PUBLISHABLE_KEY": JSON.stringify(
            process.env.VITE_SB_PUBLISHABLE_KEY,
          ),
          "import.meta.env.VITE_INBOUND_EMAIL": JSON.stringify(
            process.env.VITE_INBOUND_EMAIL,
          ),
          "import.meta.env.VITE_ATTACHMENTS_BUCKET": JSON.stringify(
            process.env.VITE_ATTACHMENTS_BUCKET,
          ),
        }
      : undefined,
  base: "./",
  esbuild: {
    keepNames: true,
  },
  build: {
    sourcemap: true,
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};
});

