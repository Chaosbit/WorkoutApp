/**
 * Jest setup file for unit tests
 */

// Mock DOM APIs that aren't available in Jest/JSDOM
global.HTMLElement = HTMLElement;
global.document = document;
global.window = window;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock IndexedDB
global.indexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
};

// Mock fetch
global.fetch = jest.fn();

// Mock Audio API
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn(),
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  load: jest.fn(),
  currentTime: 0,
  duration: 0,
  paused: true,
  volume: 1,
}));

// Mock Web APIs that might not be available in test environment
global.navigator.serviceWorker = {
  register: jest.fn(),
  ready: Promise.resolve(),
};

// Mock screen wake lock API
global.navigator.wakeLock = {
  request: jest.fn().mockResolvedValue({
    release: jest.fn(),
    released: false,
    type: 'screen'
  })
};

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

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
});