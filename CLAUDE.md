# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AktivCRO is a conversion rate optimization service website that transforms static websites into intelligent problem-solving platforms. The site showcases four foundation frameworks and custom micro-experiences while serving as a high-converting lead generation platform itself.

**Success Targets**: 5-10% conversion rate, <3s load times, 80%+ demo engagement, 95+ Lighthouse scores

## Technical Architecture

### Core Stack
- **Framework**: Astro with React component islands
- **Hosting**: Cloudflare Pages + Workers for edge computing
- **Database**: Cloudflare D1 (lead data) + R2 (assets, demos)
- **Payments**: Stripe direct integration with webhook sync
- **CRM**: GoHighLevel integration for lead management
- **Analytics**: Cloudflare Analytics + Microsoft Clarity

### Architecture Principles
- **Component Islands**: Interactive React components only where needed, zero JS by default
- **Edge-First**: API routes and data processing via Cloudflare Workers
- **Performance-Driven**: Static generation with dynamic capabilities, aggressive caching
- **Mobile-First PWA**: Offline functionality for key interactions

## Key Features & Components

### Priority Feature: Demo Homepage Generator
The main lead capture mechanism - an interactive tool where visitors input business details and see real-time preview of their optimized website.

**Implementation**: Multi-step React form in Astro island, dynamic component rendering, Cloudflare R2 for demo storage, unique shareable URLs with 30-day expiration.

### Interactive Elements
- **Framework Selector**: Visual comparison with morphing animations
- **Conversion Calculator**: Multi-step ROI calculator with PDF report generation  
- **Micro-Experience Gallery**: Live demos across different industries/frameworks
- **Client Success Map**: Interactive case study visualization

### Lead Capture System
Multiple touchpoints: Demo generator (primary), exit intent, calculator results, resource downloads, sticky CTAs, chat widget. All sync to GoHighLevel with lead scoring and automation triggers.

## Development Commands

```bash
# Project initialization (Astro)
npm create astro@latest . -- --template minimal --typescript
npm install

# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run preview         # Preview production build
npm run astro           # Astro CLI commands

# Code quality
npm run lint            # ESLint
npm run typecheck       # TypeScript checking
npm run format          # Prettier formatting

# Testing
npm run test            # Unit tests
npm run test:e2e        # End-to-end tests
npm run test:watch      # Watch mode

# Deployment
npm run deploy          # Deploy to Cloudflare Pages
```

## Project Structure

```
src/
├── components/          # Shared UI components
│   ├── ui/             # Basic UI elements (Button, Input, etc.)
│   ├── interactive/    # React islands for interactive features
│   └── demos/          # Demo component templates
├── layouts/            # Page layouts
├── pages/              # Astro pages (file-based routing)
│   ├── api/           # API routes (Cloudflare Workers)
│   └── demos/         # Demo preview pages
├── content/           # Content collections (blog, case studies)
├── styles/            # Global styles and design system
└── utils/             # Shared utilities and helpers

public/
├── assets/            # Static assets
└── demos/             # Demo screenshots and videos
```

## Design System

**Colors**: Primary Blue (#20466f), Accent Yellow (#ffd147), Success Green (#10b981)
**Typography**: Poppins (headings: 700/900, body: 400/500), JetBrains Mono (code)
**Spacing**: 8px base unit, 80px section padding (desktop), 40px (mobile)
**Container**: 1280px max-width

## Integration Requirements

### Stripe Integration
- Service tier pricing: Foundation ($5K), Growth ($5K + $2-5K/tool), Enterprise ($15K+ + $500-2K/mo)
- Support for one-time payments and subscriptions
- Webhook integration with GoHighLevel for order fulfillment

### GoHighLevel Integration
- Real-time lead sync via webhooks
- Tag management based on: source, interest level, industry, interaction depth
- Automation triggers for follow-up sequences
- Lead scoring integration

### Email Workflow Integration (GoHighLevel)
- Demo requests trigger automated email workflows in GoHighLevel CRM
- Comprehensive lead data and scoring sent via webhook to GHL
- Personalized email automation with dynamic content and branding
- Lead nurturing sequences and team notifications handled in GHL
- All email communications tracked within unified CRM system

### Cloudflare Services
- **Pages**: Static site hosting with edge deployment
- **Workers**: API routes, payment processing, lead capture
- **D1**: Lead data, form submissions, analytics
- **R2**: Demo storage, client examples, assets
- **Analytics**: Privacy-first metrics without external scripts

## Performance Requirements

### Core Web Vitals Targets
- **LCP**: <2.5s (target: <1.5s)
- **FID**: <100ms (target: <50ms)  
- **CLS**: <0.1 (target: <0.05)
- **Overall Lighthouse**: >95 for all categories

### Optimization Strategies
- Lazy loading for images, videos, heavy components
- Route-based code splitting
- Edge caching for static assets
- WebP images with fallbacks
- Font subsetting and preloading
- Critical CSS inlining

## Security & Compliance

### Security Implementation
- Environment variables for API keys (edge runtime)
- Strict CORS policies
- DDoS protection via Cloudflare
- Server-side input validation and sanitization
- HTTPS enforcement

### Compliance Requirements
- **GDPR**: Cookie consent, data portability
- **CCPA**: Privacy policy, opt-out mechanisms  
- **PCI**: Handled by Stripe
- **Accessibility**: WCAG 2.1 AA compliance

## Development Phases

### Phase 1: Foundation (Weeks 1-2)
- Astro project setup with Cloudflare integration
- Design system and component library
- Page structure and navigation

### Phase 2: Core Pages (Weeks 3-4)  
- Homepage with animations and interactive elements
- Demo gallery and about pages
- Responsive implementation

### Phase 3: Interactive Features (Weeks 5-6)
- **Demo Homepage Generator** (priority)
- Conversion calculator with lead capture
- Micro-experience examples

### Phase 4: Integration (Weeks 7-8)
- Stripe payment flows for all service tiers
- GoHighLevel webhook integration
- Email automation and lead scoring

### Phase 5: Launch Prep (Weeks 9-10)
- Content population and SEO optimization
- Performance audit and security review
- Deployment pipeline and monitoring

## Testing Strategy

### Unit Testing
- Component testing with React Testing Library
- Utility function testing with Vitest
- API route testing with mock integrations

### Integration Testing
- Stripe payment flow testing (test mode)
- GoHighLevel webhook testing
- Lead capture and scoring validation

### End-to-End Testing
- Critical user journeys (demo generation, calculator)
- Cross-browser compatibility testing
- Mobile responsiveness validation
- Performance regression testing

## Monitoring & Analytics

### Key Metrics
- **Business**: Visitor→Lead (>5%), Lead→Customer (>10%), Demo completion (>60%)
- **Technical**: Uptime (99.9%), Response time (<200ms), Error rate (<0.1%)
- **Performance**: CDN hit rate (>90%), Core Web Vitals compliance

### Tools
- Cloudflare Analytics for privacy-first metrics
- Custom event tracking for interactions
- Microsoft Clarity for user behavior
- Uptime monitoring and performance alerts