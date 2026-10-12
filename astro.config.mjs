import { defineConfig } from "astro/config";
import react from "@astrojs/react";

export default defineConfig({
  integrations: [react()],
  // Keep the existing HTML spacing when upgrading from Astro 5.
  compressHTML: true,
  output: "static"
});
