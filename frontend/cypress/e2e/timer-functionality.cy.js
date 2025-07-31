describe('Timer Functionality - Integration Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.loadWorkoutFile('test-workout.md')
    cy.waitForWorkoutLoad()
  })

  it('should execute complete workout flow from start to finish', () => {
    // Start workout
    cy.clickWorkoutControl('start')
    cy.getExerciseItem(0).should('have.class', 'current')
    
    // Pause and resume
    cy.clickWorkoutControl('pause')
    cy.getTimerDisplay().invoke('text').then((pausedTime) => {
      cy.wait(500)
      cy.getTimerDisplay().should('contain', pausedTime) // Timer should not change while paused
      cy.clickWorkoutControl('start') // Resume
    })
    
    // Skip through exercises and verify progression
    cy.clickWorkoutControl('skip')
    cy.getExerciseItem(0).should('have.class', 'completed')
    cy.getExerciseItem(1).should('have.class', 'current')
    
    // Complete remaining exercises
    for (let i = 0; i < 5; i++) {
      cy.clickWorkoutControl('skip')
      cy.wait(100)
    }
    
    // Verify workout completion
    cy.getCurrentExercise().should('contain', 'Workout Complete! 🎉')
    cy.get('.app-message--success', { timeout: 10000 }).should('be.visible')
    cy.get('.app-message--success').should('contain', 'Workout completed! Great job! 💪')
  })

  it('should handle workout reset functionality', () => {
    cy.clickWorkoutControl('start')
    cy.clickWorkoutControl('skip')
    cy.getExerciseItem(0).should('have.class', 'completed')
    
    cy.clickWorkoutControl('reset')
    
    // Verify reset state
    cy.getCurrentExercise().should('contain', 'Warm-up')
    cy.getExerciseItem(0).should('have.class', 'current')
    cy.getWorkoutControlState('start').should('be.enabled')
    cy.getWorkoutControlState('pause').should('be.disabled')
  })

  it('should handle automatic timer progression', () => {
    cy.clickWorkoutControl('start')
    
    // Wait for first exercise to complete automatically
    cy.wait(3500)
    cy.getCurrentExercise().should('contain', 'Push-ups')
    
    // Wait for second exercise to start
    cy.wait(2500)
    cy.getCurrentExercise().should('contain', 'Rest')
  })
})