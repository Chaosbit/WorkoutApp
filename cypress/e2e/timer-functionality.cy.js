describe('Timer Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.loadWorkoutFile('test-workout.md')
  })

  it('should have correct initial button states', () => {
    cy.getWorkoutControlState('start').should('be.enabled')
    cy.getWorkoutControlState('pause').should('be.disabled')
    cy.getWorkoutControlState('skip').should('be.disabled')
    cy.getWorkoutControlState('reset').should('be.enabled')
  })

  it('should start the timer when Start button is clicked', () => {
    cy.clickWorkoutControl('start')
    
    cy.getWorkoutControlState('start').should('be.disabled')
    cy.getWorkoutControlState('pause').should('be.enabled')
    cy.getWorkoutControlState('skip').should('be.enabled')
    
    cy.getExerciseItem(0).should('have.class', 'current')
  })

  it('should pause and resume the timer', () => {
    // Start the timer
    cy.clickWorkoutControl('start')
    
    // Let timer run for a bit and verify it's counting down
    cy.wait(500)
    
    // Pause the timer
    cy.clickWorkoutControl('pause')
    
    // Check button states after pause
    cy.getWorkoutControlState('start').should('be.enabled')
    cy.getWorkoutControlState('pause').should('be.disabled')
    cy.getWorkoutControlState('skip').should('be.enabled')
    
    // Store current timer value
    cy.getTimerDisplay().invoke('text').then((pausedTime) => {
      // Wait a bit while paused
      cy.wait(1000)
      
      // Timer should not have changed while paused
      cy.getTimerDisplay().should('contain', pausedTime)
      
      // Resume timer
      cy.clickWorkoutControl('start')
      cy.getWorkoutControlState('start').should('be.disabled')
      cy.getWorkoutControlState('pause').should('be.enabled')
    })
  })

  it('should skip to next exercise', () => {
    cy.clickWorkoutControl('start')
    cy.clickWorkoutControl('skip')
    
    cy.getCurrentExercise().should('contain', 'Push-ups')
    cy.getTimerDisplay().should('contain', '0:02')
    cy.get('#progressText').should('contain', 'Exercise 2 of 6')
    
    cy.getExerciseItem(0).should('have.class', 'completed')
    cy.getExerciseItem(1).should('have.class', 'current')
  })

  it('should reset the workout', () => {
    cy.clickWorkoutControl('start')
    cy.clickWorkoutControl('skip')
    cy.clickWorkoutControl('reset')
    
    cy.getCurrentExercise().should('contain', 'Warm-up')
    cy.getTimerDisplay().should('contain', '0:03')
    cy.get('#progressText').should('contain', 'Exercise 1 of 6')
    
    cy.getWorkoutControlState('start').should('be.enabled')
    cy.getWorkoutControlState('pause').should('be.disabled')
    cy.getWorkoutControlState('skip').should('be.disabled')
    
    cy.getExerciseItem(0).should('have.class', 'current')
  })

  it('should automatically advance through exercises', () => {
    cy.clickWorkoutControl('start')
    
    cy.wait(3500)
    cy.getCurrentExercise().should('contain', 'Push-ups')
    cy.getTimerDisplay().should('contain', '0:02')
    
    cy.wait(2500)
    cy.getCurrentExercise().should('contain', 'Rest')
    cy.getTimerDisplay().should('contain', '0:01')
  })

  it('should update progress bar during exercise', () => {
    cy.clickWorkoutControl('start')
    
    cy.getProgressFill().should('have.css', 'width', '0px')
    
    cy.wait(1000)
    cy.getProgressFill().should('not.have.css', 'width', '0px')
    
    cy.wait(2500)
    cy.getProgressFill().should('have.css', 'width').and('match', /\d+px/)
  })

  it('should complete the workout and show completion message', () => {
    cy.clickWorkoutControl('start')
    
    for (let i = 0; i < 6; i++) {
      cy.clickWorkoutControl('skip')
      cy.wait(100)
    }
    
    cy.getCurrentExercise().should('contain', 'Workout Complete! 🎉')
    cy.getTimerDisplay().should('contain', '0:00')
    cy.getProgressFill().should('have.css', 'width').and('not.equal', '0px')
    
    // Should show completion message instead of alert
    cy.get('.app-message--success').should('be.visible')
    cy.get('.app-message--success').should('contain', 'Workout completed! Great job! 💪')
  })

  it('should mark exercises as completed during workout progression', () => {
    cy.clickWorkoutControl('start')
    
    cy.clickWorkoutControl('skip')
    cy.getExerciseItem(0).should('have.class', 'completed')
    
    cy.clickWorkoutControl('skip')
    cy.getExerciseItem(1).should('have.class', 'completed')
    
    cy.clickWorkoutControl('skip')
    cy.getExerciseItem(2).should('have.class', 'completed')
    cy.getExerciseItem(3).should('have.class', 'current')
  })

  it('should handle timer countdown accuracy', () => {
    cy.clickWorkoutControl('start')
    
    cy.getTimerDisplay().should('contain', '0:03')
    
    cy.wait(1000)
    cy.getTimerDisplay().should('contain', '0:02')
    
    cy.wait(1000)
    cy.getTimerDisplay().should('contain', '0:01')
    
    cy.wait(1000)
    cy.getCurrentExercise().should('contain', 'Push-ups')
  })
})