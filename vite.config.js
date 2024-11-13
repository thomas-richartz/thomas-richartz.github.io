import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/thomas-richartz.github.io/',
  define: {
    'process.env': {},
  },
  server: {
    port: 3000,
  },
});