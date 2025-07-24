describe('Sets Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Sets Parsing and Display', () => {
    it('should parse sets syntax correctly and display all sets individually', () => {
      cy.loadWorkoutFile('sets-workout.md')
      
      cy.get('#workoutDisplay').should('be.visible')
      cy.get('#workoutTitle').should('contain', 'Sets Feature Test Workout')
      
      // Should expand 3 sets x 2 exercises + individual exercises
      // Warm-up (1) + Push-ups Set 1 (2) + Rest (3) + Push-ups Set 2 (4) + Rest (5) + Push-ups Set 3 (6) + 
      // Squats Set 1 (7) + Rest (8) + Squats Set 2 (9) + Plank (10) + Rest (11) + Cool Down (12)
      cy.get('.exercise-item').should('have.length', 12)
      
      // Check push-ups sets are properly labeled
      cy.get('.exercise-item').eq(1).should('contain', 'Push-ups (Set 1/3)').and('contain', '00:02')
      cy.get('.exercise-item').eq(3).should('contain', 'Push-ups (Set 2/3)').and('contain', '00:02')
      cy.get('.exercise-item').eq(5).should('contain', 'Push-ups (Set 3/3)').and('contain', '00:02')
      
      // Check squats sets are properly labeled
      cy.get('.exercise-item').eq(6).should('contain', 'Squats (Set 1/2)').and('contain', '00:03')
      cy.get('.exercise-item').eq(8).should('contain', 'Squats (Set 2/2)').and('contain', '00:03')
      
      // Check rest periods between sets
      cy.get('.exercise-item').eq(2).should('contain', 'Rest between sets').and('contain', '00:01')
      cy.get('.exercise-item').eq(4).should('contain', 'Rest between sets').and('contain', '00:01')
      cy.get('.exercise-item').eq(7).should('contain', 'Rest between sets').and('contain', '00:01')
    })

    it('should start with first exercise and show correct progress', () => {
      cy.loadWorkoutFile('sets-workout.md')
      
      cy.get('#currentExercise').should('contain', 'Warm-up')
      cy.get('#timerDisplay').should('contain', '00:03')
      cy.get('#progressText').should('contain', 'Exercise 1 of 12')
    })
  })

  describe('Sets Timer Functionality', () => {
    beforeEach(() => {
      cy.loadWorkoutFile('sets-workout.md')
    })

    it('should progress through sets correctly', () => {
      cy.get('#startBtn').click()
      
      // Skip warm-up to get to first set
      cy.get('#skipBtn').click()
      cy.get('#currentExercise').should('contain', 'Push-ups (Set 1/3)')
      cy.get('#timerDisplay').should('contain', '00:02')
      cy.get('#progressText').should('contain', 'Exercise 2 of 12')
      
      // Skip to rest between sets
      cy.get('#skipBtn').click()
      cy.get('#currentExercise').should('contain', 'Rest between sets')
      cy.get('#timerDisplay').should('contain', '00:01')
      cy.get('#progressText').should('contain', 'Exercise 3 of 12')
      
      // Skip to second set
      cy.get('#skipBtn').click()
      cy.get('#currentExercise').should('contain', 'Push-ups (Set 2/3)')
      cy.get('#timerDisplay').should('contain', '00:02')
      cy.get('#progressText').should('contain', 'Exercise 4 of 12')
    })

    it('should handle automatic progression through sets', () => {
      cy.get('#startBtn').click()
      
      // Skip to first push-up set
      cy.get('#skipBtn').click()
      cy.get('#currentExercise').should('contain', 'Push-ups (Set 1/3)')
      
      // Wait for exercise to complete and auto-advance to rest
      cy.wait(2500)
      cy.get('#currentExercise').should('contain', 'Rest between sets')
      cy.get('#timerDisplay').should('contain', '00:01')
      
      // Wait for rest to complete and auto-advance to next set
      cy.wait(1500)
      cy.get('#currentExercise').should('contain', 'Push-ups (Set 2/3)')
      cy.get('#timerDisplay').should('contain', '00:02')
    })

    it('should mark sets as completed correctly', () => {
      cy.get('#startBtn').click()
      
      // Skip warm-up
      cy.get('#skipBtn').click()
      cy.get('.exercise-item').first().should('have.class', 'completed')
      
      // Skip first set
      cy.get('#skipBtn').click()
      cy.get('.exercise-item').eq(1).should('have.class', 'completed')
      cy.get('.exercise-item').eq(2).should('have.class', 'current') // rest
      
      // Skip rest
      cy.get('#skipBtn').click()
      cy.get('.exercise-item').eq(2).should('have.class', 'completed')
      cy.get('.exercise-item').eq(3).should('have.class', 'current') // second set
    })

    it('should reset workout correctly with sets', () => {
      cy.get('#startBtn').click()
      
      // Progress through several exercises
      cy.get('#skipBtn').click() // warm-up
      cy.get('#skipBtn').click() // first set
      cy.get('#skipBtn').click() // rest
      
      cy.get('#currentExercise').should('contain', 'Push-ups (Set 2/3)')
      
      // Reset workout
      cy.get('#resetBtn').click()
      
      cy.get('#currentExercise').should('contain', 'Warm-up')
      cy.get('#timerDisplay').should('contain', '00:03')
      cy.get('#progressText').should('contain', 'Exercise 1 of 12')
      
      // All exercises should be reset to initial state
      cy.get('.exercise-item').first().should('have.class', 'current')
      cy.get('.exercise-item').eq(1).should('not.have.class', 'completed')
      cy.get('.exercise-item').eq(2).should('not.have.class', 'completed')
    })
  })

  describe('Sets Edge Cases', () => {
    it('should handle single sets correctly', () => {
      const singleSetWorkout = `# Single Set Test

## Exercise - 1 set x 0:05 / 0:02

## Regular Exercise - 0:03`

      cy.get('#workoutFile').then(input => {
        const blob = new Blob([singleSetWorkout], { type: 'text/markdown' })
        const file = new File([blob], 'single-set.md', { type: 'text/markdown' })
        
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input[0].files = dataTransfer.files
        
        const changeEvent = new Event('change', { bubbles: true })
        input[0].dispatchEvent(changeEvent)
      })

      cy.get('#workoutDisplay').should('be.visible')
      cy.get('.exercise-item').should('have.length', 2) // Single set + regular exercise, no rest after single set
      cy.get('.exercise-item').first().should('contain', 'Exercise (Set 1/1)').and('contain', '00:05')
      cy.get('.exercise-item').eq(1).should('contain', 'Regular Exercise').and('contain', '00:03')
    })

    it('should handle large numbers of sets', () => {
      const largeSetsWorkout = `# Large Sets Test

## Endurance - 10 sets x 0:01 / 0:01`

      cy.get('#workoutFile').then(input => {
        const blob = new Blob([largeSetsWorkout], { type: 'text/markdown' })
        const file = new File([blob], 'large-sets.md', { type: 'text/markdown' })
        
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input[0].files = dataTransfer.files
        
        const changeEvent = new Event('change', { bubbles: true })
        input[0].dispatchEvent(changeEvent)
      })

      cy.get('#workoutDisplay').should('be.visible')
      // 10 sets + 9 rest periods = 19 exercises
      cy.get('.exercise-item').should('have.length', 19)
      cy.get('.exercise-item').first().should('contain', 'Endurance (Set 1/10)')
      cy.get('.exercise-item').eq(18).should('contain', 'Endurance (Set 10/10)')
    })

    it('should handle mixed sets and regular exercises', () => {
      const mixedWorkout = `# Mixed Workout Test

## Regular Start - 0:02

## Sets Exercise - 2 sets x 0:01 / 0:01

## Regular End - 0:02`

      cy.get('#workoutFile').then(input => {
        const blob = new Blob([mixedWorkout], { type: 'text/markdown' })
        const file = new File([blob], 'mixed.md', { type: 'text/markdown' })
        
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input[0].files = dataTransfer.files
        
        const changeEvent = new Event('change', { bubbles: true })
        input[0].dispatchEvent(changeEvent)
      })

      cy.get('#workoutDisplay').should('be.visible')
      // Regular (1) + Set 1 (2) + Rest (3) + Set 2 (4) + Regular (5) = 5 exercises
      cy.get('.exercise-item').should('have.length', 5)
      cy.get('.exercise-item').eq(0).should('contain', 'Regular Start').and('not.contain', 'Set')
      cy.get('.exercise-item').eq(1).should('contain', 'Sets Exercise (Set 1/2)')
      cy.get('.exercise-item').eq(2).should('contain', 'Rest between sets')
      cy.get('.exercise-item').eq(3).should('contain', 'Sets Exercise (Set 2/2)')
      cy.get('.exercise-item').eq(4).should('contain', 'Regular End').and('not.contain', 'Set')
    })

    it('should handle different time formats in sets', () => {
      const timeFormatWorkout = `# Time Format Sets Test

## Long Exercise - 3 sets x 1:30 / 0:45`

      cy.get('#workoutFile').then(input => {
        const blob = new Blob([timeFormatWorkout], { type: 'text/markdown' })
        const file = new File([blob], 'time-format.md', { type: 'text/markdown' })
        
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input[0].files = dataTransfer.files
        
        const changeEvent = new Event('change', { bubbles: true })
        input[0].dispatchEvent(changeEvent)
      })

      cy.get('#workoutDisplay').should('be.visible')
      cy.get('.exercise-item').should('have.length', 5) // 3 sets + 2 rest periods
      cy.get('.exercise-item').eq(0).should('contain', 'Long Exercise (Set 1/3)').and('contain', '01:30')
      cy.get('.exercise-item').eq(1).should('contain', 'Rest between sets').and('contain', '00:45')
      cy.get('.exercise-item').eq(2).should('contain', 'Long Exercise (Set 2/3)').and('contain', '01:30')
    })
  })

  describe('Backward Compatibility', () => {
    it('should still work with regular workout format', () => {
      cy.loadWorkoutFile('test-workout.md')
      
      cy.get('#workoutDisplay').should('be.visible')
      cy.get('#workoutTitle').should('contain', 'Test Workout')
      cy.get('.exercise-item').should('have.length', 6)
      
      // Should not have any sets syntax
      cy.get('.exercise-item').should('not.contain', '(Set')
      cy.get('.exercise-item').first().should('contain', 'Warm-up').and('contain', '00:03')
      cy.get('.exercise-item').eq(1).should('contain', 'Push-ups').and('contain', '00:02')
    })

    it('should allow mixing regular and sets syntax in same workout', () => {
      const mixedSyntaxWorkout = `# Mixed Syntax Test

## Warm-up - 0:02

## Sets Exercise - 2 sets x 0:01 / 0:01

## Regular Exercise - 0:02
Rest - 0:01

## Final - 0:02`

      cy.get('#workoutFile').then(input => {
        const blob = new Blob([mixedSyntaxWorkout], { type: 'text/markdown' })
        const file = new File([blob], 'mixed-syntax.md', { type: 'text/markdown' })
        
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input[0].files = dataTransfer.files
        
        const changeEvent = new Event('change', { bubbles: true })
        input[0].dispatchEvent(changeEvent)
      })

      cy.get('#workoutDisplay').should('be.visible')
      // Warm-up (1) + Set 1 (2) + Rest between sets (3) + Set 2 (4) + Regular (5) + Rest (6) + Final (7)
      cy.get('.exercise-item').should('have.length', 7)
      
      cy.get('.exercise-item').eq(0).should('contain', 'Warm-up').and('not.contain', 'Set')
      cy.get('.exercise-item').eq(1).should('contain', 'Sets Exercise (Set 1/2)')
      cy.get('.exercise-item').eq(2).should('contain', 'Rest between sets')
      cy.get('.exercise-item').eq(3).should('contain', 'Sets Exercise (Set 2/2)')
      cy.get('.exercise-item').eq(4).should('contain', 'Regular Exercise').and('not.contain', 'Set')
      cy.get('.exercise-item').eq(5).should('contain', 'Rest').and('not.contain', 'between sets')
      cy.get('.exercise-item').eq(6).should('contain', 'Final').and('not.contain', 'Set')
    })
  })

  describe('Sets UI Behavior', () => {
    beforeEach(() => {
      cy.loadWorkoutFile('sets-workout.md')
    })

    it('should show correct current exercise highlighting for sets', () => {
      cy.get('#startBtn').click()
      
      // First exercise should be highlighted
      cy.get('.exercise-item').first().should('have.class', 'current')
      
      // Skip to first set
      cy.get('#skipBtn').click()
      cy.get('.exercise-item').first().should('have.class', 'completed')
      cy.get('.exercise-item').eq(1).should('have.class', 'current')
      cy.get('#currentExercise').should('contain', 'Push-ups (Set 1/3)')
    })

    it('should show progress bar working with sets', () => {
      cy.get('#startBtn').click()
      
      // Skip to a set exercise
      cy.get('#skipBtn').click()
      cy.get('#currentExercise').should('contain', 'Push-ups (Set 1/3)')
      
      // Progress bar should start at 0
      cy.get('#progressFill').should('have.css', 'width', '0px')
      
      // Wait for some progress
      cy.wait(1000)
      cy.get('#progressFill').should('not.have.css', 'width', '0px')
    })

    it('should complete workout correctly with sets', () => {
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('windowAlert')
      })
      
      cy.get('#startBtn').click()
      
      // Skip through all exercises
      for (let i = 0; i < 12; i++) {
        cy.get('#skipBtn').click()
        cy.wait(100)
      }
      
      cy.get('#currentExercise').should('contain', 'Workout Complete! 🎉')
      cy.get('#timerDisplay').should('contain', '00:00')
      cy.get('@windowAlert').should('have.been.calledWith', 'Workout completed! Great job! 💪')
    })
  })
})