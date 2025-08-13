# Cloudflare Pages Deployment Setup

This guide walks you through deploying the AktivCRO website to Cloudflare Pages with Workers integration.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Domain**: Add your domain `aktivcro.com` to Cloudflare DNS
3. **Wrangler CLI**: Install globally with `npm install -g wrangler`

## Deployment Steps

### 1. Authenticate with Cloudflare

```bash
wrangler login
```

### 2. Create Pages Project

```bash
wrangler pages project create aktivcro-website
```

### 3. Deploy from Local Build

```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=aktivcro-website
```

### 4. Set Environment Variables

Go to your Cloudflare dashboard → Pages → aktivcro-website → Settings → Environment Variables

**Required Environment Variables:**

```
GEMINI_API_KEY=your_gemini_api_key_here
GHL_API_KEY=your_gohighlevel_api_key_here
GHL_WEBHOOK_URL=your_gohighlevel_webhook_url_here
CONTACT_EMAIL=contact@aktivcro.com
SITE_URL=https://aktivcro.com
GOOGLE_ANALYTICS_ID=your_google_analytics_id_here
MICROSOFT_CLARITY_ID=your_microsoft_clarity_id_here
NODE_ENV=production
```

### 5. Configure Custom Domain

1. Go to Pages → aktivcro-website → Custom domains
2. Add `aktivcro.com` and `www.aktivcro.com`
3. Update your DNS records as instructed by Cloudflare

### 6. Set Up Automatic Deployments (Optional)

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Enable automatic deployments on push to main branch

## Testing Deployment

### Test API Routes

1. **Lead Capture**: `https://aktivcro.com/api/lead-capture`
2. **Newsletter Signup**: `https://aktivcro.com/api/newsletter-signup`
3. **GoHighLevel Webhook**: `https://aktivcro.com/api/gohighlevel-webhook`
4. **Demo Generator**: `https://aktivcro.com/api/generate-demo`
5. **AI Demo Generator**: `https://aktivcro.com/api/generate-ai-demo`
6. **Test Webhook**: `https://aktivcro.com/api/test-webhook`

### Test Interactive Features

1. **Demo Homepage Generator** (main lead capture)
2. **Conversion Calculator** with PDF generation
3. **GoHighLevel Calendar Booking** with ID: `hCr9hGNBqVfKjgpizPHV`
4. **Framework Showcase** with animations

## Performance Optimization

### Enable Cloudflare Features

1. **Speed → Optimization**:
   - Auto Minify: CSS, JavaScript, HTML
   - Brotli compression
   - Early Hints

2. **Caching**:
   - Browser Cache TTL: 4 hours
   - Always Online: On
   - Development Mode: Off (for production)

3. **Security**:
   - Security Level: Medium
   - Bot Fight Mode: On
   - DDoS Protection: On

## Monitoring

### Analytics Setup

1. **Web Analytics**: Enable in Cloudflare dashboard
2. **Core Web Vitals**: Monitor performance metrics
3. **Real User Monitoring**: Track user experience

### Custom Events

The following events are tracked for conversion optimization:

- `demo_request_started`
- `demo_request_completed`
- `calculator_completed`
- `newsletter_signup`
- `calendar_booking_clicked`
- `pricing_inquiry_submitted`

## Troubleshooting

### Build Issues

```bash
# Clear build cache
rm -rf dist/ .astro/

# Reinstall dependencies
npm ci

# Build with verbose logging
npm run build -- --verbose
```

### Environment Variable Issues

```bash
# Test environment variables
wrangler pages secret list --project-name=aktivcro-website
```

### DNS Issues

```bash
# Check DNS propagation
dig aktivcro.com
nslookup aktivcro.com
```

## Migration Checklist

- [x] Updated astro.config.mjs for Cloudflare adapter
- [x] Migrated all API routes to Cloudflare Workers compatibility
- [x] Created wrangler.toml configuration
- [x] Updated calendar links to GoHighLevel
- [x] Resolved GitHub security incidents
- [x] Tested build process
- [ ] Deploy to Cloudflare Pages
- [ ] Configure environment variables
- [ ] Set up custom domain
- [ ] Test all API routes
- [ ] Verify GoHighLevel integration
- [ ] Monitor performance metrics

## Support

For deployment issues:
- **Cloudflare Docs**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Wrangler Docs**: [developers.cloudflare.com/workers/wrangler](https://developers.cloudflare.com/workers/wrangler)
- **Astro Cloudflare**: [docs.astro.build/en/guides/deploy/cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare)