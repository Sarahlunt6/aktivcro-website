import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Define your site's static pages with SEO-optimized priority and change frequency
const staticPages = [
  // High Priority - Main business pages
  { url: '/', priority: '1.0', changefreq: 'weekly', importance: 'critical' },
  { url: '/calculator', priority: '0.95', changefreq: 'weekly', importance: 'high' }, // Main lead magnet
  { url: '/contact', priority: '0.9', changefreq: 'monthly', importance: 'high' },
  { url: '/case-studies', priority: '0.9', changefreq: 'monthly', importance: 'high' }, // Social proof
  { url: '/about', priority: '0.85', changefreq: 'monthly', importance: 'high' },
  
  // Medium-High Priority - Content and resources
  { url: '/blog', priority: '0.8', changefreq: 'weekly', importance: 'medium-high' },
  { url: '/demos', priority: '0.75', changefreq: 'weekly', importance: 'medium-high' },
  { url: '/resources', priority: '0.7', changefreq: 'weekly', importance: 'medium' },
  
  // Medium Priority - Specific demos and resources
  { url: '/demo/authority', priority: '0.65', changefreq: 'monthly', importance: 'medium' },
  { url: '/demo/conversion-centered', priority: '0.65', changefreq: 'monthly', importance: 'medium' },
  { url: '/demo/cre', priority: '0.65', changefreq: 'monthly', importance: 'medium' },
  { url: '/demo/mobile-pwa', priority: '0.65', changefreq: 'monthly', importance: 'medium' },
  
  // Resource sub-pages
  { url: '/resources/guides', priority: '0.6', changefreq: 'monthly', importance: 'medium' },
  { url: '/resources/reports', priority: '0.6', changefreq: 'monthly', importance: 'medium' },
  { url: '/resources/tools', priority: '0.6', changefreq: 'monthly', importance: 'medium' },
  { url: '/resources/cro-playbook', priority: '0.55', changefreq: 'monthly', importance: 'medium' },
  { url: '/resources/ab-testing-toolkit', priority: '0.55', changefreq: 'monthly', importance: 'medium' },
  { url: '/resources/industry-benchmark-report', priority: '0.55', changefreq: 'monthly', importance: 'medium' },
  
  // Utility pages
  { url: '/success', priority: '0.4', changefreq: 'never', importance: 'low' },
  { url: '/privacy', priority: '0.3', changefreq: 'yearly', importance: 'low' },
  { url: '/terms', priority: '0.3', changefreq: 'yearly', importance: 'low' },
  { url: '/cookies', priority: '0.3', changefreq: 'yearly', importance: 'low' }
];

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString() || 'https://aktivcro.com';
  const baseUrl = siteUrl.replace(/\/$/, '');
  const currentDate = new Date().toISOString().split('T')[0];
  
  try {
    // Get dynamic blog posts with enhanced metadata
    const blogPosts = await getCollection('blog');
    const blogPages = blogPosts
      .sort((a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime())
      .map(post => {
        const publishDate = new Date(post.data.publishDate);
        const isRecent = (Date.now() - publishDate.getTime()) < (30 * 24 * 60 * 60 * 1000); // 30 days
        
        return {
          url: `/blog/${post.slug}`,
          priority: isRecent ? '0.8' : '0.7', // Higher priority for recent posts
          changefreq: isRecent ? 'weekly' : 'monthly',
          lastmod: post.data.publishDate.toISOString().split('T')[0],
          importance: 'medium-high'
        };
      });

    // Combine static and dynamic pages
    const allPages = [
      // Static pages with current date for frequently updated pages
      ...staticPages.map(page => ({
        ...page,
        lastmod: ['/', '/calculator', '/contact', '/blog'].includes(page.url) ? currentDate : '2024-12-01'
      })),
      // Blog pages
      ...blogPages
    ];

    // Sort by priority for better SEO (highest priority first)
    allPages.sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority));

    // Generate enhanced XML sitemap with additional SEO elements
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${page.url.startsWith('/blog/') ? `
    <news:news>
      <news:publication>
        <news:name>AktivCRO</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${page.lastmod}</news:publication_date>
      <news:title>Conversion Rate Optimization Guide</news:title>
    </news:news>` : ''}
  </url>`).join('\n')}
</urlset>`;

    console.log('Sitemap generated successfully:', {
      totalPages: allPages.length,
      staticPages: staticPages.length,
      blogPages: blogPages.length,
      timestamp: new Date().toISOString()
    });

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=3600', // 30min client, 1hr CDN
        'X-Robots-Tag': 'noindex', // Sitemap itself shouldn't be indexed
        'Vary': 'Accept-Encoding'
      }
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Fallback sitemap with just static pages
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=300' // Shorter cache for fallback
      }
    });
  }
};