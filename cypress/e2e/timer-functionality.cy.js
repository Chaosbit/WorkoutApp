describe('Timer Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.loadWorkoutFile('test-workout.md')
  })

  it('should have correct initial button states', () => {
    cy.get('#startBtn').should('be.enabled')
    cy.get('#pauseBtn').should('be.disabled')
    cy.get('#skipBtn').should('be.disabled')
    cy.get('#resetBtn').should('be.enabled')
  })

  it('should start the timer when Start button is clicked', () => {
    cy.get('#startBtn').click()
    
    cy.get('#startBtn').should('be.disabled')
    cy.get('#pauseBtn').should('be.enabled')
    cy.get('#skipBtn').should('be.enabled')
    
    cy.get('.exercise-item').first().should('have.class', 'current')
  })

  it('should pause and resume the timer', () => {
    // Start the timer
    cy.get('#startBtn').click()
    
    // Let timer run for a bit and verify it's counting down
    cy.wait(500)
    
    // Pause the timer
    cy.get('#pauseBtn').click()
    
    // Check button states after pause
    cy.get('#startBtn').should('be.enabled')
    cy.get('#pauseBtn').should('be.disabled')
    cy.get('#skipBtn').should('be.enabled')
    
    // Store current timer value
    cy.get('#timerDisplay').invoke('text').then((pausedTime) => {
      // Wait a bit while paused
      cy.wait(1000)
      
      // Timer should not have changed while paused
      cy.get('#timerDisplay').should('contain', pausedTime)
      
      // Resume timer
      cy.get('#startBtn').click()
      cy.get('#startBtn').should('be.disabled')
      cy.get('#pauseBtn').should('be.enabled')
    })
  })

  it('should skip to next exercise', () => {
    cy.get('#startBtn').click()
    cy.get('#skipBtn').click()
    
    cy.get('#currentExercise').should('contain', 'Push-ups')
    cy.get('#timerDisplay').should('contain', '0:02')
    cy.get('#progressText').should('contain', 'Exercise 2 of 6')
    
    cy.get('.exercise-item').first().should('have.class', 'completed')
    cy.get('.exercise-item').eq(1).should('have.class', 'current')
  })

  it('should reset the workout', () => {
    cy.get('#startBtn').click()
    cy.get('#skipBtn').click()
    cy.get('#resetBtn').click()
    
    cy.get('#currentExercise').should('contain', 'Warm-up')
    cy.get('#timerDisplay').should('contain', '0:03')
    cy.get('#progressText').should('contain', 'Exercise 1 of 6')
    
    cy.get('#startBtn').should('be.enabled')
    cy.get('#pauseBtn').should('be.disabled')
    cy.get('#skipBtn').should('be.disabled')
    
    cy.get('.exercise-item').first().should('have.class', 'current')
  })

  it('should automatically advance through exercises', () => {
    cy.get('#startBtn').click()
    
    cy.wait(3500)
    cy.get('#currentExercise').should('contain', 'Push-ups')
    cy.get('#timerDisplay').should('contain', '0:02')
    
    cy.wait(2500)
    cy.get('#currentExercise').should('contain', 'Rest')
    cy.get('#timerDisplay').should('contain', '0:01')
  })

  it('should update progress bar during exercise', () => {
    cy.get('#startBtn').click()
    
    cy.get('#progressFill').should('have.css', 'width', '0px')
    
    cy.wait(1000)
    cy.get('#progressFill').should('not.have.css', 'width', '0px')
    
    cy.wait(2500)
    cy.get('#progressFill').should('have.css', 'width').and('match', /\d+px/)
  })

  it('should complete the workout and show completion message', () => {
    cy.get('#startBtn').click()
    
    for (let i = 0; i < 6; i++) {
      cy.get('#skipBtn').click()
      cy.wait(100)
    }
    
    cy.get('#currentExercise').should('contain', 'Workout Complete! 🎉')
    cy.get('#timerDisplay').should('contain', '0:00')
    cy.get('#progressFill').should('have.css', 'width').and('not.equal', '0px')
    
    // Should show completion message instead of alert
    cy.get('.app-message--success').should('be.visible')
    cy.get('.app-message--success').should('contain', 'Workout completed! Great job! 💪')
  })

  it('should mark exercises as completed during workout progression', () => {
    cy.get('#startBtn').click()
    
    cy.get('#skipBtn').click()
    cy.get('.exercise-item').first().should('have.class', 'completed')
    
    cy.get('#skipBtn').click()
    cy.get('.exercise-item').eq(1).should('have.class', 'completed')
    
    cy.get('#skipBtn').click()
    cy.get('.exercise-item').eq(2).should('have.class', 'completed')
    cy.get('.exercise-item').eq(3).should('have.class', 'current')
  })

  it('should handle timer countdown accuracy', () => {
    cy.get('#startBtn').click()
    
    cy.get('#timerDisplay').should('contain', '0:03')
    
    cy.wait(1000)
    cy.get('#timerDisplay').should('contain', '0:02')
    
    cy.wait(1000)
    cy.get('#timerDisplay').should('contain', '0:01')
    
    cy.wait(1000)
    cy.get('#currentExercise').should('contain', 'Push-ups')
  })
})