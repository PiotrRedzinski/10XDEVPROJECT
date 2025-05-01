import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

export class FlashcardsGeneratorPage {
  readonly page: Page;
  private readonly MIN_LENGTH = 1000;
  private readonly MAX_LENGTH = 10000;

  // Main form elements
  readonly textInput: Locator;
  readonly generateButton: Locator;

  // Flashcards grid
  readonly flashcardsGrid: Locator;
  readonly acceptAllButton: Locator;
  readonly rejectAllButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators
    this.textInput = page.getByTestId("flashcard-text-input");
    this.generateButton = page.getByTestId("generate-flashcards-button");
    this.flashcardsGrid = page.getByTestId("flashcards-grid");
    this.acceptAllButton = page.getByTestId("accept-all-flashcards-button");
    this.rejectAllButton = page.getByTestId("reject-all-flashcards-button");
  }

  // Navigation
  async goto() {
    await this.page.goto("/generate", { waitUntil: "domcontentloaded" });
  }

  // Actions
  async enterText(text: string) {
    // Wait for input to be ready
    await this.textInput.waitFor({ state: "visible" });

    // Clear existing text and type new text with delay
    await this.textInput.clear();
    await this.textInput.type(text, { delay: 10 });

    // Force blur to trigger any validation
    await this.textInput.evaluate((input) => input.blur());

    // Wait for text to be properly set and verify
    await expect(this.textInput).toHaveValue(text);

    // Wait for character count to update
    await this.page.waitForTimeout(1000);

    // Verify text length and button state
    await this.verifyTextLength();

    // Additional check for button state
    if (text.length >= this.MIN_LENGTH && text.length <= this.MAX_LENGTH) {
      await expect(this.generateButton).toBeEnabled({ timeout: 5000 });
    }
  }

  // Verifications
  async verifyTextLength() {
    // Get text from input
    const inputText = await this.textInput.inputValue();
    const textLength = inputText.length;
    console.log(`Input text length: ${textLength}`);

    // Check if length meets requirements
    const isValidLength = textLength >= this.MIN_LENGTH && textLength <= this.MAX_LENGTH;
    console.log(`Text meets length requirements: ${isValidLength}`);

    // Log current button state
    const isEnabled = await this.generateButton.isEnabled();
    console.log(`Generate button current state: ${isEnabled}`);

    // If length is valid, button should become enabled
    if (isValidLength) {
      await expect(this.generateButton).toBeEnabled({ timeout: 2000 });
      console.log("Button is enabled");
    } else {
      console.log("Button is disabled");
    }

    // Double check final button state
    const finalState = await this.generateButton.isEnabled();
    console.log(`Generate button final state: ${finalState}`);
  }

  async generateFlashcards() {
    // Log button state before clicking
    const isEnabled = await this.generateButton.isEnabled();
    console.log(`Generate button state before clicking: ${isEnabled}`);

    await this.generateButton.click({ force: true });
    await this.flashcardsGrid.waitFor({ state: "visible" });
  }

  async acceptAllFlashcards() {
    await this.acceptAllButton.click();
  }

  async rejectAllFlashcards() {
    await this.rejectAllButton.click();
  }

  // Individual flashcard actions
  async getFlashcard(id: string) {
    // Remove any 'front-' or other prefixes from the ID if they exist
    const cleanId = id.replace(/^(front-|back-)/, "");

    // Debug flashcard locator
    const flashcardId = `flashcard-${cleanId}`;
    console.log(`Looking for flashcard with test ID: ${flashcardId}`);

    // Get current flashcard IDs to verify the flashcard still exists
    const currentIds = await this.getAllFlashcardIds();
    if (!currentIds.includes(cleanId)) {
      throw new Error(`Flashcard ${cleanId} is no longer in the DOM. Available flashcards: ${currentIds.join(", ")}`);
    }

    // Wait for the specific flashcard to be available
    await this.page
      .waitForSelector(`[data-testid="${flashcardId}"]`, { timeout: 5000 })
      .catch(() => console.log(`Timeout waiting for flashcard ${flashcardId}`));

    return new FlashcardComponent(this.page, cleanId);
  }

  // Assertions
  async expectFlashcardsGenerated() {
    await expect(this.flashcardsGrid).toBeVisible();

    // Get all flashcards
    const flashcards = this.page.locator('[data-testid^="flashcard-"]');
    const count = await flashcards.count();
    console.log(`Found ${count} flashcards on the page`);

    // Analyze the first flashcard's structure in detail
    if (count > 0) {
      const firstCard = flashcards.first();
      console.log("\nAnalyzing flashcard structure:");

      // Get all elements with data-testid
      const elements = await firstCard.evaluate((card) => {
        const allElements = card.querySelectorAll("[data-testid]");
        return Array.from(allElements).map((el) => ({
          testId: el.getAttribute("data-testid"),
          className: el.className,
          tagName: el.tagName.toLowerCase(),
          text: el.textContent?.trim(),
        }));
      });

      console.log("Elements found:", elements);

      // Get all buttons
      const buttons = await firstCard.evaluate((card) => {
        const allButtons = card.querySelectorAll("button");
        return Array.from(allButtons).map((btn) => ({
          text: btn.textContent?.trim(),
          className: btn.className,
          ariaLabel: btn.getAttribute("aria-label"),
        }));
      });

      console.log("Buttons found:", buttons);

      // Get all icons/SVGs
      const icons = await firstCard.evaluate((card) => {
        const allIcons = card.querySelectorAll("svg");
        return Array.from(allIcons).map((icon) => ({
          className: icon.className.baseVal,
          ariaHidden: icon.getAttribute("aria-hidden"),
          parent: icon.parentElement?.tagName.toLowerCase(),
        }));
      });

      console.log("Icons found:", icons);
    }
  }

  // Get all flashcard IDs from the page
  async getAllFlashcardIds(): Promise<string[]> {
    // Wait for flashcards to be present
    await this.flashcardsGrid.waitFor({ state: "visible" });

    // Get all flashcard elements with UUID pattern, explicitly excluding text-input and front/back parts
    const flashcards = this.page.locator(
      '[data-testid^="flashcard-"]:not([data-testid="flashcard-text-input"]):not([data-testid*="front-"]):not([data-testid*="back-"])'
    );

    const count = await flashcards.count();
    const ids: string[] = [];

    // Extract and validate UUIDs
    for (let i = 0; i < count; i++) {
      const element = flashcards.nth(i);
      const testId = await element.getAttribute("data-testid");
      if (testId) {
        const uuid = testId.replace("flashcard-", "");
        // Only include if it looks like a UUID
        if (uuid.includes("-")) {
          ids.push(uuid);
        }
      }
    }

    console.log(`Found ${ids.length} valid flashcards with UUIDs: ${ids.join(", ")}`);
    return ids;
  }

  async expectNoFlashcards() {
    await expect(this.flashcardsGrid).not.toBeVisible();
    console.log("No flashcards generated loki");
  }
}

