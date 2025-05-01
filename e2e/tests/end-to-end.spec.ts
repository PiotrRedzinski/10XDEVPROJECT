import { test, expect } from "@playwright/test";
import { FlashcardsGeneratorPage } from "../page-objects/FlashcardsGeneratorPage";
import { LoginPage } from "../page-objects/LoginPage";
import { C } from "vitest/dist/chunks/reporters.d.79o4mouw.js";

test.describe("End-to-end Flow", () => {
  let generatorPage: FlashcardsGeneratorPage;
  let loginPage: LoginPage;

  test("should a authenticate and generate flashcards", async ({ page }) => {
    // Set page zoom to 65%
    await page.evaluate(() => {
      document.body.style.zoom = "65%";
    });

    // Initialize page objects
    loginPage = new LoginPage(page);
    generatorPage = new FlashcardsGeneratorPage(page);

    // Step 1: Authentication
    await test.step("Authentication", async () => {
      // Navigate and verify login page
      await loginPage.goto();
      await loginPage.expectToBeOnLoginPage();

      // Login with test credentials
      await loginPage.login(
        process.env.TEST_USER_EMAIL || "test@example.com",
        process.env.TEST_USER_PASSWORD || "test1111"
      );
    });

    // Step 2: Flashcard Generation
    await test.step("Flashcard Generation", async () => {
      // Navigate to generate page
      await generatorPage.goto();
      await expect(page).toHaveTitle("Generate Flashcards");

      // Generate flashcards
      const sampleText =
        "Psy to jedne z 10 najwierniejszych i najbardziej oddanych zwierząt towarzyszących człowiekowi od tysięcy lat. Są nie tylko lojalnymi przyjaciółmi, ale również pełnią wiele ważnych funkcji w społeczeństwie. Wykorzystywane są jako psy przewodniki, terapeutyczne, policyjne, ratownicze czy pasterskie. Różnorodność ras sprawia, że każdy może znaleźć psa odpowiadającego jego stylowi życia – od energicznych border collie po spokojne buldogi francuskie. Psy mają znakomity węch i słuch, co czyni je niezwykle skutecznymi w wykrywaniu zagrożeń, poszukiwaniach osób czy nawet wykrywaniu chorób. Ich silne przywiązanie do człowieka sprawia, że są nie tylko strażnikami domu, ale też wsparciem emocjonalnym. Opieka nad psem wymaga jednak odpowiedzialności – regularnych spacerów, właściwego żywienia i troski o zdrowie. Prawidłowo wychowany pies potrafi stać się niezastąpionym członkiem rodziny. Ich radość, entuzjazm i bezwarunkowa miłość są bezcenne. Kundelek to mieszaniec o wyjątkowym charakterze, wierny, inteligentny i często bardzo zdrowy.";

      // Enter text and verify length requirements
      await generatorPage.enterText(sampleText);
      console.log(sampleText.slice(0, 100));
      await generatorPage.verifyTextLength();

      // Generate and verify flashcards
      await generatorPage.generateFlashcards();

      // Scroll down to see more content
      await page.evaluate(() => {
        window.scrollTo(0, 500); // Scroll down 500 pixels
      });

      await generatorPage.expectFlashcardsGenerated();
      console.log("Flashcards generated");

      // Get all flashcard IDs
      const flashcardIds = await generatorPage.getAllFlashcardIds();
      console.log("Found flashcard IDs:", flashcardIds);

      if (flashcardIds.length < 2) {
        throw new Error(`Expected at least 2 flashcards, but found ${flashcardIds.length}`);
      }

      // Handle first two flashcards using their actual UUIDs
      const firstCard = await generatorPage.getFlashcard(flashcardIds[0]);
      const secondCard = await generatorPage.getFlashcard(flashcardIds[1]);

      // Verify cards are visible
      await firstCard.expectToBeVisible();
      await secondCard.expectToBeVisible();

      // Accept cards
      await firstCard.accept();
      await secondCard.reject();

      // Verify cards were removed
      //await expect(async () => {
      //  await firstCard.expectToBeVisible();
      //}).rejects.toThrow();
      //await expect(async () => {
      //  await secondCard.expectToBeVisible();
      //}).rejects.toThrow();

      // Reject remaining cards
      //await generatorPage.rejectAllFlashcards();

      // Verify no cards remain
      //await generatorPage.expectNoFlashcards();
    });
  });
});
