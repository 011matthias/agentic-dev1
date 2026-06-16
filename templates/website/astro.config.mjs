import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

// `site` is the production origin. It is the source of the canonical URLs, the
// sitemap entries, and the absolute og:image, so it must be the real deployed
// origin before launch; the placeholder below is overwritten per product.
// Cloudflare Pages serves at the domain root, so the default base ('/') is
// correct and keeps canonical/sitemap absolute (Astro discourages a relative
// base precisely because it breaks those).
export default defineConfig({
  site: 'https://example.com',
  integrations: [sitemap()],
  vite: {
    // Tailwind v4 is a Vite plugin, not an Astro integration; the config lives
    // in src/styles/global.css via @theme, so there is no tailwind.config.js.
    plugins: [tailwindcss()],
  },
})
