# GenFish

###change for PR verification - try 3

## Project Description

GenFish is a web-based educational flashcards platform designed to streamline the creation and management of flashcards. The application supports both AI-generated flashcards and manual input, ensuring efficient use of the spaced repetition method through integration with an external repetition algorithm. Users can create an account, log in with a username and password, and manage their flashcards with ease. Key features include flashcard validation (front: max 220 characters, back: max 500 characters), metrics logging, text segmentation for thematic consistency, and a minimalist interface for editing flashcards.

## Tech Stack

- **Frontend:** Astro, React, TypeScript, Tailwind, Shadcn/ui
- **Backend:** Supabase (PostgreSQL, authentication, and SDK support)
- **AI Integration:** Openrouter.ai
- **Testing:** 
  - **Unit Testing:** Jest/Vitest for component and service testing
  - **End-to-End Testing:** Playwright for automated browser testing
- **Other Tools:** ESLint, Prettier, and various development dependencies as specified in the project configuration

## Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PiotrRedzinski/10XDEVPROJECT
   cd 10XDEVPROJECT
   ```
2. **Ensure the correct Node.js version is in use:**
   The project requires Node.js version as specified in the `.nvmrc` file (22.14.0).
   ```bash
   nvm use
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Available Scripts

The following scripts are available in the project:

- `npm run dev` - Starts the Astro development server.
- `npm run build` - Builds the project for production.
- `npm run preview` - Previews the production build locally.
- `npm run astro` - Executes Astro CLI commands.
- `npm run lint` - Runs ESLint to check for code quality issues.
- `npm run lint:fix` - Automatically fixes linting issues.
- `npm run format` - Formats the code using Prettier.
- `npm run test` - Runs unit tests with Jest/Vitest.
- `npm run test:e2e` - Runs end-to-end tests with Playwright.

## Testing

The project includes comprehensive testing strategies:

- **Unit Tests:** Using Jest/Vitest to test React components, services, and utilities in isolation.
- **End-to-End Tests:** Using Playwright to automate browser testing for critical user flows such as authentication, flashcard management, and AI generation.
- **API Tests:** Manual and automated API testing for backend endpoints.

## Project Scope

- **Flashcard Generation:** Supports automatic generation of flashcards from pasted educational text using AI, as well as manual creation.
- **User Interaction:** Allows users to view, edit, accept, or reject flashcards with a minimalist and dedicated interface.
- **Validation & Metrics:** Enforces character limits (front: 220, back: 500) and displays appropriate messages. Logs key generation metrics such as generation time, counts of flashcards, and user actions (approved/rejected).
- **Text Segmentation:** Includes an algorithm to process educational text (between 1000 and 10000 characters) into thematically consistent segments.
- **Integration:** Works alongside a spaced repetition algorithm to enhance learning efficiency.

## Project Status

This project is currently in the MVP (Minimum Viable Product) stage. Ongoing development will continue to add features and improvements based on user feedback and further testing.

## License

This project is licensed under the MIT License. See the LICENSE file for more details. 
