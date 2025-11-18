import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
   build: {
      lib: {
         entry: resolve(__dirname, "embed.ts"),
         name: "SamadhanWidget",
         fileName: "widget",
         formats: ["iife"],
      },
      rollupOptions: {
         output: {
            extend: true,
         },
      },
   },
   server: {
      port: 5000,
      open: "/demo.html",
   },
});
