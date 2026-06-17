import { defineConfig, fontProviders } from 'astro/config'
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

  // Self-hosted fonts via Astro's Fonts API. The Google provider downloads the
  // faces at build time, subsets them, generates a metric-matched fallback (so
  // no layout shift on swap), and serves them from THIS origin -- no runtime
  // third-party request and no FOIT. <Font> tags in Layout.astro emit the
  // @font-face + preload links. The cssVariables are role-named (--ff-display /
  // --ff-body / --ff-mono) and bound to font-display / font-body / font-mono in
  // contract.css, so a primitive never names a face.
  //
  // THIS PAIRING IS PER-PROJECT (editorial: Fraunces + Mulish, JetBrains Mono for
  // code) and is an EXAMPLE. skil_website-design picks the pairing per brief from
  // the four-pairing library in src/styles/tokens/README.md. To swap a face,
  // change `name` (and weights) here and keep the cssVariable role name.
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: 'Fraunces',
        cssVariable: '--ff-display',
        weights: ['500', '700'],
        styles: ['normal', 'italic'],
        subsets: ['latin'],
        display: 'swap',
        fallbacks: ['Georgia', 'serif'],
      },
      {
        provider: fontProviders.google(),
        name: 'Mulish',
        cssVariable: '--ff-body',
        weights: ['400', '600', '700'],
        styles: ['normal'],
        subsets: ['latin'],
        display: 'swap',
        fallbacks: ['system-ui', 'sans-serif'],
      },
      {
        provider: fontProviders.google(),
        name: 'JetBrains Mono',
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
    // Tailwind v4 is a Vite plugin, not an Astro integration; the token contract
    // lives in src/styles/ via @theme, so there is no tailwind.config.js.
    plugins: [tailwindcss()],
  },
})
