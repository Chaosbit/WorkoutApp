describe('Rep-Based Exercises', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Pure Rep-Based Workout', () => {
    beforeEach(() => {
      cy.loadWorkoutFile('rep-based-workout.md')
    })

    it('should load and parse rep-based exercises correctly', () => {
      cy.get('#workoutDisplay').should('be.visible')
      cy.get('#workoutTitle').should('contain', 'Rep-Based Strength Workout')
      cy.get('#currentExercise').should('contain', 'Push-ups')
      
      // Should show reps display instead of timer
      cy.get('#repsDisplay').should('be.visible')
      cy.get('#repsCount').should('contain', '15')
      cy.get('#timerDisplay').should('not.be.visible')
      
      // Should show completion button for rep exercises
      cy.get('#repCompletion').should('be.visible')
      cy.get('#completeRepBtn').should('be.visible').and('contain', '✓ Complete Exercise')
    })

    it('should display all rep-based exercises in workout list with rep counts', () => {
      cy.get('.exercise-item').should('have.length', 4)
      
      // Check rep-based exercise display format
      cy.get('.exercise-item').eq(0).should('contain', 'Push-ups').and('contain', '15 reps')
      cy.get('.exercise-item').eq(1).should('contain', 'Squats').and('contain', '20 reps')
      cy.get('.exercise-item').eq(2).should('contain', 'Burpees').and('contain', '10 reps')
      cy.get('.exercise-item').eq(3).should('contain', 'Mountain Climbers').and('contain', '25 reps')
      
      // Check for reps-based CSS class
      cy.get('.exercise-item .reps-based').should('have.length', 4)
    })

    it('should have correct initial button states for rep exercises', () => {
      cy.get('#startBtn').should('be.enabled')
      cy.get('#pauseBtn').should('be.disabled')
      cy.get('#skipBtn').should('be.disabled')
      cy.get('#resetBtn').should('be.enabled')
      cy.get('#completeRepBtn').should('be.visible').and('be.enabled')
    })

    it('should start workout and enable completion for rep exercises', () => {
      cy.get('#startBtn').click()
      
      // Button states should change
      cy.get('#startBtn').should('be.disabled')
      cy.get('#pauseBtn').should('be.disabled') // Pause not applicable for rep exercises
      cy.get('#skipBtn').should('be.enabled')
      cy.get('#completeRepBtn').should('be.enabled')
      
      // Current exercise should be highlighted
      cy.get('.exercise-item').first().should('have.class', 'current')
    })

    it('should complete rep exercise manually using completion button', () => {
      cy.get('#startBtn').click()
      cy.get('#completeRepBtn').click()
      
      // Should advance to next exercise
      cy.get('#currentExercise').should('contain', 'Squats')
      cy.get('#repsCount').should('contain', '20')
      cy.get('#progressText').should('contain', 'Exercise 2 of 4')
      
      // Previous exercise should be marked as completed
      cy.get('.exercise-item').first().should('have.class', 'completed')
      cy.get('.exercise-item').eq(1).should('have.class', 'current')
    })

    it('should allow skipping rep exercises', () => {
      cy.get('#startBtn').click()
      cy.get('#skipBtn').click()
      
      cy.get('#currentExercise').should('contain', 'Squats')
      cy.get('#repsCount').should('contain', '20')
      cy.get('#progressText').should('contain', 'Exercise 2 of 4')
      
      cy.get('.exercise-item').first().should('have.class', 'completed')
      cy.get('.exercise-item').eq(1).should('have.class', 'current')
    })

    it('should progress through all rep exercises sequentially', () => {
      cy.get('#startBtn').click()
      
      // Complete Push-ups
      cy.get('#completeRepBtn').click()
      cy.get('#currentExercise').should('contain', 'Squats')
      cy.get('#repsCount').should('contain', '20')
      
      // Complete Squats
      cy.get('#completeRepBtn').click()
      cy.get('#currentExercise').should('contain', 'Burpees')
      cy.get('#repsCount').should('contain', '10')
      
      // Complete Burpees
      cy.get('#completeRepBtn').click()
      cy.get('#currentExercise').should('contain', 'Mountain Climbers')
      cy.get('#repsCount').should('contain', '25')
      
      // Complete final exercise
      cy.get('#completeRepBtn').click()
      cy.get('#currentExercise').should('contain', 'Workout Complete! 🎉')
    })

    it('should complete rep-based workout and show completion message', () => {
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('windowAlert')
      })
      
      cy.get('#startBtn').click()
      
      // Complete all exercises
      for (let i = 0; i < 4; i++) {
        cy.get('#completeRepBtn').click()
        cy.wait(100)
      }
      
      cy.get('#currentExercise').should('contain', 'Workout Complete! 🎉')
      cy.get('@windowAlert').should('have.been.calledWith', 'Workout completed! Great job! 💪')
    })

    it('should reset rep-based workout correctly', () => {
      cy.get('#startBtn').click()
      cy.get('#completeRepBtn').click() // Complete first exercise
      cy.get('#resetBtn').click()
      
      // Should return to first exercise
      cy.get('#currentExercise').should('contain', 'Push-ups')
      cy.get('#repsCount').should('contain', '15')
      cy.get('#progressText').should('contain', 'Exercise 1 of 4')
      
      // First exercise should be current again
      cy.get('.exercise-item').first().should('have.class', 'current')
      cy.get('.exercise-item').first().should('not.have.class', 'completed')
      
      // Button states should reset
      cy.get('#startBtn').should('be.enabled')
      cy.get('#pauseBtn').should('be.disabled')
      cy.get('#skipBtn').should('be.disabled')
    })
  })

  describe('Mixed Timer and Rep Workout', () => {
    beforeEach(() => {
      cy.loadWorkoutFile('mixed-exercise-workout.md')
    })

    it('should load mixed workout with both timer and rep exercises', () => {
      cy.get('#workoutDisplay').should('be.visible')
      cy.get('#workoutTitle').should('contain', 'Mixed Timer and Rep Workout')
      
      // Should start with timer exercise (Warm-up)
      cy.get('#currentExercise').should('contain', 'Warm-up')
      cy.get('#timerDisplay').should('be.visible').and('contain', '00:03')
      cy.get('#repsDisplay').should('not.be.visible')
      cy.get('#repCompletion').should('not.be.visible')
    })

    it('should display mixed exercise types in workout list correctly', () => {
      cy.get('.exercise-item').should('have.length', 7)
      
      // Timer-based exercises
      cy.get('.exercise-item').eq(0).should('contain', 'Warm-up').and('contain', '00:03')
      cy.get('.exercise-item').eq(2).should('contain', 'Rest').and('contain', '00:02')
      cy.get('.exercise-item').eq(3).should('contain', 'Jumping Jacks').and('contain', '00:04')
      cy.get('.exercise-item').eq(6).should('contain', 'Cool Down').and('contain', '00:03')
      
      // Rep-based exercises
      cy.get('.exercise-item').eq(1).should('contain', 'Push-ups').and('contain', '15 reps')
      cy.get('.exercise-item').eq(4).should('contain', 'Squats').and('contain', '20 reps')
      
      // Check for correct CSS classes
      cy.get('.exercise-item').eq(1).find('.reps-based').should('exist')
      cy.get('.exercise-item').eq(4).find('.reps-based').should('exist')
    })

    it('should transition from timer to rep exercise correctly', () => {
      cy.get('#startBtn').click()
      
      // Start with timer exercise
      cy.get('#currentExercise').should('contain', 'Warm-up')
      cy.get('#timerDisplay').should('be.visible')
      cy.get('#repsDisplay').should('not.be.visible')
      cy.get('#repCompletion').should('not.be.visible')
      
      // Skip to rep exercise
      cy.get('#skipBtn').click()
      
      // Should switch to rep exercise UI
      cy.get('#currentExercise').should('contain', 'Push-ups')
      cy.get('#timerDisplay').should('not.be.visible')
      cy.get('#repsDisplay').should('be.visible')
      cy.get('#repsCount').should('contain', '15')
      cy.get('#repCompletion').should('be.visible')
      cy.get('#completeRepBtn').should('be.visible')
    })

    it('should transition from rep to timer exercise correctly', () => {
      cy.get('#startBtn').click()
      cy.get('#skipBtn').click() // Skip to Push-ups (rep)
      
      // Complete rep exercise
      cy.get('#completeRepBtn').click()
      
      // Should switch to timer exercise (Rest)
      cy.get('#currentExercise').should('contain', 'Rest')
      cy.get('#timerDisplay').should('be.visible').and('contain', '00:02')
      cy.get('#repsDisplay').should('not.be.visible')
      cy.get('#repCompletion').should('not.be.visible')
    })

    it('should handle mixed workout completion correctly', () => {
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('windowAlert')
      })
      
      cy.get('#startBtn').click()
      
      // Progress through all exercises (mix of skip and complete)
      cy.get('#skipBtn').click() // Skip Warm-up
      cy.get('#completeRepBtn').click() // Complete Push-ups
      cy.get('#skipBtn').click() // Skip Rest
      cy.get('#skipBtn').click() // Skip Jumping Jacks
      cy.get('#completeRepBtn').click() // Complete Squats
      cy.get('#skipBtn').click() // Skip Rest
      cy.get('#skipBtn').click() // Skip Cool Down
      
      cy.get('#currentExercise').should('contain', 'Workout Complete! 🎉')
      cy.get('@windowAlert').should('have.been.calledWith', 'Workout completed! Great job! 💪')
    })

    it('should maintain correct button states during mixed workout', () => {
      cy.get('#startBtn').click()
      
      // Timer exercise - pause should be available
      cy.get('#pauseBtn').should('be.enabled')
      cy.get('#completeRepBtn').should('not.be.visible')
      
      cy.get('#skipBtn').click() // Go to rep exercise
      
      // Rep exercise - pause should be disabled, completion should be available
      cy.get('#pauseBtn').should('be.disabled')
      cy.get('#completeRepBtn').should('be.visible').and('be.enabled')
      
      cy.get('#completeRepBtn').click() // Go to rest (timer)
      
      // Back to timer exercise - pause should be enabled again
      cy.get('#pauseBtn').should('be.enabled')
      cy.get('#completeRepBtn').should('not.be.visible')
    })
  })

  describe('Rep Exercise Edge Cases', () => {
    it('should parse different rep formats correctly', () => {
      const workoutContent = `# Rep Format Test

## Single Rep - 1 rep
Single repetition exercise.

## Multiple Reps - 50 reps  
High repetition exercise.

## Rep Singular - 1 rep
Another single rep.`

      cy.get('#workoutFile').then(input => {
        const blob = new Blob([workoutContent], { type: 'text/markdown' })
        const file = new File([blob], 'rep-format-test.md', { type: 'text/markdown' })
        
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input[0].files = dataTransfer.files
        
        const changeEvent = new Event('change', { bubbles: true })
        input[0].dispatchEvent(changeEvent)
      })

      cy.get('#workoutDisplay').should('be.visible')
      
      // Check rep parsing
      cy.get('.exercise-item').should('have.length', 3)
      cy.get('.exercise-item').eq(0).should('contain', '1 reps')
      cy.get('.exercise-item').eq(1).should('contain', '50 reps')
      cy.get('.exercise-item').eq(2).should('contain', '1 reps')
    })

    it('should prevent double completion of rep exercises', () => {
      cy.loadWorkoutFile('rep-based-workout.md')
      cy.get('#startBtn').click()
      
      // Get initial exercise state
      cy.get('#currentExercise').should('contain', 'Push-ups')
      cy.get('#progressText').should('contain', 'Exercise 1 of 4')
      
      // Click completion button multiple times rapidly
      cy.get('#completeRepBtn').click()
      cy.get('#completeRepBtn').click()
      cy.get('#completeRepBtn').click()
      
      // Should advance to second exercise (Squats)
      // The key is that we should not advance beyond the second exercise
      cy.get('#currentExercise').should('be.visible')
      cy.get('#currentExercise').invoke('text').then((text) => {
        // We should be on Squats (exercise 2) and not further
        expect(text).to.contain('Squats')
      })
      cy.get('#progressText').should('contain', 'Exercise 2 of 4')
    })

    it('should show exercise descriptions for rep-based exercises', () => {
      cy.loadWorkoutFile('rep-based-workout.md')
      
      // Description should be available but collapsed
      cy.get('#currentDescription').should('be.visible')
      cy.get('.description-content').should('not.be.visible')
      
      // Expand description
      cy.get('.description-toggle').click()
      cy.get('#currentDescription').should('have.class', 'expanded')
      cy.get('.description-content').should('be.visible')
      cy.get('.description-content').should('contain', 'Classic bodyweight exercise')
    })
  })
})