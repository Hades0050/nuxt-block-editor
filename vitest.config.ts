import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true
  },
  resolve: {
    alias: {
      '#block-editor': resolve(__dirname, './src/model')
    }
  }
})
