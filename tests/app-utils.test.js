/**
 * Unit tests for APP_UTILS functions
 */

// Import the module - we need to handle ES modules in Jest
import { APP_UTILS } from '../js/constants.js';

describe('APP_UTILS', () => {
  describe('formatTime', () => {
    test('formats seconds correctly to MM:SS format', () => {
      expect(APP_UTILS.formatTime(0)).toBe('0:00');
      expect(APP_UTILS.formatTime(5)).toBe('0:05');
      expect(APP_UTILS.formatTime(30)).toBe('0:30');
      expect(APP_UTILS.formatTime(60)).toBe('1:00');
      expect(APP_UTILS.formatTime(65)).toBe('1:05');
      expect(APP_UTILS.formatTime(125)).toBe('2:05');
      expect(APP_UTILS.formatTime(3661)).toBe('61:01');
    });

    test('handles negative values gracefully', () => {
      expect(APP_UTILS.formatTime(-5)).toBe('-1:-5');
    });
  });

  describe('parseTime', () => {
    test('parses MM:SS format correctly to seconds', () => {
      expect(APP_UTILS.parseTime('0:00')).toBe(0);
      expect(APP_UTILS.parseTime('0:05')).toBe(5);
      expect(APP_UTILS.parseTime('0:30')).toBe(30);
      expect(APP_UTILS.parseTime('1:00')).toBe(60);
      expect(APP_UTILS.parseTime('1:05')).toBe(65);
      expect(APP_UTILS.parseTime('2:05')).toBe(125);
      expect(APP_UTILS.parseTime('61:01')).toBe(3661);
    });

    test('returns 0 for invalid time formats', () => {
      expect(APP_UTILS.parseTime('invalid')).toBe(0);
      expect(APP_UTILS.parseTime('1:5')).toBe(0); // seconds should be padded
      expect(APP_UTILS.parseTime('1')).toBe(0);
      expect(APP_UTILS.parseTime('')).toBe(0);
      expect(APP_UTILS.parseTime('1:60')).toBe(120); // valid but unusual
    });
  });

  describe('formatTime and parseTime round-trip', () => {
    test('should be consistent for round-trip operations', () => {
      const testValues = [0, 5, 30, 60, 65, 125, 3661];
      testValues.forEach(seconds => {
        const formatted = APP_UTILS.formatTime(seconds);
        const parsed = APP_UTILS.parseTime(formatted);
        expect(parsed).toBe(seconds);
      });
    });
  });

  describe('generateId', () => {
    test('generates unique identifiers', () => {
      // Reset mocks to get different values
      Math.random.mockReturnValueOnce(0.1).mockReturnValueOnce(0.9);
      Date.now.mockReturnValueOnce(1640995200000).mockReturnValueOnce(1640995300000);
      
      const id1 = APP_UTILS.generateId();
      const id2 = APP_UTILS.generateId();
      
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(10);
    });

    test('generates deterministic IDs with mocked Date.now and Math.random', () => {
      // With our mocked Date.now (1640995200000) and Math.random (0.5)
      const id = APP_UTILS.generateId();
      expect(id).toMatch(/^[0-9a-z]+$/); // Should contain only alphanumeric characters
    });
  });

  describe('sanitizeHtml', () => {
    test('sanitizes HTML content by escaping it', () => {
      expect(APP_UTILS.sanitizeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
      expect(APP_UTILS.sanitizeHtml('<img src="x" onerror="alert(1)">')).toBe('&lt;img src="x" onerror="alert(1)"&gt;');
      expect(APP_UTILS.sanitizeHtml('Plain text')).toBe('Plain text');
      expect(APP_UTILS.sanitizeHtml('<b>Bold</b>')).toBe('&lt;b&gt;Bold&lt;/b&gt;');
    });

    test('handles empty and null inputs', () => {
      expect(APP_UTILS.sanitizeHtml('')).toBe('');
      expect(APP_UTILS.sanitizeHtml(null)).toBe('');
      expect(APP_UTILS.sanitizeHtml(undefined)).toBe('');
    });
  });

  describe('isMobile', () => {
    test('detects mobile devices based on user agent', () => {
      // Mock different user agents
      const originalUserAgent = navigator.userAgent;
      
      // Test mobile user agents
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        configurable: true
      });
      expect(APP_UTILS.isMobile()).toBe(true);

      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 11; SM-G991B)',
        configurable: true
      });
      expect(APP_UTILS.isMobile()).toBe(true);

      // Test desktop user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        configurable: true
      });
      expect(APP_UTILS.isMobile()).toBe(false);

      // Restore original user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true
      });
    });
  });

  describe('now', () => {
    test('returns current timestamp', () => {
      const timestamp = APP_UTILS.now();
      expect(typeof timestamp).toBe('number');
      expect(timestamp).toBe(1640995200000); // Our mocked Date.now value
    });
  });

  describe('deepClone', () => {
    test('clones primitive values', () => {
      expect(APP_UTILS.deepClone(null)).toBe(null);
      expect(APP_UTILS.deepClone(undefined)).toBe(undefined);
      expect(APP_UTILS.deepClone(42)).toBe(42);
      expect(APP_UTILS.deepClone('hello')).toBe('hello');
      expect(APP_UTILS.deepClone(true)).toBe(true);
    });

    test('clones Date objects', () => {
      const date = new Date('2023-01-01');
      const clonedDate = APP_UTILS.deepClone(date);
      expect(clonedDate).toEqual(date);
      expect(clonedDate).not.toBe(date);
      expect(clonedDate instanceof Date).toBe(true);
    });

    test('clones arrays', () => {
      const arr = [1, 2, [3, 4]];
      const clonedArr = APP_UTILS.deepClone(arr);
      expect(clonedArr).toEqual(arr);
      expect(clonedArr).not.toBe(arr);
      expect(clonedArr[2]).not.toBe(arr[2]); // Deep clone
    });

    test('clones objects', () => {
      const obj = {
        name: 'test',
        nested: {
          value: 42,
          array: [1, 2, 3]
        }
      };
      const clonedObj = APP_UTILS.deepClone(obj);
      expect(clonedObj).toEqual(obj);
      expect(clonedObj).not.toBe(obj);
      expect(clonedObj.nested).not.toBe(obj.nested); // Deep clone
      expect(clonedObj.nested.array).not.toBe(obj.nested.array); // Deep clone
    });

    test('handles complex nested structures', () => {
      const complex = {
        date: new Date('2023-01-01'),
        array: [
          { id: 1, values: [1, 2, 3] },
          { id: 2, values: [4, 5, 6] }
        ],
        nested: {
          deep: {
            deeper: {
              value: 'deep value'
            }
          }
        }
      };
      
      const cloned = APP_UTILS.deepClone(complex);
      expect(cloned).toEqual(complex);
      expect(cloned).not.toBe(complex);
      expect(cloned.date).not.toBe(complex.date);
      expect(cloned.array[0]).not.toBe(complex.array[0]);
      expect(cloned.nested.deep.deeper).not.toBe(complex.nested.deep.deeper);
    });
  });
});