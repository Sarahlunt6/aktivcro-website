import { test, expect } from '@playwright/test';

test.describe('Conversion Calculator', () => {
  test('should complete full calculator flow', async ({ page }) => {
    await page.goto('/calculator');
    
    // Step 1: Enter basic metrics
    await page.fill('[placeholder="e.g., 5000"]', '5000');
    await page.fill('[placeholder="e.g., 2.5"]', '2.5');
    await page.fill('[placeholder="e.g., 2500"]', '2500');
    
    // Should show performance summary
    await expect(page.getByText(/Current Performance Summary/)).toBeVisible();
    
    await page.click('button:has-text("Next")');
    
    // Step 2: Select industry and business type
    await expect(page.getByText('Your industry & business model')).toBeVisible();
    await page.click('text=Professional Services');
    await page.click('text=B2B Services');
    
    await page.click('button:has-text("Next")');
    
    // Step 3: Select primary goal
    await expect(page.getByText('Your goals & challenges')).toBeVisible();
    await page.click('text=Increase Lead Generation');
    
    await page.click('button:has-text("Next")');
    
    // Step 4: Enter contact information
    await expect(page.getByText('Get your detailed ROI report')).toBeVisible();
    await page.fill('[placeholder="your@email.com"]', 'test@example.com');
    await page.fill('[placeholder="Your Company"]', 'Test Company');
    
    // Submit calculation
    await page.click('button:has-text("Calculate ROI")');
    
    // Should show calculating state
    await expect(page.getByText(/Calculating Your Potential/)).toBeVisible();
    
    // Wait for results (with generous timeout)
    await expect(page.getByText(/Your Conversion Potential/)).toBeVisible({ timeout: 5000 });
    
    // Should show results with key metrics
    await expect(page.getByText(/Additional Monthly Leads/)).toBeVisible();
    await expect(page.getByText(/Additional Annual Revenue/)).toBeVisible();
    await expect(page.getByText(/Investment Payback/)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/calculator');
    
    // Next button should be disabled initially
    const nextButton = page.getByRole('button', { name: 'Next →' });
    await expect(nextButton).toBeDisabled();
    
    // Fill partial data
    await page.fill('[placeholder="e.g., 5000"]', '5000');
    await expect(nextButton).toBeDisabled();
    
    // Fill all required fields
    await page.fill('[placeholder="e.g., 2.5"]', '2.5');
    await page.fill('[placeholder="e.g., 2500"]', '2500');
    
    await expect(nextButton).toBeEnabled();
  });

  test('should allow navigation between steps', async ({ page }) => {
    await page.goto('/calculator');
    
    // Complete step 1
    await page.fill('[placeholder="e.g., 5000"]', '5000');
    await page.fill('[placeholder="e.g., 2.5"]', '2.5');
    await page.fill('[placeholder="e.g., 2500"]', '2500');
    await page.click('button:has-text("Next")');
    
    // Go back to step 1
    await page.click('button:has-text("← Back")');
    await expect(page.getByText('Your current performance')).toBeVisible();
    
    // Values should be preserved
    await expect(page.locator('[placeholder="e.g., 5000"]')).toHaveValue('5000');
  });

  test('should show industry-specific challenges', async ({ page }) => {
    await page.goto('/calculator');
    
    // Complete steps 1 and 2
    await page.fill('[placeholder="e.g., 5000"]', '5000');
    await page.fill('[placeholder="e.g., 2.5"]', '2.5');
    await page.fill('[placeholder="e.g., 2500"]', '2500');
    await page.click('button:has-text("Next")');
    
    await page.click('text=Professional Services');
    await page.click('text=B2B Services');
    await page.click('button:has-text("Next")');
    
    // Should show industry-specific challenges
    await expect(page.getByText(/Current Challenges/)).toBeVisible();
    await expect(page.getByText(/Long sales cycles/)).toBeVisible();
  });
});