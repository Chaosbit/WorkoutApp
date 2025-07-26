/**
 * Unit tests for StatisticsManager pure functions
 */

import { StatisticsManager } from '../js/statistics-manager.js';

describe('StatisticsManager', () => {
  let statsManager;
  let localStorageMock;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Mock console.warn to avoid noise in tests
    jest.spyOn(console, 'warn').mockImplementation();

    statsManager = new StatisticsManager();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getDefaultStats', () => {
    test('returns correct default statistics structure', () => {
      const defaultStats = statsManager.getDefaultStats();
      
      expect(defaultStats).toEqual({
        totalWorkouts: 0,
        completedWorkouts: 0,
        totalTimeSeconds: 0,
        totalExercises: 0,
        streakDays: 0,
        lastWorkoutDate: null,
        firstWorkoutDate: null
      });
    });

    test('each call returns a new object', () => {
      const stats1 = statsManager.getDefaultStats();
      const stats2 = statsManager.getDefaultStats();
      
      expect(stats1).not.toBe(stats2);
      expect(stats1).toEqual(stats2);
    });
  });

  describe('getFormattedTotalTime', () => {
    test('formats time correctly for hours and minutes', () => {
      statsManager.stats.totalTimeSeconds = 7800; // 2 hours and 10 minutes
      expect(statsManager.getFormattedTotalTime()).toBe('2h 10m');
      
      statsManager.stats.totalTimeSeconds = 3660; // 1 hour and 1 minute
      expect(statsManager.getFormattedTotalTime()).toBe('1h 1m');
      
      statsManager.stats.totalTimeSeconds = 7200; // exactly 2 hours
      expect(statsManager.getFormattedTotalTime()).toBe('2h 0m');
    });

    test('formats time correctly for minutes only', () => {
      statsManager.stats.totalTimeSeconds = 1800; // 30 minutes
      expect(statsManager.getFormattedTotalTime()).toBe('30m');
      
      statsManager.stats.totalTimeSeconds = 60; // 1 minute
      expect(statsManager.getFormattedTotalTime()).toBe('1m');
      
      statsManager.stats.totalTimeSeconds = 0; // 0 minutes
      expect(statsManager.getFormattedTotalTime()).toBe('0m');
    });

    test('handles edge cases', () => {
      statsManager.stats.totalTimeSeconds = 59; // less than 1 minute
      expect(statsManager.getFormattedTotalTime()).toBe('0m');
      
      statsManager.stats.totalTimeSeconds = 3599; // 59 minutes 59 seconds
      expect(statsManager.getFormattedTotalTime()).toBe('59m');
      
      statsManager.stats.totalTimeSeconds = 86399; // 23 hours 59 minutes 59 seconds
      expect(statsManager.getFormattedTotalTime()).toBe('23h 59m');
    });
  });

  describe('getSessionDuration', () => {
    test('returns "In progress" for sessions without end time', () => {
      const session = {
        startTime: '2023-01-01T10:00:00.000Z',
        endTime: null
      };
      
      expect(statsManager.getSessionDuration(session)).toBe('In progress');
    });

    test('calculates duration correctly for completed sessions', () => {
      const session = {
        startTime: '2023-01-01T10:00:00.000Z',
        endTime: '2023-01-01T10:30:00.000Z' // 30 minutes later
      };
      
      expect(statsManager.getSessionDuration(session)).toBe('30m');
    });

    test('rounds down fractional minutes', () => {
      const session = {
        startTime: '2023-01-01T10:00:00.000Z',
        endTime: '2023-01-01T10:05:30.000Z' // 5 minutes 30 seconds
      };
      
      expect(statsManager.getSessionDuration(session)).toBe('5m');
    });

    test('handles very short sessions', () => {
      const session = {
        startTime: '2023-01-01T10:00:00.000Z',
        endTime: '2023-01-01T10:00:30.000Z' // 30 seconds
      };
      
      expect(statsManager.getSessionDuration(session)).toBe('0m');
    });

    test('handles long sessions', () => {
      const session = {
        startTime: '2023-01-01T10:00:00.000Z',
        endTime: '2023-01-01T12:30:00.000Z' // 2.5 hours
      };
      
      expect(statsManager.getSessionDuration(session)).toBe('150m');
    });

    test('handles edge case with same start and end time', () => {
      const session = {
        startTime: '2023-01-01T10:00:00.000Z',
        endTime: '2023-01-01T10:00:00.000Z'
      };
      
      expect(statsManager.getSessionDuration(session)).toBe('0m');
    });
  });

  describe('loadStats error handling', () => {
    test('returns default stats when localStorage throws error', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const stats = statsManager.loadStats();
      expect(stats).toEqual(statsManager.getDefaultStats());
      expect(console.warn).toHaveBeenCalledWith('Error loading workout stats:', expect.any(Error));
    });

    test('returns default stats when stored data is invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const stats = statsManager.loadStats();
      expect(stats).toEqual(statsManager.getDefaultStats());
      expect(console.warn).toHaveBeenCalledWith('Error loading workout stats:', expect.any(Error));
    });

    test('returns parsed stats when localStorage contains valid data', () => {
      const mockStats = {
        totalWorkouts: 5,
        completedWorkouts: 3,
        totalTimeSeconds: 1800,
        totalExercises: 15,
        streakDays: 2,
        lastWorkoutDate: '2023-01-01T10:00:00.000Z',
        firstWorkoutDate: '2023-01-01T09:00:00.000Z'
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockStats));
      
      const stats = statsManager.loadStats();
      expect(stats).toEqual(mockStats);
    });
  });

  describe('loadSessions error handling', () => {
    test('returns empty array when localStorage throws error', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const sessions = statsManager.loadSessions();
      expect(sessions).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith('Error loading workout sessions:', expect.any(Error));
    });

    test('returns empty array when stored data is invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const sessions = statsManager.loadSessions();
      expect(sessions).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith('Error loading workout sessions:', expect.any(Error));
    });

    test('returns parsed sessions when localStorage contains valid data', () => {
      const mockSessions = [
        { id: 'session1', workoutName: 'Test Workout 1' },
        { id: 'session2', workoutName: 'Test Workout 2' }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockSessions));
      
      const sessions = statsManager.loadSessions();
      expect(sessions).toEqual(mockSessions);
    });
  });

  describe('constructor', () => {
    test('initializes with default values when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const manager = new StatisticsManager();
      
      expect(manager.currentSession).toBe(null);
      expect(manager.stats).toEqual(manager.getDefaultStats());
      expect(manager.sessions).toEqual([]);
    });

    test('initializes with stored values when localStorage has data', () => {
      const mockStats = { totalWorkouts: 5, completedWorkouts: 3 };
      const mockSessions = [{ id: 'session1' }];
      
      localStorageMock.getItem
        .mockReturnValueOnce(JSON.stringify(mockStats))  // for stats
        .mockReturnValueOnce(JSON.stringify(mockSessions)); // for sessions
      
      const manager = new StatisticsManager();
      
      expect(manager.stats).toEqual(expect.objectContaining(mockStats));
      expect(manager.sessions).toEqual(mockSessions);
    });
  });

  describe('clearAllData', () => {
    test('resets all data to default values', () => {
      // Set some test data
      statsManager.stats = { totalWorkouts: 10, completedWorkouts: 5 };
      statsManager.sessions = [{ id: 'test' }];
      statsManager.currentSession = { id: 'current' };
      
      statsManager.clearAllData();
      
      expect(statsManager.stats).toEqual(statsManager.getDefaultStats());
      expect(statsManager.sessions).toEqual([]);
      expect(statsManager.currentSession).toBe(null);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('workoutStats');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('workoutSessions');
    });
  });
});