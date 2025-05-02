import { test, expect } from "@playwright/test";

test.describe("navigation flow", () => {
  test("should show home page and navigate to login", async ({ page }) => {
    // Check home page
    await page.goto("/");
    await expect(page).toHaveTitle(/10x Astro Starter/);
    await expect(page.getByRole("heading", { name: "Witaj w 10xDevs Astro Starter!" })).toBeVisible();

    // Navigate to login page
    await page.goto("/login");
    await expect(page).toHaveTitle(/Authentication - 10xDev/);

    // Verify login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });
});
