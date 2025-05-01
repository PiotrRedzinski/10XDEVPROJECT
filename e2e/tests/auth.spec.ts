import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should authenticate with Supabase", async ({ page }) => {
    // Go to login page
    await page.goto("/login");

    // Fill form
    await page.locator('input[type="email"]').fill(process.env.TEST_USER_EMAIL || "test@example.com");
    await page.locator('input[type="password"]').fill(process.env.TEST_USER_PASSWORD || "test1111");

    // Get sign in button
    const signInButton = page.getByRole("button", { name: "Sign in" });

    // Verify button is visible and enabled
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toBeEnabled();

    // Click and wait for auth response
    const [response] = await Promise.all([
      page.waitForResponse(
        (response) => {
          return response.url().includes("/auth") && response.status() === 200;
        },
        { timeout: 5000 }
      ),
      signInButton.click(),
    ]);

    // Log response details
    console.log("Auth response:", {
      status: response.status(),
      url: response.url(),
    });

    // Verify auth response
    expect(response.status()).toBe(200);

    // Verify successful navigation after login
    await expect(page).not.toHaveURL("/login");
  });
});
