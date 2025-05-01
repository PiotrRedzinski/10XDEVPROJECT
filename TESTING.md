# Testing Documentation

This project uses Vitest for unit testing React components and TypeScript logic, and Playwright for end-to-end testing.

## Unit Testing with Vitest

Unit tests are located alongside the components they test with a `.test.tsx` or `.test.ts` extension.

### Running Unit Tests

Run all unit tests:
```bash
npm test
```

Run tests in watch mode during development:
```bash
npm run test:watch
```

Open the UI to visually navigate test results:
```bash
npm run test:ui
```

Generate test coverage report:
```bash
npm run test:coverage
```

### Writing Unit Tests

- Place test files next to the code being tested: `Component.tsx` and `Component.test.tsx`
- Follow the Arrange-Act-Assert pattern
- Use the test utilities in `src/test/test-utils.tsx` for consistent component rendering
- Use mocks from Vitest for dependencies and external services

Example test:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## End-to-End Testing with Playwright

E2E tests are located in the `e2e` directory.

### Running E2E Tests

Run all E2E tests:
```bash
npm run test:e2e
```

Run E2E tests with UI:
```bash
npm run test:e2e:ui
```

### Writing E2E Tests

Tests are written using Playwright's test runner:
```ts
import { test, expect } from '@playwright/test';

test('should navigate to home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});
```

## Best Practices

### Mocking

Use Vitest's mocking capabilities for external dependencies:

```ts
// Top-level mock for a module
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ result: 'mocked data' })
}));

// Or use spies to monitor existing functions
const spy = vi.spyOn(console, 'log');
```

### Testing React Components

- Test user interactions using `fireEvent` or `userEvent`
- Verify component output using `getByText`, `getByRole`, etc.
- Use `screen` methods for more readable queries

### Testing Asynchronous Code

Use `await` with async test functions and assertions:

```ts
it('loads data asynchronously', async () => {
  render(<AsyncComponent />);
  await screen.findByText('Loaded Data'); // Waits for element to appear
});
```

### Coverage Thresholds

The project aims for at least 70% coverage in lines, statements, functions, and branches. 