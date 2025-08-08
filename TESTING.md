# Testing Guide

This document outlines the testing setup and commands for the AktivCRO website.

## Testing Stack

- **Unit Testing**: Vitest with React Testing Library
- **E2E Testing**: Playwright
- **Code Quality**: ESLint + Prettier

## Quick Start

```bash
# Install dependencies (if not already installed)
npm install

# Run all tests
npm run test:all

# Run unit tests only
npm run test

# Run E2E tests only (requires dev server running)
npm run test:e2e

# Watch mode for unit tests
npm run test:watch
```

## Test Structure

```
src/test/                   # Unit tests
├── components/            # Component tests
├── utils/                # Utility function tests
└── setup.ts              # Test setup and mocks

tests/                     # E2E tests
├── homepage.spec.ts       # Homepage functionality
└── conversion-calculator.spec.ts  # Calculator flow
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run test` | Run unit tests once |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:ui` | Open Vitest UI |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with UI |
| `npm run test:all` | Run both unit and E2E tests |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |
| `npm run format` | Format code with Prettier |

## Writing Tests

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MyComponent from '../components/MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test('should navigate to page', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
})
```

## Running Tests in CI

For GitHub Actions or other CI environments:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run tests
  run: npm run test:all
```

## Test Coverage

Currently testing:
- ✅ Conversion Calculator component functionality
- ✅ Homepage loading and navigation
- ✅ Form validation and user interactions
- ✅ Demo utility functions

## Contributing

When adding new features:
1. Write unit tests for components and utilities
2. Add E2E tests for critical user flows
3. Ensure all tests pass before submitting PRs
4. Run `npm run lint` and `npm run typecheck` to check code quality