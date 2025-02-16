import * as path from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  optimizeDeps: {
    include: ['react-dnd', 'react-dnd-html5-backend', 'immutability-helper'],
  },
  // base: '/niitzi/',
  // build: {
  //   outDir: 'niitzi',
  // },
  server: { open: true, port: 3000 },
})
