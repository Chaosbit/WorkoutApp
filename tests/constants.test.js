/**
 * Unit tests for APP_CONFIG constants and regex patterns
 */

import { APP_CONFIG } from '../js/constants.js';

describe('APP_CONFIG', () => {
  describe('REGEX_PATTERNS', () => {
    describe('TITLE', () => {
      test('matches valid markdown titles', () => {
        expect(APP_CONFIG.REGEX_PATTERNS.TITLE.test('# My Workout')).toBe(true);
        expect(APP_CONFIG.REGEX_PATTERNS.TITLE.test('# Push Day')).toBe(true);
        expect(APP_CONFIG.REGEX_PATTERNS.TITLE.test('#    Spaced Title   ')).toBe(true);
      });

      test('does not match invalid titles', () => {
        expect(APP_CONFIG.REGEX_PATTERNS.TITLE.test('## Not a title')).toBe(false);
        expect(APP_CONFIG.REGEX_PATTERNS.TITLE.test('### Also not a title')).toBe(false);
        expect(APP_CONFIG.REGEX_PATTERNS.TITLE.test('No hash')).toBe(false);
        expect(APP_CONFIG.REGEX_PATTERNS.TITLE.test('')).toBe(false);
      });

      test('extracts title text correctly', () => {
        const match = '# My Workout Title'.match(APP_CONFIG.REGEX_PATTERNS.TITLE);
        expect(match[1]).toBe('My Workout Title');
        
        const matchSpaced = '#    Spaced Title   '.match(APP_CONFIG.REGEX_PATTERNS.TITLE);
        expect(matchSpaced[1]).toBe('Spaced Title   ');
      });
    });

    describe('EXERCISE_HEADER', () => {
      test('matches valid exercise headers', () => {
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_HEADER.test('## Push-ups')).toBe(true);
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_HEADER.test('### Squats')).toBe(true);
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_HEADER.test('###  Burpees')).toBe(true);
      });

      test('does not match invalid headers', () => {
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_HEADER.test('# Title')).toBe(false);
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_HEADER.test('No hash')).toBe(false);
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_HEADER.test('')).toBe(false);
      });
    });

    describe('TIME_FORMAT', () => {
      test('matches valid time formats', () => {
        expect(APP_CONFIG.REGEX_PATTERNS.TIME_FORMAT.test('0:30')).toBe(true);
        expect(APP_CONFIG.REGEX_PATTERNS.TIME_FORMAT.test('1:00')).toBe(true);
        expect(APP_CONFIG.REGEX_PATTERNS.TIME_FORMAT.test('10:45')).toBe(true);
        expect(APP_CONFIG.REGEX_PATTERNS.TIME_FORMAT.test('999:59')).toBe(true);
      });

      test('does not match invalid time formats', () => {
        expect(APP_CONFIG.REGEX_PATTERNS.TIME_FORMAT.test('1:5')).toBe(false); // seconds not padded
        expect(APP_CONFIG.REGEX_PATTERNS.TIME_FORMAT.test('1')).toBe(false); // no colon
        expect(APP_CONFIG.REGEX_PATTERNS.TIME_FORMAT.test('1:000')).toBe(false); // too many digits
        expect(APP_CONFIG.REGEX_PATTERNS.TIME_FORMAT.test('')).toBe(false);
      });

      test('extracts minutes and seconds correctly', () => {
        const match = '5:30'.match(APP_CONFIG.REGEX_PATTERNS.TIME_FORMAT);
        expect(match[1]).toBe('5');
        expect(match[2]).toBe('30');
        
        const matchLong = '123:45'.match(APP_CONFIG.REGEX_PATTERNS.TIME_FORMAT);
        expect(matchLong[1]).toBe('123');
        expect(matchLong[2]).toBe('45');
      });
    });

    describe('REPS_FORMAT', () => {
      test('matches valid rep formats', () => {
        expect(APP_CONFIG.REGEX_PATTERNS.REPS_FORMAT.test('10 reps')).toBe(true);
        expect(APP_CONFIG.REGEX_PATTERNS.REPS_FORMAT.test('20 rep')).toBe(true);
        expect(APP_CONFIG.REGEX_PATTERNS.REPS_FORMAT.test('5 REPS')).toBe(true);
        expect(APP_CONFIG.REGEX_PATTERNS.REPS_FORMAT.test('100 Reps')).toBe(true);
      });

      test('does not match invalid rep formats', () => {
        expect(APP_CONFIG.REGEX_PATTERNS.REPS_FORMAT.test('reps')).toBe(false); // no number
        expect(APP_CONFIG.REGEX_PATTERNS.REPS_FORMAT.test('10')).toBe(false); // no reps word
        expect(APP_CONFIG.REGEX_PATTERNS.REPS_FORMAT.test('10 times')).toBe(false); // wrong word
        expect(APP_CONFIG.REGEX_PATTERNS.REPS_FORMAT.test('')).toBe(false);
      });

      test('extracts rep count correctly', () => {
        const match = '15 reps'.match(APP_CONFIG.REGEX_PATTERNS.REPS_FORMAT);
        expect(match[1]).toBe('15');
        
        const matchSingular = '1 rep'.match(APP_CONFIG.REGEX_PATTERNS.REPS_FORMAT);
        expect(matchSingular[1]).toBe('1');
      });
    });

    describe('SETS_FORMAT', () => {
      test('matches valid sets format', () => {
        expect(APP_CONFIG.REGEX_PATTERNS.SETS_FORMAT.test('Exercise - 3 sets x 0:30 / 0:15')).toBe(true);
        expect(APP_CONFIG.REGEX_PATTERNS.SETS_FORMAT.test('Push-ups - 5 set x 1:00 / 0:20')).toBe(true);
      });

      test('does not match invalid sets format', () => {
        expect(APP_CONFIG.REGEX_PATTERNS.SETS_FORMAT.test('Exercise - 3 sets')).toBe(false); // no times
        expect(APP_CONFIG.REGEX_PATTERNS.SETS_FORMAT.test('Exercise - 0:30 / 0:15')).toBe(false); // no sets
        expect(APP_CONFIG.REGEX_PATTERNS.SETS_FORMAT.test('Exercise - 3 x 0:30 / 0:15')).toBe(false); // no sets word
        expect(APP_CONFIG.REGEX_PATTERNS.SETS_FORMAT.test('')).toBe(false);
      });

      test('extracts all components correctly', () => {
        const match = 'Push-ups - 3 sets x 0:45 / 0:20'.match(APP_CONFIG.REGEX_PATTERNS.SETS_FORMAT);
        expect(match[1]).toBe('Push-ups'); // name
        expect(match[2]).toBe('3'); // sets
        expect(match[3]).toBe('0'); // exercise minutes
        expect(match[4]).toBe('45'); // exercise seconds
        expect(match[5]).toBe('0'); // rest minutes
        expect(match[6]).toBe('20'); // rest seconds
      });
    });

    describe('EXERCISE_TIME', () => {
      test('matches exercise with time format', () => {
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_TIME.test('Push-ups - 0:30')).toBe(true);
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_TIME.test('Complex Exercise Name - 2:45')).toBe(true);
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_TIME.test('A - 0:05')).toBe(true);
      });

      test('does not match invalid formats', () => {
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_TIME.test('Push-ups 0:30')).toBe(false); // no dash
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_TIME.test('Push-ups - 30')).toBe(false); // no colon
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_TIME.test('- 0:30')).toBe(false); // no name
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_TIME.test('')).toBe(false);
      });

      test('extracts name and time components correctly', () => {
        const match = 'Push-ups - 1:30'.match(APP_CONFIG.REGEX_PATTERNS.EXERCISE_TIME);
        expect(match[1]).toBe('Push-ups'); // name
        expect(match[2]).toBe('1'); // minutes
        expect(match[3]).toBe('30'); // seconds
      });
    });

    describe('EXERCISE_REPS', () => {
      test('matches exercise with reps format', () => {
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_REPS.test('Push-ups - 20 reps')).toBe(true);
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_REPS.test('Squats - 15 rep')).toBe(true);
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_REPS.test('Complex Exercise - 100 REPS')).toBe(true);
      });

      test('does not match invalid formats', () => {
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_REPS.test('Push-ups 20 reps')).toBe(false); // no dash
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_REPS.test('Push-ups - 20')).toBe(false); // no reps word
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_REPS.test('- 20 reps')).toBe(false); // no name
        expect(APP_CONFIG.REGEX_PATTERNS.EXERCISE_REPS.test('')).toBe(false);
      });

      test('extracts name and reps correctly', () => {
        const match = 'Burpees - 10 reps'.match(APP_CONFIG.REGEX_PATTERNS.EXERCISE_REPS);
        expect(match[1]).toBe('Burpees'); // name
        expect(match[2]).toBe('10'); // reps
      });
    });
  });

  describe('VALIDATION', () => {
    test('has reasonable validation limits', () => {
      expect(APP_CONFIG.VALIDATION.MIN_WORKOUT_NAME_LENGTH).toBe(3);
      expect(APP_CONFIG.VALIDATION.MAX_WORKOUT_NAME_LENGTH).toBe(100);
      expect(APP_CONFIG.VALIDATION.MIN_EXERCISE_DURATION).toBe(5);
      expect(APP_CONFIG.VALIDATION.MAX_EXERCISE_DURATION).toBe(3600);
      expect(APP_CONFIG.VALIDATION.MAX_SETS).toBe(50);
    });
  });

  describe('EXERCISE_TYPES', () => {
    test('defines expected exercise types', () => {
      expect(APP_CONFIG.EXERCISE_TYPES.TIMER).toBe('timer');
      expect(APP_CONFIG.EXERCISE_TYPES.REPS).toBe('reps');
      expect(APP_CONFIG.EXERCISE_TYPES.REST).toBe('rest');
    });
  });

  describe('MESSAGE_TYPES', () => {
    test('defines expected message types', () => {
      expect(APP_CONFIG.MESSAGE_TYPES.SUCCESS).toBe('success');
      expect(APP_CONFIG.MESSAGE_TYPES.ERROR).toBe('error');
      expect(APP_CONFIG.MESSAGE_TYPES.WARNING).toBe('warning');
      expect(APP_CONFIG.MESSAGE_TYPES.INFO).toBe('info');
    });
  });

  describe('AUDIO_FREQUENCIES', () => {
    test('has numeric frequency values', () => {
      expect(typeof APP_CONFIG.AUDIO_FREQUENCIES.EXERCISE_COMPLETE).toBe('number');
      expect(typeof APP_CONFIG.AUDIO_FREQUENCIES.REST_START).toBe('number');
      expect(Array.isArray(APP_CONFIG.AUDIO_FREQUENCIES.WORKOUT_COMPLETE)).toBe(true);
      expect(APP_CONFIG.AUDIO_FREQUENCIES.WORKOUT_COMPLETE.every(f => typeof f === 'number')).toBe(true);
    });
  });

  describe('STORAGE_KEYS', () => {
    test('defines unique storage keys', () => {
      const keys = Object.values(APP_CONFIG.STORAGE_KEYS);
      const uniqueKeys = new Set(keys);
      expect(keys.length).toBe(uniqueKeys.size); // All keys should be unique
    });
  });

  describe('ERROR_MESSAGES', () => {
    test('has user-friendly error messages', () => {
      expect(APP_CONFIG.ERROR_MESSAGES.WORKOUT_LOAD_FAILED).toContain('Failed to load');
      expect(APP_CONFIG.ERROR_MESSAGES.INVALID_WORKOUT_NAME).toContain('valid workout name');
      expect(APP_CONFIG.ERROR_MESSAGES.INVALID_WORKOUT_CONTENT).toContain('valid workout content');
    });
  });

  describe('SUCCESS_MESSAGES', () => {
    test('has positive success messages', () => {
      expect(APP_CONFIG.SUCCESS_MESSAGES.WORKOUT_LOADED).toContain('successfully');
      expect(APP_CONFIG.SUCCESS_MESSAGES.WORKOUT_SAVED).toContain('successfully');
      expect(APP_CONFIG.SUCCESS_MESSAGES.WORKOUT_COMPLETED).toContain('completed');
    });
  });

  describe('CALENDAR', () => {
    test('has correct month and day arrays', () => {
      expect(APP_CONFIG.CALENDAR.MONTHS).toHaveLength(12);
      expect(APP_CONFIG.CALENDAR.MONTHS[0]).toBe('January');
      expect(APP_CONFIG.CALENDAR.MONTHS[11]).toBe('December');
      
      expect(APP_CONFIG.CALENDAR.DAYS).toHaveLength(7);
      expect(APP_CONFIG.CALENDAR.DAYS[0]).toBe('Sun');
      expect(APP_CONFIG.CALENDAR.DAYS[6]).toBe('Sat');
    });
  });

  describe('PERFORMANCE', () => {
    test('has reasonable performance settings', () => {
      expect(APP_CONFIG.PERFORMANCE.MAX_CONCURRENT_SOUNDS).toBeGreaterThan(0);
      expect(APP_CONFIG.PERFORMANCE.TIMER_PRECISION).toBeGreaterThan(0);
      expect(APP_CONFIG.PERFORMANCE.DOM_UPDATE_BATCH_SIZE).toBeGreaterThan(0);
      expect(APP_CONFIG.PERFORMANCE.STORAGE_CLEANUP_INTERVAL).toBeGreaterThan(0);
    });
  });

  describe('Timing constants', () => {
    test('has reasonable timing values', () => {
      expect(APP_CONFIG.TIMER_UPDATE_INTERVAL).toBe(100);
      expect(APP_CONFIG.MESSAGE_DURATION).toBe(3000);
      expect(APP_CONFIG.DEBOUNCE_DELAY).toBe(300);
      expect(APP_CONFIG.THROTTLE_LIMIT).toBe(100);
      expect(APP_CONFIG.AUDIO_DURATION).toBe(200);
    });
  });
});