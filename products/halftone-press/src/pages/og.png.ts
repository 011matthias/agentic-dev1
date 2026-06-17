// Generated social share image: a static route that builds a real 1200x630 PNG
// from the brand TOKENS, so the share card always matches the site and is never a
// hand-made stale asset. At `astro build` this prerenders to dist/og.png.
//
// Pipeline: read the brand colors from brand.css (the single source), satori lays
// the card out (HTML-ish -> SVG) with the self-hosted display + body faces, resvg
// rasterizes SVG -> PNG. Layout points og:image at /og.png.
import type { APIRoute } from 'astro'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { formatHex, parse } from 'culori'
import { SITE_TITLE, SITE_TAGLINE } from '../consts'

export const prerender = true

// Pull the LIGHT-palette role values straight from brand.css (the `--name: oklch(...)`
// lines; the dark set is `--name-dark` and the [data-theme] block uses var(), so
// neither is matched). oklch -> hex via culori, so the card is genuinely token-driven.
// Read from the project root (cwd during `astro build`); import.meta.url would
// resolve into the bundled output dir, where these source files do not exist.
const fromRoot = (rel: string): string => join(process.cwd(), rel)
const brandCss = readFileSync(fromRoot('src/styles/tokens/brand.css'), 'utf8')
const role = (name: string, fallback: string): string => {
  const m = brandCss.match(new RegExp(`--${name}:\\s*(oklch\\([^)]*\\))`))
  const hex = m ? formatHex(parse(m[1])) : null
  return hex ?? fallback
}
const bg = role('bg', '#ffffff')
const text = role('text', '#111111')
const muted = role('muted', '#555555')
const brand = role('brand', '#3b63be')
const accent = role('accent', '#007d66')

const display = readFileSync(fromRoot('src/assets/og/SpaceGrotesk-700.woff'))
const body = readFileSync(fromRoot('src/assets/og/IBMPlexSans-400.woff'))

export const GET: APIRoute = async () => {
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          backgroundColor: bg,
          fontFamily: 'IBM Plex Sans',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: 18 },
              children: [
                { type: 'div', props: { style: { width: 30, height: 30, borderRadius: 8, backgroundColor: brand } } },
                {
                  type: 'div',
                  props: {
                    style: { fontSize: 30, fontWeight: 700, color: accent, letterSpacing: 3, textTransform: 'uppercase' },
                    children: SITE_TITLE,
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', fontSize: 76, fontWeight: 700, color: text, fontFamily: 'Space Grotesk', lineHeight: 1.05 },
              children: SITE_TAGLINE,
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', fontSize: 26, color: muted },
              children: new URL(import.meta.env.SITE ?? 'https://example.com').host,
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Space Grotesk', data: display, weight: 700, style: 'normal' },
        { name: 'IBM Plex Sans', data: body, weight: 400, style: 'normal' },
      ],
    },
  )

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng()
  // png is a Node Buffer; wrap as Uint8Array so it satisfies Response's BodyInit.
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  })
}
