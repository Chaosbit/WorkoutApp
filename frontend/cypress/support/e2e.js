// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add custom commands for PWA testing
Cypress.Commands.add('checkPWAManifest', () => {
  cy.get('link[rel="manifest"]').should('exist')
  cy.request('/manifest.json').then((response) => {
    expect(response.status).to.eq(200)
    expect(response.body).to.have.property('name')
    expect(response.body).to.have.property('start_url')
    expect(response.body).to.have.property('display', 'standalone')
  })
})

Cypress.Commands.add('checkServiceWorker', () => {
  cy.window().then((win) => {
    expect(win.navigator.serviceWorker).to.exist
  })
})

Cypress.Commands.add('loadWorkoutFile', (filename) => {
  cy.fixture(filename).then(fileContent => {
    const blob = new Blob([fileContent], { type: 'text/markdown' })
    const file = new File([blob], filename, { type: 'text/markdown' })
    
    cy.get('#workoutFile').then(input => {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input[0].files = dataTransfer.files
      
      const changeEvent = new Event('change', { bubbles: true })
      input[0].dispatchEvent(changeEvent)
    })
  })
})

Cypress.Commands.add('waitForTimer', (seconds) => {
  cy.wait(seconds * 1000)
})

/**
 * Wait for workout to load and exercises to be populated
 */
Cypress.Commands.add('waitForWorkoutLoad', () => {
  // Wait for workout display to be visible
  cy.get('#workoutDisplay').should('be.visible')
  // Wait for exercise list to have exercises
  cy.get('exercise-list').should('exist').then(($component) => {
    const component = $component[0];
    cy.wrap(component).should(() => {
      expect(component.shadowRoot).to.exist;
      const exerciseItems = component.shadowRoot.querySelectorAll('.exercise-item');
      expect(exerciseItems.length).to.be.greaterThan(0);
    });
  });
})