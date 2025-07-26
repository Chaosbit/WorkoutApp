// Jest setup file for DOM testing
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