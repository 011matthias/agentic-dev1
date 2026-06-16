import { defineConfig } from 'vite'

// Relative base so the static build serves from any path (Cloudflare Pages,
// GitHub Pages project sites, a subfolder preview) without a rewrite.
export default defineConfig({
  base: './',
})
