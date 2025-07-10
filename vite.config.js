import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 12000,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'X-Frame-Options': 'ALLOWALL'
    }
  }
});