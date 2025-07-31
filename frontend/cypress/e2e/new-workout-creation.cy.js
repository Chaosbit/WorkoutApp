describe('New Workout Creation - Integration Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.clearLocalStorage()
  })

  it('should create and execute a new workout end-to-end', () => {
    // Create new workout
    cy.get('#newWorkoutBtn').click()
    cy.get('#workoutEditor').should('be.visible')
    
    // Fill in workout details
    cy.get('#workoutNameInput').type('My Test Workout')
    
    const customWorkout = `# My Test Workout

## Warm-up - 0:05
## Exercise 1 - 0:03
## Cool Down - 0:02`

    cy.get('#workoutMarkdownEditor').clear().type(customWorkout)
    
    // Save workout
    cy.get('#saveWorkoutBtn').click()
    
    // Verify workout is loaded and can be executed
    cy.get('#workoutDisplay').should('be.visible')
    cy.get('#workoutTitle').should('contain', 'My Test Workout')
    
    // Execute the workout
    cy.clickWorkoutControl('start')
    cy.getCurrentExercise().should('contain', 'Warm-up')
    
    // Skip through exercises
    cy.clickWorkoutControl('skip')
    cy.getCurrentExercise().should('contain', 'Exercise 1')
    
    cy.clickWorkoutControl('skip')
    cy.getCurrentExercise().should('contain', 'Cool Down')
  })

  it('should persist new workout in localStorage and reload it', () => {
    // Create workout
    cy.get('#newWorkoutBtn').click()
    cy.get('#workoutNameInput').type('Persistent Workout')
    cy.get('#saveWorkoutBtn').click()
    
    // Reload page
    cy.reload()
    
    // Should still be available in workout library
    cy.get('.saved-workouts').should('be.visible')
    cy.get('.saved-workouts select option').should('contain', 'Persistent Workout')
  })
})