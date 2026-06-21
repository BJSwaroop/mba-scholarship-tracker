import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' keeps asset paths relative so the same build works on
// Vercel (root domain) AND GitHub Pages (project sub-path) with no extra config.
export default defineConfig({
  base: './',
  plugins: [react()],
});
