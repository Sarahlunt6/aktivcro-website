# AktivCRO Website - Troubleshooting Guide

## 📋 Overview

This document catalogs all issues encountered during the development of the AktivCRO website interactive demos and infrastructure. It serves as a personal reference for future development, maintenance, and similar projects.

### Quick Reference Index

- [Development Server Issues](#development-server-issues)
- [React/JSX Syntax Errors](#reactjsx-syntax-errors)
- [Component Integration Problems](#component-integration-problems)
- [Navigation & Linking Issues](#navigation--linking-issues)
- [Interactive Component Development](#interactive-component-development)
- [Build Configuration Issues](#build-configuration-issues)
- [Git Workflow & Commit Management](#git-workflow--commit-management)
- [Deployment Process Issues](#deployment-process-issues)
- [Process & Workflow Improvements](#process--workflow-improvements)
- [Prevention Strategies](#prevention-strategies)
- [Quick Reference Commands](#quick-reference-commands)

---

## 🖥️ Development Server Issues

### Problem
Multiple occurrences of development server connection failures with error:
```
This site can't be reached
localhost refused to connect.
ERR_CONNECTION_REFUSED
```

### Root Cause
- Development server stopping unexpectedly during active development
- Likely caused by file changes triggering server restarts
- No monitoring of server status during development

### What I Should Have Done
1. **Implemented server monitoring**: Set up automatic server health checks
2. **Used development tools**: Configured nodemon or similar for graceful restarts
3. **Created restart scripts**: Automated recovery procedures
4. **Background processes**: Used process managers like PM2 for development

### Solution Applied
```bash
# Manual server restart command used repeatedly
npm run dev
```

### Prevention Strategies
```bash
# Create a robust dev script in package.json
"scripts": {
  "dev": "astro dev --host --verbose",
  "dev:watch": "nodemon --exec 'npm run dev'",
  "dev:monitor": "concurrently 'npm run dev' 'npm run server:check'"
}

# Server health check script
"server:check": "while true; do curl -f http://localhost:4321 || npm run dev; sleep 30; done"
```

### Lessons Learned
- Always have server monitoring during active development
- Create automated restart procedures
- Use verbose logging to identify restart triggers

---

## ⚛️ React/JSX Syntax Errors

### Problem
Build failures due to JSX parsing errors with special characters:
```
ERROR: Expected identifier but found "0"
/src/components/interactive/MobilePWADemoInteractive.tsx:304:53
```

### Root Cause
```tsx
// Problematic code
<option value="small">Small (< 0.25 acre)</option>
<option value="large">Large (> 0.5 acre)</option>
```
JSX parser interpreting `<` and `>` as HTML tag delimiters instead of text content.

### What I Should Have Done
1. **Use HTML entities from the start**:
   ```tsx
   <option value="small">Small (&lt; 0.25 acre)</option>
   ```
2. **JSX syntax validation**: Use ESLint rules for JSX syntax
3. **Component testing**: Test components with special characters
4. **Template literals**: Use string interpolation for complex text

### Solution Applied
```tsx
// Final working solution
<option value="small">Small (under 0.25 acre)</option>
<option value="medium">Medium (0.25-0.5 acre)</option>
<option value="large">Large (over 0.5 acre)</option>
```

### Prevention Strategies
```tsx
// Best practices for special characters in JSX
const sizeOptions = [
  { value: 'small', label: 'Small (under 0.25 acre)' },
  { value: 'medium', label: 'Medium (0.25-0.5 acre)' },
  { value: 'large', label: 'Large (over 0.5 acre)' }
];

// Or use HTML entities
<option value="small">Small ({`<`} 0.25 acre)</option>
```

### ESLint Rules to Add
```json
{
  "rules": {
    "react/jsx-no-literals": "warn",
    "react/jsx-curly-brace-presence": ["error", { "props": "never", "children": "never" }]
  }
}
```

---

## 🧩 Component Integration Problems

### Problem
CRE Framework demo page showing white text on white background, making content unreadable.

### Root Cause
```astro
<!-- Problematic code -->
<Section background="success" padding="lg">
```
The `Section` component didn't support "success" as a background variant - only supported: `'transparent' | 'white' | 'gray' | 'primary' | 'accent'`

### What I Should Have Done
1. **Component API audit**: Review existing component APIs before using them
2. **TypeScript interfaces**: Check TypeScript definitions for supported props
3. **Component documentation**: Maintain up-to-date component documentation
4. **Design system consistency**: Define all color variants upfront

### Solution Applied
```astro
<!-- Updated Section component interface -->
export interface Props {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'transparent' | 'white' | 'gray' | 'primary' | 'accent' | 'success';
  class?: string;
}

<!-- Added success background to backgrounds object -->
const backgrounds = {
  transparent: '',
  white: 'bg-white',
  gray: 'bg-gray-50',
  primary: 'bg-primary text-white',
  accent: 'bg-accent text-gray-900',
  success: 'bg-success text-white'  // Added this line
};
```

### Prevention Strategies
1. **Create component documentation**:
   ```markdown
   # Section Component
   ## Props
   - background: 'transparent' | 'white' | 'gray' | 'primary' | 'accent' | 'success'
   - padding: 'none' | 'sm' | 'md' | 'lg'
   ```

2. **Use Storybook or similar for component testing**
3. **Type-safe props with strict TypeScript**
4. **Design system tokens in CSS custom properties**

---

## 🔗 Navigation & Linking Issues

### Problem
"Get Free Demo" button in header linking to `/#demo` instead of the actual demos page at `/demos`.

### Root Cause
```astro
<!-- Problematic code -->
<Button variant="primary" size="sm" href="/#demo">
  Get Free Demo
</Button>
```
Hard-coded anchor link to a demo section that didn't exist, instead of proper page routing.

### What I Should Have Done
1. **Route planning**: Map out all navigation paths before implementation
2. **Link validation**: Test all navigation links during development
3. **Consistent routing**: Use proper Astro routing conventions
4. **User journey mapping**: Plan the complete user flow

### Solution Applied
```astro
<!-- Fixed code -->
<Button variant="primary" size="sm" href="/demos">
  Get Free Demo
</Button>
```
Updated both desktop and mobile navigation instances.

### Prevention Strategies
1. **Create a navigation map**:
   ```typescript
   const routes = {
     home: '/',
     demos: '/demos',
     calculator: '/calculator',
     about: '/about',
     contact: '/contact'
   };
   ```

2. **Link validation script**:
   ```bash
   # Add to package.json scripts
   "test:links": "find src -name '*.astro' -exec grep -l 'href=' {} + | xargs grep 'href='"
   ```

3. **Automated link checking in CI/CD**

---

## 🎮 Interactive Component Development

### Problem
Framework demo pages were static and not engaging users effectively.

### Root Cause
- Initial development focused on visual design rather than user interaction
- No planning for interactive elements during the design phase
- Static demos don't demonstrate the value of the frameworks effectively

### What I Should Have Done
1. **UX planning phase**: Design interactive elements from the start
2. **User story mapping**: Define what users should be able to do
3. **Progressive enhancement**: Build interactive layer on top of static content
4. **User testing**: Test interactivity with real users

### Solution Applied
Created comprehensive interactive React components:

```tsx
// Example: CREDemoInteractive.tsx with full interactivity
const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
const [propertyValue, setPropertyValue] = useState<string>('$650,000');
const [showValuation, setShowValuation] = useState(false);

// Interactive features implemented:
// - Clickable hotspots with animations
// - Real property valuation calculator
// - Working form fields with validation
// - Dynamic content updates
// - Modal interactions
```

### Interactive Features Added
1. **Authority Framework**: Consultation booking, testimonials, case studies
2. **CRE Framework**: Property valuation, search tools, market analysis
3. **Mobile PWA**: Quote calculator, GPS booking, notifications simulation
4. **Conversion-Centered**: A/B testing, analytics dashboard, smart forms

### Prevention Strategies
1. **Interactive requirements checklist**:
   - [ ] User can input data
   - [ ] System provides immediate feedback
   - [ ] User can see results/changes
   - [ ] Interactions feel responsive
   - [ ] Error states are handled

2. **Component interaction testing**:
   ```typescript
   // Test all interactive states
   const interactionTests = [
     'default state',
     'loading state', 
     'error state',
     'success state',
     'empty state'
   ];
   ```

---

## 🔧 Build Configuration Issues

### Problem
Node.js version compatibility warning during build:
```
[@astrojs/vercel] 
The local Node.js version (24) is not supported by Vercel Serverless Functions.
Your project will use Node.js 22 as the runtime instead.
```

### Root Cause
- Local development environment using Node.js v24
- Vercel Serverless Functions support up to Node.js v22
- No environment compatibility check during project setup

### What I Should Have Done
1. **Environment standardization**: Use .nvmrc file to specify Node version
2. **Docker for development**: Containerize development environment
3. **CI/CD compatibility checks**: Test builds with production Node version
4. **Documentation**: Document required Node version in README

### Solution Applied
```bash
# Warning acknowledged - Vercel automatically uses Node.js 22
# Build completed successfully despite version mismatch
```

### Prevention Strategies
1. **Add .nvmrc file**:
   ```
   # .nvmrc
   22
   ```

2. **Update package.json**:
   ```json
   {
     "engines": {
       "node": ">=22.0.0 <23.0.0"
     }
   }
   ```

3. **Development setup script**:
   ```bash
   #!/bin/bash
   # setup.sh
   echo "Checking Node.js version..."
   node --version
   nvm use
   npm ci
   ```

---

## 📝 Git Workflow & Commit Management

### Problem
Important security, SEO, and configuration files not committed to repository, leaving the project incomplete.

### Root Cause
- Focused on interactive features without systematic file review
- No checklist for what files should be version controlled
- Built artifacts (.vercel/output) mixed with source code in git status
- Incomplete understanding of what constitutes "source code" vs "build artifacts"

### What I Should Have Done
1. **File categorization**: Clearly separate source files from build artifacts
2. **Commit checklists**: Systematic review of what needs to be committed
3. **Staged reviews**: Review staged files before each commit
4. **Feature branch workflow**: Separate commits for different types of changes

### Solution Applied
Systematic addition of files in logical groups:
```bash
# Security and infrastructure
git add src/utils/cors.ts src/utils/rate-limiter.ts src/utils/validation-schemas.ts

# SEO components
git add src/components/seo/ src/pages/robots.txt.ts src/pages/sitemap.xml.ts

# Accessibility and compliance
git add src/components/accessibility/ src/styles/accessibility.css

# GDPR compliance
git add src/components/gdpr/ src/utils/gdpr-manager.ts
```

### Prevention Strategies
1. **Pre-commit checklist**:
   ```markdown
   ## Before Committing
   - [ ] All source files added
   - [ ] No build artifacts included
   - [ ] Sensitive data excluded
   - [ ] Tests passing
   - [ ] Documentation updated
   ```

2. **Improved .gitignore**:
   ```gitignore
   # Build artifacts
   .vercel/output/
   dist/
   
   # Dependencies
   node_modules/
   
   # Environment
   .env*
   
   # IDE
   .vscode/
   .idea/
   ```

3. **Git hooks for validation**:
   ```bash
   # pre-commit hook
   #!/bin/sh
   npm run lint
   npm run typecheck
   npm run test:unit
   ```

---

## 🚀 Deployment Process Issues

### Problem
Uncertainty about deployment status and how to push changes to Vercel production.

### Root Cause
- No deployment monitoring setup
- Unclear understanding of Vercel auto-deployment process
- No deployment verification procedures
- Missing deployment documentation

### What I Should Have Done
1. **Deployment documentation**: Document the entire deployment process
2. **Monitoring setup**: Configure deployment status monitoring
3. **Staging environment**: Set up preview deployments for testing
4. **Rollback procedures**: Plan for deployment failures

### Solution Applied
```bash
# Verified Vercel configuration
# Confirmed auto-deployment from GitHub main branch
# Tested build process locally
npm run build  # ✓ Successful build in 2.81s
```

### Prevention Strategies
1. **Deployment checklist**:
   ```markdown
   ## Deployment Checklist
   - [ ] Build passes locally
   - [ ] All tests passing
   - [ ] Environment variables set
   - [ ] Database migrations (if any)
   - [ ] DNS configured
   - [ ] SSL certificates valid
   ```

2. **Monitoring setup**:
   ```javascript
   // Add deployment webhook
   const deploymentHook = {
     url: 'https://hooks.slack.com/services/...',
     events: ['deployment.succeeded', 'deployment.failed']
   };
   ```

3. **Health check endpoints**:
   ```typescript
   // src/pages/api/health.ts
   export async function GET() {
     return new Response(JSON.stringify({ 
       status: 'ok', 
       timestamp: new Date().toISOString() 
     }));
   }
   ```

---

## 🔄 Process & Workflow Improvements

### Issues Identified

#### 1. **Inadequate Planning**
- **Problem**: Started coding without comprehensive planning
- **Impact**: Reactive fixes instead of proactive design
- **Solution**: Use planning tools and documentation-first approach

#### 2. **Insufficient Testing Strategy**
- **Problem**: No incremental testing during development
- **Impact**: Issues discovered late in the process
- **Solution**: Test-driven development and continuous integration

#### 3. **Poor Error Handling**
- **Problem**: No error boundaries or graceful degradation
- **Impact**: Poor user experience when things go wrong
- **Solution**: Comprehensive error handling strategy

#### 4. **Incomplete Documentation**
- **Problem**: No inline documentation or component guides
- **Impact**: Difficult to maintain and extend code
- **Solution**: Documentation-driven development

### Improved Workflow
1. **Planning Phase**:
   ```markdown
   - [ ] Requirements analysis
   - [ ] Technical architecture
   - [ ] Component design
   - [ ] User experience flow
   - [ ] Testing strategy
   - [ ] Deployment plan
   ```

2. **Development Phase**:
   ```markdown
   - [ ] Component development
   - [ ] Unit testing
   - [ ] Integration testing
   - [ ] Code review
   - [ ] Documentation
   ```

3. **Testing Phase**:
   ```markdown
   - [ ] Manual testing
   - [ ] Automated testing
   - [ ] Performance testing
   - [ ] Accessibility testing
   - [ ] Cross-browser testing
   ```

4. **Deployment Phase**:
   ```markdown
   - [ ] Build verification
   - [ ] Environment setup
   - [ ] Database migration
   - [ ] Deployment
   - [ ] Smoke testing
   - [ ] Monitoring
   ```

---

## 🛡️ Prevention Strategies

### 1. Development Environment Setup
```bash
# Create environment setup script
#!/bin/bash
echo "Setting up AktivCRO development environment..."

# Check Node version
node --version | grep "v22" || echo "Warning: Use Node.js v22"

# Install dependencies
npm ci

# Setup git hooks
npm run prepare

# Start development server with monitoring
npm run dev:monitor
```

### 2. Pre-Development Checklist
```markdown
## Before Starting Development
- [ ] Requirements clearly defined
- [ ] Architecture documented
- [ ] Component APIs planned
- [ ] Testing strategy outlined
- [ ] Error handling planned
- [ ] Performance requirements set
- [ ] Accessibility requirements defined
- [ ] SEO requirements documented
```

### 3. Component Development Standards
```typescript
// Component template with error handling
interface ComponentProps {
  // Define all props with TypeScript
}

const Component: React.FC<ComponentProps> = (props) => {
  // Error boundary
  const [error, setError] = useState<string | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  
  // Error handling
  if (error) {
    return <ErrorMessage message={error} />;
  }
  
  // Loading states
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Main component logic
  return (
    // JSX with proper error handling
  );
};
```

### 4. Testing Strategy
```javascript
// Component testing template
describe('ComponentName', () => {
  it('renders without errors', () => {
    // Basic render test
  });
  
  it('handles user interactions', () => {
    // Interaction tests
  });
  
  it('displays error states correctly', () => {
    // Error handling tests
  });
  
  it('is accessible', () => {
    // Accessibility tests
  });
});
```

### 5. Git Workflow Best Practices
```bash
# Feature branch workflow
git checkout -b feature/interactive-demos
git add src/components/interactive/
git commit -m "Add interactive demo components"
git push origin feature/interactive-demos
# Create pull request for review
```

---

## 📚 Quick Reference Commands

### Development Server
```bash
# Start development server
npm run dev

# Start with monitoring
npm run dev:monitor

# Check server health
curl http://localhost:4321

# Restart server
pkill node && npm run dev
```

### Build & Deploy
```bash
# Local build test
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint

# Deploy to Vercel
npx vercel --prod
```

### Troubleshooting
```bash
# Check git status (excluding build artifacts)
git status --porcelain | grep -v ".vercel/output"

# Find JSX syntax issues
grep -r "<.*>" src/components/ --include="*.tsx"

# Check for missing imports
npm run typecheck

# Test all links
grep -r "href=" src/ --include="*.astro"
```

### Component Testing
```bash
# Run component tests
npm run test

# Run accessibility tests
npm run test:a11y

# Run visual regression tests
npm run test:visual
```

---

## 📞 Resources & References

### Documentation
- [Astro Documentation](https://docs.astro.build/)
- [React Documentation](https://react.dev/)
- [Vercel Documentation](https://vercel.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tools
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [axe DevTools](https://www.deque.com/axe/devtools/)

### Project-Specific Files
- `CLAUDE.md` - Project requirements and architecture
- `README.md` - Setup and development instructions
- `PERFORMANCE.md` - Performance optimization guide
- `TESTING.md` - Testing procedures and standards

---

*This document should be updated whenever new issues are encountered or solutions are implemented. It serves as a living reference for AktivCRO website development.*