import { test, expect } from '@playwright/test';

/**
 * Auth spec — runs WITHOUT storageState (unauthenticated).
 * Tests redirect behaviour and login form presence.
 */
test.describe('Admin auth', () => {
  test('unauthenticated request to /admin/blog redirects to /admin/login', async ({ page }) => {
    await page.goto('/admin/blog');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('redirect preserves the original path in redirectedFrom param', async ({ page }) => {
    await page.goto('/admin/blog');
    await expect(page).toHaveURL(/redirectedFrom=%2Fadmin%2Fblog/);
  });

  test('login page renders the form correctly', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('login page shows validation errors for empty submission', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Zod + react-hook-form renders inline validation messages
    await expect(page.getByText(/invalid email|required/i).first()).toBeVisible();
  });

  test('login page shows error for invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel('Email address').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Supabase returns an error, displayed as serverError
    await expect(page.getByText(/invalid|credentials|error/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
