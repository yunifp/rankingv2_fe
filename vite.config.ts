import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- Tambahkan baris ini
  ],
  server: {
    allowedHosts: [
      "swcifjfsf7.ap.loclx.io", // <-- Tambahkan baris ini untuk mengizinkan host
    ],
  },
});
