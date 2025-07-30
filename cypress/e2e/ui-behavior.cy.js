describe('UI Behavior - Integration Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should transition from sample format to workout display', () => {
    // Initially, sample format should be visible
    cy.get('.sample-format').should('be.visible')
    
    // Load a workout file
    cy.loadWorkoutFile('test-workout.md')
    
    // Sample format should now be hidden and workout should be visible
    cy.get('.sample-format').should('not.be.visible')
    cy.get('#workoutDisplay').should('be.visible')
    cy.get('#workoutTitle').should('contain', 'Test Workout')
  })

  it('should maintain workout display state during workout execution', () => {
    cy.loadWorkoutFile('test-workout.md')
    cy.get('.sample-format').should('not.be.visible')
    
    // Execute workout interactions
    cy.clickWorkoutControl('start')
    cy.clickWorkoutControl('skip')
    cy.clickWorkoutControl('reset')
    
    // UI should remain stable
    cy.get('.sample-format').should('not.be.visible')
    cy.get('#workoutDisplay').should('be.visible')
  })
})