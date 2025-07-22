describe('Workout Library', () => {
  beforeEach(() => {
    cy.visit('/')
    // Clear localStorage before each test
    cy.clearLocalStorage()
  })

  it('should initially hide workout library when no workouts are saved', () => {
    cy.get('#workoutLibrary').should('not.be.visible')
    cy.get('.sample-format').should('be.visible')
  })

  it('should show workout library after loading first workout', () => {
    cy.loadWorkoutFile('test-workout.md')
    
    cy.get('#workoutLibrary').should('be.visible')
    cy.get('.workout-library h3').should('contain', 'Saved Workouts')
    cy.get('#workoutSelect option').should('have.length', 2) // placeholder + 1 workout
    cy.get('#workoutSelect option:selected').should('contain', 'test-workout')
  })

  it('should store multiple workouts and allow switching between them', () => {
    // Load first workout
    cy.loadWorkoutFile('test-workout.md')
    cy.get('#workoutTitle').should('contain', 'Test Workout')
    
    // Load second workout
    const secondWorkout = `# Cardio Workout

## Running - 10:00
## Stretching - 5:00`

    cy.get('#workoutFile').then(input => {
      const blob = new Blob([secondWorkout], { type: 'text/markdown' })
      const file = new File([blob], 'cardio-workout.md', { type: 'text/markdown' })
      
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input[0].files = dataTransfer.files
      
      const changeEvent = new Event('change', { bubbles: true })
      input[0].dispatchEvent(changeEvent)
    })

    cy.get('#workoutTitle').should('contain', 'Cardio Workout')
    cy.get('#workoutSelect option').should('have.length', 3) // placeholder + 2 workouts
    
    // Switch back to first workout
    cy.get('#workoutSelect').select('test-workout')
    cy.get('#workoutTitle').should('contain', 'Test Workout')
    cy.get('.exercise-item').should('contain', 'Warm-up')
    
    // Switch to second workout
    cy.get('#workoutSelect').select('cardio-workout')
    cy.get('#workoutTitle').should('contain', 'Cardio Workout')
    cy.get('.exercise-item').should('contain', 'Running')
  })

  it('should persist workouts in localStorage across page reloads', () => {
    // Load workout
    cy.loadWorkoutFile('test-workout.md')
    cy.get('#workoutTitle').should('contain', 'Test Workout')
    
    // Reload page
    cy.reload()
    
    // Library should still be visible with saved workout
    cy.get('#workoutLibrary').should('be.visible')
    cy.get('#workoutSelect option').should('have.length', 2) // placeholder + 1 workout
    cy.get('#workoutSelect option').contains('test-workout').should('exist')
    
    // Should be able to select and load the workout
    cy.get('#workoutSelect').select('test-workout')
    cy.get('#workoutTitle').should('contain', 'Test Workout')
    cy.get('#workoutDisplay').should('be.visible')
  })

  it('should allow deleting saved workouts', () => {
    // Load workout
    cy.loadWorkoutFile('test-workout.md')
    cy.get('#workoutTitle').should('contain', 'Test Workout')
    
    // Delete button should be enabled
    cy.get('#deleteWorkoutBtn').should('not.be.disabled')
    
    // Delete the workout
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true)
    })
    
    cy.get('#deleteWorkoutBtn').click()
    
    // Library should be hidden again
    cy.get('#workoutLibrary').should('not.be.visible')
    cy.get('#workoutDisplay').should('not.be.visible')
    cy.get('.sample-format').should('be.visible')
  })

  it('should update existing workout when loading file with same name', () => {
    // Load first version of workout
    const originalWorkout = `# Test Workout

## Exercise A - 0:30`

    cy.get('#workoutFile').then(input => {
      const blob = new Blob([originalWorkout], { type: 'text/markdown' })
      const file = new File([blob], 'test-workout.md', { type: 'text/markdown' })
      
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input[0].files = dataTransfer.files
      
      const changeEvent = new Event('change', { bubbles: true })
      input[0].dispatchEvent(changeEvent)
    })

    cy.get('.exercise-item').should('have.length', 1)
    cy.get('.exercise-item').should('contain', 'Exercise A')
    
    // Load updated version with same filename
    const updatedWorkout = `# Test Workout

## Exercise A - 0:30
## Exercise B - 0:45`

    cy.get('#workoutFile').then(input => {
      const blob = new Blob([updatedWorkout], { type: 'text/markdown' })
      const file = new File([blob], 'test-workout.md', { type: 'text/markdown' })
      
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input[0].files = dataTransfer.files
      
      const changeEvent = new Event('change', { bubbles: true })
      input[0].dispatchEvent(changeEvent)
    })

    // Should show updated content, not duplicate
    cy.get('#workoutSelect option').should('have.length', 2) // still just placeholder + 1 workout
    cy.get('.exercise-item').should('have.length', 2)
    cy.get('.exercise-item').should('contain', 'Exercise A')
    cy.get('.exercise-item').should('contain', 'Exercise B')
  })

  it('should handle workout selection UI states correctly', () => {
    // Initially delete button should be disabled
    cy.loadWorkoutFile('test-workout.md')
    cy.get('#deleteWorkoutBtn').should('not.be.disabled')
    
    // Deselecting workout should disable delete button
    cy.get('#workoutSelect').select('')
    cy.get('#deleteWorkoutBtn').should('be.disabled')
    cy.get('#workoutDisplay').should('be.visible') // still shows last workout
    
    // Reselecting should enable delete button
    cy.get('#workoutSelect').select('test-workout')
    cy.get('#deleteWorkoutBtn').should('not.be.disabled')
  })

  it('should clear file input after loading workout', () => {
    cy.get('#workoutFile').should('have.value', '')
    
    cy.loadWorkoutFile('test-workout.md')
    
    // File input should be cleared after loading
    cy.get('#workoutFile').should('have.value', '')
  })

  it('should show proper styling and layout for workout library', () => {
    cy.loadWorkoutFile('test-workout.md')
    
    // Check library styling
    cy.get('.workout-library').should('have.css', 'background-color', 'rgb(248, 249, 250)')
    cy.get('.workout-library').should('be.visible')
    
    // Check selector styling
    cy.get('#workoutSelect').should('have.css', 'border-width', '2px')
    cy.get('#workoutSelect').should('have.css', 'background-color', 'rgb(255, 255, 255)')
    
    // Check responsive behavior
    cy.viewport('iphone-x')
    cy.get('.workout-selector').should('be.visible')
    cy.get('#workoutSelect').should('be.visible')
    cy.get('#deleteWorkoutBtn').should('be.visible')
  })

  it('should maintain workout state during library operations', () => {
    cy.loadWorkoutFile('test-workout.md')
    
    // Start workout
    cy.get('#startBtn').click()
    cy.get('#startBtn').should('be.disabled')
    cy.get('#pauseBtn').should('not.be.disabled')
    
    // Switch to a different workout (if we had one)
    // For now, just verify that library operations don't break timer state
    cy.get('#workoutSelect').should('have.value').and('not.be.empty')
    cy.get('#deleteWorkoutBtn').should('not.be.disabled')
    
    // Timer should still be running
    cy.get('#pauseBtn').should('not.be.disabled')
  })
})