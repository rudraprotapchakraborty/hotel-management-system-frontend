import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  // Exposes only the two public keys (Google client id, Stripe publishable key) under their plain
  // names; no other non-VITE_ variable reaches the browser bundle.
  define: {
    "import.meta.env.GOOGLE_CLIENT_ID": JSON.stringify(loadEnv(mode, process.cwd(), "GOOGLE_CLIENT_ID").GOOGLE_CLIENT_ID || ""),
    "import.meta.env.STRIPE_PUBLISHABLE_KEY": JSON.stringify(loadEnv(mode, process.cwd(), "STRIPE_PUBLISHABLE_KEY").STRIPE_PUBLISHABLE_KEY || ""),
  },
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    strictPort: true,
    // In development the API goes through the dev server
    proxy: { "/api": "http://127.0.0.1:5000" },
  },
}));
