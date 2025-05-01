import { cleanup, render } from "@testing-library/react";
import { afterEach } from "vitest";
import type { RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

// Automatically unmount and cleanup DOM after the test is finished
afterEach(() => {
  cleanup();
});

// Custom render that includes any global providers, etc.
function customRender(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, {
    // Wrap the component with any providers here
    // Example: <ThemeProvider><YourComponent /></ThemeProvider>
    // wrapper: ({ children }) => <ThemeProvider>{children}</ThemeProvider>,
    ...options,
  });
}

// Re-export everything from testing-library
export * from "@testing-library/react";

// Override render method with our custom version
export { customRender as render };
