import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const basePath = '/feishu-app/'

const config = defineConfig({
  base: basePath,
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      router: {
        basepath: '/feishu-app',
      },
    }),
    nitro({
      baseURL: basePath,
      externals: {
        external: ['better-sqlite3'],
      },
    }),
    viteReact(),
  ],
})

export default config
