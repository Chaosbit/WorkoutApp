describe('UI Behavior', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should hide sample format when workout file is loaded', () => {
    // Initially, sample format should be visible
    cy.get('.sample-format').should('be.visible')
    cy.get('.sample-format h3').should('contain', 'Sample Workout Format')
    cy.get('.sample-format pre').should('be.visible')
    
    // Load a workout file
    cy.loadWorkoutFile('test-workout.md')
    
    // Sample format should now be hidden
    cy.get('.sample-format').should('not.be.visible')
    
    // Workout display should be visible instead
    cy.get('#workoutDisplay').should('be.visible')
    cy.get('#workoutTitle').should('contain', 'Test Workout')
  })

  it('should keep sample format hidden even after workout interactions', () => {
    // Load workout and verify sample is hidden
    cy.loadWorkoutFile('test-workout.md')
    cy.get('.sample-format').should('not.be.visible')
    
    // Interact with workout (start, pause, reset)
    cy.get('#startBtn').click()
    cy.get('#pauseBtn').click()
    cy.get('#resetBtn').click()
    
    // Sample format should still be hidden
    cy.get('.sample-format').should('not.be.visible')
    cy.get('#workoutDisplay').should('be.visible')
  })

  it('should show sample format initially on page load', () => {
    cy.get('.sample-format').should('be.visible')
    cy.get('.sample-format').within(() => {
      cy.get('h3').should('contain', 'Sample Workout Format')
      cy.get('pre').should('contain', 'Push Day Workout')
      cy.get('pre').should('contain', 'Warm-up - 5:00')
      cy.get('pre').should('contain', 'Push-ups - 0:45')
    })
    
    // Workout display should be hidden initially
    cy.get('#workoutDisplay').should('not.be.visible')
  })

  it('should maintain clean layout after loading workout', () => {
    cy.loadWorkoutFile('test-workout.md')
    
    // Check that the file input area is still present
    cy.get('.file-input-area').should('be.visible')
    cy.get('#workoutFile').should('exist')
    
    // But sample format should be hidden
    cy.get('.sample-format').should('not.be.visible')
    
    // And workout should be displayed
    cy.get('#workoutDisplay').should('be.visible')
  })

  it('should handle loading different workout files', () => {
    // Load first workout
    cy.loadWorkoutFile('test-workout.md')
    cy.get('.sample-format').should('not.be.visible')
    cy.get('#workoutTitle').should('contain', 'Test Workout')
    
    // Load different workout
    const differentWorkout = `# Different Workout

## Exercise A - 0:10
## Exercise B - 0:15`

    cy.get('#workoutFile').then(input => {
      const blob = new Blob([differentWorkout], { type: 'text/markdown' })
      const file = new File([blob], 'different.md', { type: 'text/markdown' })
      
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input[0].files = dataTransfer.files
      
      const changeEvent = new Event('change', { bubbles: true })
      input[0].dispatchEvent(changeEvent)
    })
    
    // Sample should still be hidden, new workout should be loaded
    cy.get('.sample-format').should('not.be.visible')
    cy.get('#workoutTitle').should('contain', 'Different Workout')
    cy.get('.exercise-item').should('have.length', 2)
  })

  it('should maintain responsive behavior after loading workout', () => {
    // Test on mobile viewport
    cy.viewport('iphone-x')
    
    // Load workout
    cy.loadWorkoutFile('test-workout.md')
    
    // Sample should be hidden
    cy.get('.sample-format').should('not.be.visible')
    
    // Workout display should be visible and properly sized
    cy.get('#workoutDisplay').should('be.visible')
    cy.get('.timer-container').should('be.visible')
    cy.get('#currentExercise').should('be.visible')
    cy.get('#timerDisplay').should('be.visible')
  })
})