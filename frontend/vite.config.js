import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/tickets-manager/',
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['forskale.com']
  }
});


