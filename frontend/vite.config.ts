import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url' // <-- Add this
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Create an ES Module equivalent of __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: '/DocuQuiz/',

  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Now this works perfectly without TypeScript complaining
      '@': path.resolve(__dirname, './src'),
    },
  },

  assetsInclude: ['**/*.svg', '**/*.csv'],
})