/**
 * Vitest global test setup
 *
 * Runs once before every test file. Configures:
 * - jest-dom matchers (toBeInTheDocument, toBeDisabled, etc.)
 * - localStorage mock (cleared between tests)
 * - console.error suppression for known React prop warnings
 */

import "@testing-library/jest-dom";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Cleanup after each test to unmount components and clear DOM
// ---------------------------------------------------------------------------

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// localStorage mock
// Reset between tests so state doesn't bleed across test cases
// ---------------------------------------------------------------------------

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Suppress known/expected console errors during tests
// (e.g. React missing key warnings from intentional test fixtures)
// ---------------------------------------------------------------------------

const SUPPRESSED_ERRORS = [
  "Warning: ReactDOM.render is no longer supported",
  "Warning: Each child in a list should have a unique",
];

const originalError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  const message = String(args[0]);
  if (SUPPRESSED_ERRORS.some((pattern) => message.includes(pattern))) return;
  originalError(...args);
};
