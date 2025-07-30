# Web Component Testing Guide

This guide explains how to test web components in isolation using Jest and JSDOM, providing an alternative to full end-to-end testing with Cypress.

## Overview

The WorkoutApp uses custom web components built with vanilla JavaScript and Shadow DOM. Testing these components requires special handling since they encapsulate their DOM and styles within shadow roots.

## Testing Infrastructure

### Test Setup

- **Framework**: Jest with JSDOM environment
- **Location**: `tests/web-components.test.js`
- **Test Count**: 73 comprehensive unit tests
- **Coverage**: Component initialization, attributes, methods, events, error handling, and accessibility

### Key Testing Utilities

```javascript
// Helper function to wait for component rendering
const waitForComponentRender = (element) => {
    return new Promise(resolve => {
        if (element.shadowRoot) {
            resolve();
        } else {
            setTimeout(() => resolve(), 0);
        }
    });
};

// Helper function to set attributes with proper async handling
const setAttribute = async (element, name, value) => {
    element.setAttribute(name, value);
    await waitForComponentRender(element);
    await new Promise(resolve => setTimeout(resolve, 0));
};
```

## Component Testing Patterns

### 1. Component Registration and Initialization

```javascript
describe('Component Registration and Initialization', () => {
    test('should be defined as a custom element', () => {
        expect(customElements.get('timer-display')).toBeDefined();
    });

    test('should render with shadow DOM', () => {
        expect(element.shadowRoot).toBeDefined();
        expect(element.shadowRoot.querySelector('.timer-display-container')).toBeTruthy();
    });

    test('should initialize with default state', () => {
        expect(element.currentExercise).toBeNull();
        expect(element.timeRemaining).toBe(0);
    });
});
```

### 2. Observed Attributes Testing

```javascript
describe('Observed Attributes', () => {
    test('should define observed attributes', () => {
        const observedAttributes = element.constructor.observedAttributes;
        expect(observedAttributes).toContain('time-remaining');
    });

    test('should react to attribute changes', async () => {
        await setAttribute(element, 'time-remaining', '120');
        expect(element.timeRemaining).toBe(120);
    });
});
```

### 3. Event Handling

```javascript
describe('Event Handling', () => {
    test('should emit custom events', () => {
        let eventFired = false;
        element.addEventListener('rep-completed', () => {
            eventFired = true;
        });
        
        const button = element.shadowRoot.querySelector('#completeRepBtn');
        button.click();
        
        expect(eventFired).toBe(true);
    });
});
```

### 4. Shadow DOM Access

```javascript
// Access elements within shadow DOM
const shadowRoot = element.shadowRoot;
const internalElement = shadowRoot.querySelector('#exerciseName');

// Test shadow DOM structure
expect(shadowRoot.querySelector('.timer-display-container')).toBeTruthy();
```

### 5. Error Handling

```javascript
describe('Error Handling', () => {
    test('should handle invalid attribute values gracefully', async () => {
        await setAttribute(element, 'time-remaining', 'invalid');
        expect(element.timeRemaining).toBe(0); // Falls back to 0
    });
});
```

## Tested Components

### TimerDisplayComponent (`<timer-display>`)

**Test Categories:**
- Component registration and initialization (4 tests)
- Observed attributes reactivity (6 tests)
- Exercise management (4 tests)
- Timer display and progress (4 tests)
- Event handling (2 tests)
- Component lifecycle (1 test)
- Error handling (2 tests)
- Accessibility (2 tests)

**Key Features Tested:**
- Shadow DOM encapsulation
- Attribute-driven reactivity
- Exercise type handling (timer vs reps)
- Progress bar calculations
- Custom event emission
- Error resilience

### WorkoutControlsComponent (`<workout-controls>`)

**Test Categories:**
- Component registration and initialization (4 tests)
- Observed attributes (5 tests)
- Button state management (3 tests)
- Event handling (6 tests)
- Error handling (1 test)
- Accessibility (2 tests)
- Performance (1 test)

**Key Features Tested:**
- Button state synchronization
- Custom event emission for all actions
- Disabled state handling
- State-dependent UI updates
- Performance under rapid changes

### ExerciseListComponent (`<exercise-list>`)

**Test Categories:**
- Component registration and initialization (3 tests)
- Observed attributes (2 tests)
- Workout management (4 tests)
- Exercise state management (4 tests)
- Exercise type handling (1 test)
- Event handling (3 tests)
- Visibility management (2 tests)
- Performance (1 test)
- Error handling (2 tests)
- Accessibility (3 tests)

**Key Features Tested:**
- Dynamic exercise list rendering
- Exercise state tracking (current, completed)
- Multiple exercise type support
- Click-to-navigate functionality
- Large dataset performance
- Malformed data resilience

## Benefits of Isolated Component Testing

### 1. **Fast Execution**
- Unit tests run in ~2 seconds vs minutes for E2E tests
- No browser startup or navigation overhead
- Parallel test execution

### 2. **Precise Testing**
- Test individual component functionality in isolation
- Mock external dependencies easily
- Focus on component contract and behavior

### 3. **Better Error Isolation**
- Component failures don't affect other tests
- Clear error messages point to specific component issues
- Easier debugging and maintenance

### 4. **Comprehensive Coverage**
- Test edge cases that are hard to reproduce in E2E tests
- Validate error handling scenarios
- Test accessibility features
- Performance testing with large datasets

### 5. **Development Workflow**
- Run tests during development without full app setup
- TDD-friendly approach for component development
- Quick feedback loop for refactoring

## Running Web Component Tests

```bash
# Run all web component tests
npm test -- --testNamePattern="Web Components"

# Run with coverage
npm run test:unit:coverage

# Watch mode for development
npm run test:unit:watch -- --testNamePattern="Web Components"
```

## Testing Best Practices

### 1. Component Isolation
- Each test creates a fresh component instance
- Clean up DOM after each test to prevent interference
- Mock external dependencies

### 2. Shadow DOM Handling
- Always access elements through `element.shadowRoot`
- Use helper functions for consistent shadow DOM access
- Test shadow DOM structure and encapsulation

### 3. Async Attribute Testing
- Use async/await for attribute changes
- Allow time for reactive updates to process
- Test both valid and invalid attribute values

### 4. Event Testing
- Test custom event emission
- Verify event detail payloads
- Test event bubbling when relevant

### 5. Error Resilience
- Test with malformed data
- Test with missing required attributes
- Verify graceful degradation

## Integration with E2E Tests

While these unit tests provide comprehensive component testing, they complement rather than replace E2E tests:

- **Unit Tests**: Component behavior, edge cases, error handling
- **E2E Tests**: User workflows, component interaction, integration points

The combination provides robust test coverage at different levels of the application stack.

## Coverage Results

Current web component test coverage:
- **TimerDisplayComponent**: 74% statement coverage
- **WorkoutControlsComponent**: 73% statement coverage  
- **ExerciseListComponent**: 88% statement coverage

The enhanced test suite significantly improves component reliability and maintainability.