import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString() || 'https://aktivcro.com';
  
  const robotsTxt = `# AktivCRO Robots.txt - Optimized for SEO
# Generated: ${new Date().toISOString()}

# Main search engine crawlers - optimized settings
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 2

# All other crawlers
User-agent: *
Allow: /

# Block API endpoints and private areas from indexing
Disallow: /api/
Disallow: /_astro/*.map
Disallow: /admin/
Disallow: /.vercel/
Disallow: /.env*
Disallow: /temp/
Disallow: /*.json$

# Block tracking URLs and success pages with sensitive data
Disallow: /success?session_id=*
Disallow: /*?utm_*
Disallow: /*&utm_*

# Allow important static assets for better rendering
Allow: /_astro/*.css
Allow: /_astro/*.js
Allow: /favicon.svg
Allow: /og-image.svg
Allow: /manifest.json
Allow: /sw.js
Allow: /images/
Allow: /assets/
Allow: /*.svg$
Allow: /*.png$
Allow: /*.jpg$
Allow: /*.jpeg$
Allow: /*.webp$

# Sitemaps
Sitemap: ${siteUrl.replace(/\/$/, '')}/sitemap.xml

# Additional bot information
# Host: ${siteUrl.replace(/\/$/, '')}
# Contact: ${siteUrl.replace(/\/$/, '')}/contact`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600' // Cache for 1 hour
    }
  });
};