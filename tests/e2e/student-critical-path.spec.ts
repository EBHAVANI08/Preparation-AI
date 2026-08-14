import { test, expect } from '@playwright/test';
test('student can register and navigate through protected product routes', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Full name').fill('Browser Test Student');
  await page.getByLabel('Email').fill(`browser.${Date.now()}@example.test`);
  await page.getByLabel('Password').fill('BrowserTestPass123!');
  await page.getByRole('button', { name: /Create account/ }).click();
  await expect(page.getByRole('button', { name: /Mock Exam/ })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: /Mock Exam/ }).click();
  await expect(page).toHaveURL(/\/exams$/);
  await expect(page.getByText('AI Mock Exam Engine')).toBeVisible();
  await page.getByRole('button', { name: /Study Planner/ }).click();
  await expect(page).toHaveURL(/\/planner$/);
  await expect(page.getByText('Study Planner').first()).toBeVisible();
});
