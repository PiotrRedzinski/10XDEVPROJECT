# GenFish - AI-Powered Flashcard Generator - added permision to github token

GenFish is a modern web application that leverages AI to automatically generate high-quality flashcards from text inputs. Built with a robust and cutting-edge tech stack, it streamlines the creation of study materials for students, educators, and lifelong learners.

## Features

- **AI-Powered Flashcard Generation**: Transform large text passages into concise, effective flashcards
- **Flashcard Management**: Create, edit, review, and organize flashcards
- **User Authentication**: Secure user accounts with Supabase authentication
- **Responsive Design**: Modern UI built with Tailwind CSS and Shadcn/ui components

## Tech Stack

- **Frontend**: 
  - Astro 5 (with SSR capabilities)
  - React 19 (for interactive components)
  - TypeScript 5 (for type safety)
  - Tailwind CSS 4 (for styling)
  - Shadcn/ui (for UI components)

- **Backend**:
  - Astro API routes
  - Supabase (for database and authentication)

- **Testing**:
  - Vitest (unit testing)
  - Playwright (E2E testing)
  - React Testing Library (component testing)

## Project Structure

The codebase follows a clean, modular architecture:
- `/src/pages`: Astro pages and API endpoints
- `/src/components`: UI components (Astro and React)
- `/src/db`: Database clients and types
- `/src/lib`: Utility functions and services
- `/src/layouts`: Page layouts
- `/src/middleware`: API middleware
- `/src/types.ts`: Type definitions shared across the application

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
npm run test:e2e
```

## License

ISC

---

Created and maintained by Piotr Redzinski 
