// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://aktivcro.com', // Required for sitemap and canonical URLs
  // Force deployment refresh
  integrations: [
    react({
      experimentalReactChildren: true,
    }),
    tailwind({
      applyBaseStyles: false, // We'll use custom base styles
    })
  ],
  output: 'static', // Static for now to test deployment
  adapter: cloudflare({
    mode: 'directory',
    functionPerRoute: false,
    platformProxy: {
      enabled: true
    }
  }),
  // Performance optimizations
  vite: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      global: 'globalThis',
    },
    ssr: {
      external: ['node:async_hooks']
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
  // Image optimization - Use compile time for Cloudflare compatibility
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      }
    }
  },
  // Compression and optimization
  compressHTML: true
});
