// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Shadow DOM helper commands for web components

/**
 * Get an element inside a web component's shadow DOM
 */
Cypress.Commands.add('getShadow', (componentSelector, shadowSelector, options = {}) => {
  return cy.get(componentSelector, options).then(($component) => {
    const component = $component[0];
    if (!component.shadowRoot) {
      throw new Error(`Component ${componentSelector} does not have shadow DOM`);
    }
    const shadowElement = component.shadowRoot.querySelector(shadowSelector);
    if (!shadowElement) {
      throw new Error(`Element ${shadowSelector} not found in shadow DOM of ${componentSelector}`);
    }
    return cy.wrap(shadowElement);
  });
});

/**
 * Click an element inside a web component's shadow DOM
 */
Cypress.Commands.add('clickShadow', (componentSelector, shadowSelector) => {
  return cy.getShadow(componentSelector, shadowSelector).click();
});

/**
 * Type into an element inside a web component's shadow DOM
 */
Cypress.Commands.add('typeShadow', (componentSelector, shadowSelector, text) => {
  return cy.getShadow(componentSelector, shadowSelector).type(text);
});

/**
 * Check if shadow DOM element exists
 */
Cypress.Commands.add('shadowExists', (componentSelector, shadowSelector) => {
  return cy.get(componentSelector).then(($component) => {
    const component = $component[0];
    if (!component.shadowRoot) {
      return false;
    }
    return !!component.shadowRoot.querySelector(shadowSelector);
  });
});

// Workout-specific helper commands

/**
 * Click workout control buttons (start, pause, skip, reset)
 */
Cypress.Commands.add('clickWorkoutControl', (buttonType) => {
  const buttonMap = {
    'start': '#startBtn',
    'pause': '#pauseBtn', 
    'skip': '#skipBtn',
    'reset': '#resetBtn'
  };
  
  const selector = buttonMap[buttonType];
  if (!selector) {
    throw new Error(`Unknown button type: ${buttonType}. Use: start, pause, skip, reset`);
  }
  
  return cy.clickShadow('workout-controls', selector);
});

/**
 * Get workout control button state
 */
Cypress.Commands.add('getWorkoutControlState', (buttonType) => {
  const buttonMap = {
    'start': '#startBtn',
    'pause': '#pauseBtn',
    'skip': '#skipBtn', 
    'reset': '#resetBtn'
  };
  
  const selector = buttonMap[buttonType];
  if (!selector) {
    throw new Error(`Unknown button type: ${buttonType}`);
  }
  
  return cy.getShadow('workout-controls', selector);
});

/**
 * Click on an exercise in the exercise list
 */
Cypress.Commands.add('clickExercise', (exerciseIndex) => {
  return cy.getShadow('exercise-list', '.exercise-list').then(($list) => {
    const exercises = $list[0].querySelectorAll('.exercise-item');
    if (exerciseIndex >= exercises.length) {
      throw new Error(`Exercise index ${exerciseIndex} out of range. Found ${exercises.length} exercises.`);
    }
    return cy.wrap(exercises[exerciseIndex]).click();
  });
});

/**
 * Get exercise items from the exercise list component
 */
Cypress.Commands.add('getExerciseItems', () => {
  return cy.get('exercise-list').then(($component) => {
    const component = $component[0];
    if (!component.shadowRoot) {
      throw new Error('ExerciseList component does not have shadow DOM');
    }
    const exerciseItems = component.shadowRoot.querySelectorAll('.exercise-item');
    return cy.wrap(exerciseItems);
  });
});

/**
 * Get a specific exercise item by index
 */
Cypress.Commands.add('getExerciseItem', (index) => {
  return cy.get('exercise-list').then(($component) => {
    const component = $component[0];
    if (!component.shadowRoot) {
      throw new Error('ExerciseList component does not have shadow DOM');
    }
    const exerciseItems = component.shadowRoot.querySelectorAll('.exercise-item');
    if (index >= exerciseItems.length) {
      throw new Error(`Exercise index ${index} out of range. Found ${exerciseItems.length} exercises.`);
    }
    return cy.wrap(exerciseItems[index]);
  });
});

/**
 * Get the first exercise item
 */
Cypress.Commands.add('getFirstExerciseItem', () => {
  return cy.getExerciseItem(0);
});

/**
 * Get timer display value
 */
Cypress.Commands.add('getTimerDisplay', () => {
  return cy.getShadow('timer-display', '#timerDisplay');
});

/**
 * Get current exercise name
 */
Cypress.Commands.add('getCurrentExercise', () => {
  return cy.getShadow('timer-display', '#exerciseName');
});

/**
 * Get progress bar fill element
 */
Cypress.Commands.add('getProgressFill', () => {
  return cy.getShadow('timer-display', '#progressFill');
});