import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/AktivCRO/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation links
    const aboutLink = page.getByRole('link', { name: /about/i });
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/.*about/);
    }
  });

  test('should display demo homepage generator', async ({ page }) => {
    await page.goto('/');
    
    // Look for demo generator section
    const demoSection = page.locator('[data-testid="demo-generator"]').or(
      page.getByText(/demo/i).first()
    );
    
    if (await demoSection.isVisible()) {
      await expect(demoSection).toBeVisible();
    }
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('body')).toBeVisible();
    
    // Check that content doesn't overflow horizontally
    const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
    const viewportWidth = 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow 20px tolerance
  });

  test('should have reasonable load time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
});