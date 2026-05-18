// extends vitest's matchers with testing-library's matchers and makes ts aware
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});