// Component class for individual flashcard interactions
export class FlashcardComponent {
  private readonly flashcardSelector: string;
  private readonly container: Locator;
  private readonly frontContent: Locator;
  private readonly backContent: Locator;
  private readonly acceptButton: Locator;
  private readonly editButton: Locator;
  private readonly rejectButton: Locator;

  constructor(
    private readonly page: Page,
    private readonly id: string
  ) {
    this.flashcardSelector = `[data-testid="flashcard-${id}"]`;
    console.log(`Initializing flashcard with selector: ${this.flashcardSelector}`);

    this.container = page.locator(this.flashcardSelector);
    this.frontContent = page.locator(`[data-testid="flashcard-front-${id}"]`);
    this.backContent = page.locator(`[data-testid="flashcard-back-${id}"]`);
    this.acceptButton = page.locator(`${this.flashcardSelector} button.text-green-600`);
    this.editButton = page.locator(`${this.flashcardSelector} button.text-blue-600`);
    this.rejectButton = page.locator(`${this.flashcardSelector} button.text-airbnb-rausch`);
  }

  async accept() {
    // Get current flashcard IDs to verify the flashcard still exists
    const allFlashcards = this.page.locator(
      '[data-testid^="flashcard-"]:not([data-testid="flashcard-text-input"]):not([data-testid*="front-"]):not([data-testid*="back-"])'
    );
    const count = await allFlashcards.count();
    console.log(`Current flashcard count: ${count}`);

    // Verify our flashcard exists before proceeding
    const exists = (await this.container.count()) > 0;
    if (!exists) {
      throw new Error(`Flashcard ${this.id} is no longer available for interaction`);
    }

    console.log(`Attempting to accept flashcard ${this.id}`);

    // Wait for accept button to be ready and visible
    await this.acceptButton.waitFor({ state: "visible", timeout: 5000 });
    const isVisible = await this.acceptButton.isVisible();
    console.log(`Accept button visible: ${isVisible}`);

    // Click the button
    await this.acceptButton.click({ force: true, timeout: 5000 });

    // Wait for the flashcard to be removed
    await this.container.waitFor({ state: "detached", timeout: 5000 });
  }

  async reject() {
    // Get current flashcard IDs to verify the flashcard still exists
    const allFlashcards = this.page.locator(
      '[data-testid^="flashcard-"]:not([data-testid="flashcard-text-input"]):not([data-testid*="front-"]):not([data-testid*="back-"])'
    );
    const count = await allFlashcards.count();
    console.log(`Current flashcard count: ${count}`);

    // Verify our flashcard exists before proceeding
    const exists = (await this.container.count()) > 0;
    if (!exists) {
      throw new Error(`Flashcard ${this.id} is no longer available for interaction`);
    }

    console.log(`Attempting to reject flashcard ${this.id}`);

    // Wait for reject button to be ready and visible
    await this.rejectButton.waitFor({ state: "visible", timeout: 5000 });
    const isVisible = await this.rejectButton.isVisible();
    console.log(`Reject button visible: ${isVisible}`);

    // Click the button
    await this.rejectButton.click({ force: true, timeout: 5000 });

    // Wait for the flashcard to be removed
    await this.container.waitFor({ state: "detached", timeout: 5000 });
  }

  async getFrontContent(): Promise<string> {
    return (await this.frontContent.textContent()) || "";
  }

  async getBackContent(): Promise<string> {
    return (await this.backContent.textContent()) || "";
  }

  async expectToBeVisible() {
    // Debug container visibility
    const isVisible = await this.container.isVisible();
    console.log(`Flashcard ${this.id} visible: ${isVisible}`);

    // Check if element exists in DOM
    const exists = (await this.container.count()) > 0;
    console.log(`Flashcard ${this.id} exists in DOM: ${exists}`);

    if (!exists) {
      // Try to find any flashcards to help with debugging
      const allFlashcards = this.page.locator('[data-testid^="flashcard-"]');
      const count = await allFlashcards.count();
      console.log(`Total flashcards found: ${count}`);

      if (count > 0) {
        // Log the test IDs of all found flashcards
        for (let i = 0; i < count; i++) {
          const testId = await allFlashcards.nth(i).getAttribute("data-testid");
          console.log(`Found flashcard with test ID: ${testId}`);
        }
      }
    }

    await expect(this.container).toBeVisible();
  }

  async expectContent(front: string, back: string) {
    await expect(this.frontContent).toHaveText(front);
    await expect(this.backContent).toHaveText(back);
  }
}
