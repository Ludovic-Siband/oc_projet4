import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

const globalScope = globalThis as typeof globalThis & {
  __jestZoneTestEnvInitialized__?: boolean;
};

if (!globalScope.__jestZoneTestEnvInitialized__) {
  globalScope.__jestZoneTestEnvInitialized__ = true;
  try {
    setupZoneTestEnv();
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot set base providers')) {
      // TestBed environment already initialized (ex: ng test via @angular-builders/jest)
    } else {
      throw error;
    }
  }
}

function definePropertyIfPossible<T extends object>(
  target: T,
  key: PropertyKey,
  descriptor: PropertyDescriptor
): void {
  const existing = Object.getOwnPropertyDescriptor(target, key);
  if (existing && existing.configurable === false) return;
  if (existing) return;
  try {
    Object.defineProperty(target, key, descriptor);
  } catch {
    // Ignore re-definition errors when the test runner loads this file multiple times.
  }
}

/* global mocks for jsdom */
const mock = () => {
  let storage: { [key: string]: string } = {};
  return {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => (storage[key] = value || ''),
    removeItem: (key: string) => delete storage[key],
    clear: () => (storage = {}),
  };
};

definePropertyIfPossible(window, 'localStorage', { value: mock() });
definePropertyIfPossible(window, 'sessionStorage', { value: mock() });
definePropertyIfPossible(window, 'getComputedStyle', {
  value: () => ['-webkit-appearance'],
});

definePropertyIfPossible(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});

/* output shorter and more meaningful Zone error stack traces */
// Error.stackTraceLimit = 2;
