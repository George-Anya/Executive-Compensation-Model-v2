import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves this project from a subpath
  // (george-anya.github.io/executive-compensation-model-v2/), not the
  // domain root, so asset URLs need this base path or they'll 404 once
  // deployed. Change this if you ever rename the repository.
  base: '/Executive-Compensation-Model-v2/',
})
