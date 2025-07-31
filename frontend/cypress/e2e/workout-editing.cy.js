describe('Workout Editing - Integration Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.clearLocalStorage()
  })

  it('should edit and save workout changes end-to-end', () => {
    // Load initial workout
    cy.loadWorkoutFile('test-workout.md')
    cy.get('#editWorkoutBtn').should('not.be.disabled')
    
    // Enter edit mode
    cy.get('#editWorkoutBtn').click()
    cy.get('#workoutEditor').should('be.visible')
    cy.get('#workoutDisplay').should('not.be.visible')
    
    // Make changes
    cy.get('#workoutNameInput').clear().type('Edited Test Workout')
    
    const editedContent = `# Edited Test Workout

## Modified Exercise - 0:10
This is an edited exercise.

## New Exercise - 0:15
A brand new exercise.`

    cy.get('#workoutMarkdownEditor').clear().type(editedContent)
    
    // Save changes
    cy.get('#saveWorkoutBtn').click()
    
    // Verify changes are applied
    cy.get('#workoutDisplay').should('be.visible')
    cy.get('#workoutTitle').should('contain', 'Edited Test Workout')
    cy.getCurrentExercise().should('contain', 'Modified Exercise')
    
    // Verify workout is functional after editing
    cy.clickWorkoutControl('start')
    cy.getCurrentExercise().should('contain', 'Modified Exercise')
  })

  it('should cancel editing and revert to original workout', () => {
    cy.loadWorkoutFile('test-workout.md')
    cy.get('#workoutTitle').invoke('text').then((originalTitle) => {
      
      // Enter edit mode and make changes
      cy.get('#editWorkoutBtn').click()
      cy.get('#workoutNameInput').clear().type('Should Not Save')
      
      // Cancel editing
      cy.get('#cancelEditBtn').click()
      
      // Should return to original workout
      cy.get('#workoutDisplay').should('be.visible')
      cy.get('#workoutTitle').should('contain', originalTitle)
      cy.get('#workoutTitle').should('not.contain', 'Should Not Save')
    })
  })
})