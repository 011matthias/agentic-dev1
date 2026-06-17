import { defineConfig, fontProviders } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

// `site` is the production origin (canonical URLs, sitemap, absolute og:image).
// Placeholder for this fictional proof-site demo; set the real origin before launch.
export default defineConfig({
  site: 'https://halftone.example',
  integrations: [sitemap()],

  // The technical pairing for a print studio: Space Grotesk (a grotesque display
  // with character) over IBM Plex Sans (a precise workhorse body), IBM Plex Mono
  // for specs and captions. Self-hosted + subset by the Fonts API.
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: 'Space Grotesk',
        cssVariable: '--ff-display',
        weights: ['500', '700'],
        styles: ['normal'],
        subsets: ['latin'],
        display: 'swap',
        fallbacks: ['system-ui', 'sans-serif'],
      },
      {
        provider: fontProviders.google(),
        name: 'IBM Plex Sans',
        cssVariable: '--ff-body',
        weights: ['400', '600'],
        styles: ['normal'],
        subsets: ['latin'],
        display: 'swap',
        fallbacks: ['system-ui', 'sans-serif'],
      },
      {
        provider: fontProviders.google(),
        name: 'IBM Plex Mono',
        cssVariable: '--ff-mono',
        weights: ['400', '600'],
        styles: ['normal'],
        subsets: ['latin'],
        display: 'swap',
        fallbacks: ['ui-monospace', 'monospace'],
      },
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },
})
