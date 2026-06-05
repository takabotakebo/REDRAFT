import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
  },
  build: {
    outDir: 'dist',
    // マルチページ構成：index に加えて intro / ending も静的HTMLとしてビルド対象にする
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        intro: resolve(__dirname, 'intro.html'),
        ending: resolve(__dirname, 'ending.html'),
      },
    },
  },
  base: './',
})
