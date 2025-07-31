describe('Audio Features - Integration Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.loadWorkoutFile('test-workout.md')
  })

  it('should play audio during workout progression', () => {
    cy.window().then((win) => {
      cy.spy(win.AudioContext.prototype, 'createOscillator').as('createOscillator')
    })
    
    cy.clickWorkoutControl('start')
    cy.clickWorkoutControl('skip') // Should trigger exercise completion sound
    
    cy.get('@createOscillator').should('have.been.called')
  })

  it('should handle audio context errors gracefully during workout', () => {
    cy.window().then((win) => {
      cy.stub(win.AudioContext.prototype, 'createOscillator').throws(new Error('Audio error'))
      cy.spy(win.console, 'warn').as('consoleWarn')
    })
    
    cy.clickWorkoutControl('start')
    cy.clickWorkoutControl('skip')
    
    // Should continue workout despite audio error
    cy.getCurrentExercise().should('contain', 'Push-ups')
    cy.get('@consoleWarn').should('have.been.called')
  })
})