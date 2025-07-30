describe('Description Visibility - Integration Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.loadWorkoutFile('sample-workout.md')
    cy.waitForWorkoutLoad()
  })

  it('should toggle description visibility during workout', () => {
    cy.clickDescriptionToggle()
    cy.getExerciseDescription().should('have.class', 'expanded')
    cy.getDescriptionContent().should('be.visible')
    
    cy.clickDescriptionToggle()
    cy.getExerciseDescription().should('not.have.class', 'expanded')
  })

  it('should maintain description functionality across exercise transitions', () => {
    cy.clickWorkoutControl('start')
    cy.clickDescriptionToggle()
    cy.getDescriptionContent().should('be.visible')
    
    // Skip to next exercise
    cy.clickWorkoutControl('skip')
    
    // Description should still be functional
    cy.clickDescriptionToggle()
    cy.getExerciseDescription().should('have.class', 'expanded')
  })
})