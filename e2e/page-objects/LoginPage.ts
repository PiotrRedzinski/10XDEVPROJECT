import { type Page, type Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly form: Locator;

  constructor(page: Page) {
    this.page = page;
    this.form = page.locator("form");
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.getByRole("button", { name: "Sign in" });
  }

  async goto() {
    // Clear cache and cookies before navigating
    //await this.page.context().clearCookies();
    //await this.page.context().clearPermissions();

    // Navigate to login page
    await this.page.goto("/login");
    await this.expectToBeOnLoginPage();
  }

  async login(email: string, password: string) {
    // Wait for form elements to be ready
    await this.emailInput.waitFor({ state: "visible" });
    await this.passwordInput.waitFor({ state: "visible" });

    // Fill email with explicit wait
    await this.emailInput.clear();
    await this.emailInput.type(email, { delay: 50 });
    await expect(this.emailInput).toHaveValue(email);

    // Fill password with explicit wait
    await this.passwordInput.clear();
    await this.passwordInput.type(password, { delay: 50 });
    await expect(this.passwordInput).toHaveValue(password);

    // Additional verification before proceeding
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeEnabled();

    // Click submit and wait for navigation
    await Promise.all([this.page.waitForNavigation({ waitUntil: "domcontentloaded" }), this.submitButton.click()]);

    // Verify navigation
    const currentUrl = this.page.url();
    console.log(`Navigated to: ${currentUrl}`);
  }

  async expectToBeOnLoginPage() {
    await expect(this.page).toHaveURL("/login", { timeout: 5000 });
    await expect(this.emailInput).toBeVisible({ timeout: 5000 });
    await expect(this.passwordInput).toBeVisible({ timeout: 5000 });
    await expect(this.submitButton).toBeVisible({ timeout: 5000 });
  }
}
