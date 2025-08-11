// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://aktivcro.com', // Required for sitemap and canonical URLs
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
            'vendor': ['react', 'react-dom'],
            'framer': ['framer-motion'],
            'utils': ['zod']
          }
        }
      },
      minify: 'esbuild',
      target: 'es2020',
      cssCodeSplit: true,
      sourcemap: false
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'framer-motion']
    },
    server: {
      fs: {
        strict: false
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
