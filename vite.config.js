import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const includeRe = /<!--\s*@include:\s*(\S+)\s*-->/g

function htmlIncludes() {
  return {
    name: 'html-includes',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        return html.replace(includeRe, (_, file) => readFileSync(resolve(dirname(ctx.filename), file), 'utf-8'))
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [htmlIncludes(), tailwindcss()],
})
