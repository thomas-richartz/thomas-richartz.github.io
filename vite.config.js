import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
  },
  base: '/',
  define: {
    'process.env': {},
  },
  server: {
    port: 3000,
  },
});
