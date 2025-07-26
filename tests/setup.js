/**
 * Jest setup file for unit tests
 */

// Mock DOM APIs that aren't available in Jest/JSDOM
global.HTMLElement = HTMLElement;
global.document = document;
global.window = window;

// Mock navigator.userAgent for mobile detection tests
Object.defineProperty(navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  configurable: true
});

// Mock Date.now for consistent testing
const mockDateNow = jest.fn(() => 1640995200000); // Fixed timestamp
global.Date.now = mockDateNow;

// Mock Math.random for consistent ID generation
const mockMathRandom = jest.fn(() => 0.5);
global.Math.random = mockMathRandom;

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  mockDateNow.mockReturnValue(1640995200000);
  mockMathRandom.mockReturnValue(0.5);
});