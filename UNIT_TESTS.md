# Unit Tests Documentation

This document describes the comprehensive unit test suite added to the WorkoutApp repository, covering all pure functions and testable logic.

## Overview

The unit testing setup uses **Jest** with **jsdom** environment to test JavaScript modules in isolation. Tests focus on pure functions, validation logic, parsing algorithms, and utility functions that don't require browser-specific APIs.

## Test Structure

### Location
- **Test files**: `tests/*.test.js`
- **Setup file**: `tests/setup.js`
- **Configuration**: `jest.config.js`

### Test Coverage

**106 total tests** covering:

1. **APP_UTILS Functions** (15 tests)
   - `formatTime()` - Time formatting with edge cases
   - `parseTime()` - Time parsing with validation
   - `generateId()` - Unique ID generation
   - `sanitizeHtml()` - HTML sanitization
   - `isMobile()` - Device detection
   - `deepClone()` - Object deep cloning
   - `now()` - Timestamp generation

2. **UIUtils Class** (25 tests)
   - `getMessageIcon()` - Icon mapping for message types
   - `getMessageColor()` - Color mapping for message types
   - `validateInput()` - Form validation logic
   - `debounce()` - Function debouncing utility
   - `throttle()` - Function throttling utility
   - `showMessage()` - Toast notification system
   - `showConfirmDialog()` - Confirmation dialog system

3. **WorkoutParser Class** (15 tests)
   - `parseMarkdown()` - Markdown parsing with various formats:
     - Basic exercises with time
     - Rep-based exercises
     - Sets syntax (e.g., "3 sets x 0:30 / 0:15")
     - Exercise descriptions
     - Mixed exercise types
     - Error handling for invalid formats

4. **APP_CONFIG Constants** (33 tests)
   - **Regex Patterns**: All workout parsing regex patterns
   - **Configuration Values**: Validation limits, timing constants
   - **Message Templates**: Error and success messages
   - **Type Definitions**: Exercise types, message types

5. **StatisticsManager Class** (18 tests)
   - `getDefaultStats()` - Default statistics structure
   - `getFormattedTotalTime()` - Time formatting for display
   - `getSessionDuration()` - Session duration calculations
   - Error handling for localStorage operations
   - Constructor initialization logic
   - Data clearing functionality

## Key Testing Features

### Pure Function Focus
Tests concentrate on functions with no side effects that can be tested in isolation:
- Mathematical calculations (time formatting, duration parsing)
- String processing (HTML sanitization, markdown parsing)
- Object manipulation (deep cloning, validation)
- Utility functions (ID generation, device detection)

### Comprehensive Edge Cases
- **Time Formatting**: Negative values, zero values, large values
- **Parsing**: Invalid markdown formats, empty content, malformed syntax
- **Validation**: Edge cases for form inputs, boundary conditions
- **Error Handling**: localStorage failures, JSON parsing errors

### Mock Strategy
- **localStorage**: Mocked for StatisticsManager tests
- **Date.now()**: Fixed timestamp for consistent ID generation
- **Math.random()**: Controlled randomness for deterministic tests
- **console.warn**: Suppressed to avoid test noise
- **DOM APIs**: Mocked through jsdom environment

## Running Tests

```bash
# Run all unit tests
npm run test:unit

# Run unit tests in watch mode
npm run test:unit:watch

# Run both unit and e2e tests
npm test

# Run with coverage report
npm run test:unit -- --coverage
```

## Test Examples

### Time Formatting Tests
```javascript
expect(APP_UTILS.formatTime(90)).toBe('1:30');
expect(APP_UTILS.formatTime(3661)).toBe('61:01');
expect(APP_UTILS.parseTime('1:30')).toBe(90);
```

### Markdown Parsing Tests
```javascript
const markdown = `# Workout
## Push-ups - 0:30
## Rest - 0:15`;

const result = WorkoutParser.parseMarkdown(markdown);
expect(result.title).toBe('Workout');
expect(result.exercises[0].name).toBe('Push-ups');
expect(result.exercises[0].duration).toBe(30);
```

### Validation Tests
```javascript
expect(UIUtils.validateInput('abc', 'workoutName')).toEqual({
  isValid: true,
  error: null
});

expect(UIUtils.validateInput('', 'required')).toEqual({
  isValid: false,
  error: 'This field is required'
});
```

## Benefits

1. **Code Quality Assurance**: Catches bugs in utility functions before they reach production
2. **Regression Prevention**: Ensures refactoring doesn't break existing functionality
3. **Documentation**: Tests serve as living documentation of expected behavior
4. **Confidence**: Provides confidence when making changes to core logic
5. **Performance**: Fast feedback loop for pure function testing

## Coverage Goals

The test suite achieves high coverage of:
- ✅ All pure functions and utility methods
- ✅ Complex parsing and validation logic
- ✅ Error handling and edge cases
- ✅ Mathematical calculations and formatting
- ✅ Configuration validation

**Areas intentionally not covered**:
- DOM manipulation requiring real browser APIs
- Service worker functionality
- Audio APIs and media controls
- Complex UI interactions (covered by Cypress e2e tests)

## Integration with CI/CD

Unit tests run before e2e tests in the CI pipeline:
1. **Unit tests** validate core logic
2. **E2E tests** validate user interactions
3. Both must pass for deployment

This layered testing approach ensures both code correctness and user experience quality.