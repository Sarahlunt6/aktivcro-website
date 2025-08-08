// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false, // We'll use custom base styles
    })
  ],
  output: 'server', // Server for API routes
  adapter: vercel(),
  // Performance optimizations
  vite: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'framer-motion': ['framer-motion'],
            'stripe': ['@stripe/stripe-js'],
            'react-vendor': ['react', 'react-dom']
          }
        }
      }
    }
  },
  // Image optimization
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  },
  // Compression and optimization
  compressHTML: true
});
