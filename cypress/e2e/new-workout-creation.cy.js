describe('New Workout Creation', () => {
  beforeEach(() => {
    cy.visit('/')
    // Clear localStorage before each test
    cy.clearLocalStorage()
  })

  describe('New Workout Button', () => {
    it('should display the new workout button on initial load', () => {
      cy.get('#newWorkoutBtn').should('be.visible')
      cy.get('#newWorkoutBtn').should('contain', 'Create New Workout')
    })

    it('should open editor when new workout button is clicked', () => {
      // Initially editor should be hidden
      cy.get('#workoutEditor').should('not.be.visible')
      
      // Click new workout button
      cy.get('#newWorkoutBtn').click()
      
      // Editor should be visible
      cy.get('#workoutEditor').should('be.visible')
      cy.get('#workoutDisplay').should('not.be.visible')
    })

    it('should populate editor with default template when creating new workout', () => {
      cy.get('#newWorkoutBtn').click()
      
      // Name input should be empty and focused
      cy.get('#workoutNameInput').should('have.value', '')
      cy.get('#workoutNameInput').should('be.focused')
      
      // Markdown editor should have default template
      cy.get('#workoutMarkdownEditor').invoke('val').should('include', '# New Workout')
      cy.get('#workoutMarkdownEditor').invoke('val').should('include', '## Warm-up - 5:00')
      cy.get('#workoutMarkdownEditor').invoke('val').should('include', '## Exercise 1 - 0:45')
      cy.get('#workoutMarkdownEditor').invoke('val').should('include', '## Exercise 2 - 1:00')
    })
  })

  describe('New Workout Creation Flow', () => {
    it('should successfully create a new workout', () => {
      cy.get('#newWorkoutBtn').click()
      
      // Fill in workout name
      cy.get('#workoutNameInput').type('My Test Workout')
      
      // Modify the template content
      const customWorkout = `# My Test Workout

## Jumping Jacks - 2:00
Get your heart rate up with some cardio.

## Push-ups - 1:30
Classic upper body exercise.

Rest - 0:30`

      cy.get('#workoutMarkdownEditor').clear().type(customWorkout, { parseSpecialCharSequences: false })
      
      // Stub alert for success message
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub')
      })
      
      // Save the new workout
      cy.get('#saveWorkoutBtn').click()
      
      // Should show success message
      cy.get('@alertStub').should('have.been.calledWith', 'New workout created successfully!')
      
      // Editor should be hidden, workout display should be visible
      cy.get('#workoutEditor').should('not.be.visible')
      cy.get('#workoutDisplay').should('be.visible')
      
      // Workout library should now be visible
      cy.get('#workoutLibrary').should('be.visible')
      
      // New workout should be selected in dropdown
      cy.get('#workoutSelect option:selected').should('contain', 'My Test Workout')
      
      // Workout should be displayed
      cy.get('#workoutTitle').should('contain', 'My Test Workout')
      cy.get('.exercise-item').should('contain', 'Jumping Jacks')
      cy.get('.exercise-item').should('contain', 'Push-ups')
      cy.get('.exercise-item').should('have.length', 3) // 2 exercises + 1 rest
    })

    it('should persist new workout in localStorage', () => {
      cy.get('#newWorkoutBtn').click()
      
      // Create a workout
      cy.get('#workoutNameInput').type('Persistent Workout')
      
      cy.window().then((win) => {
        cy.stub(win, 'alert')
      })
      
      cy.get('#saveWorkoutBtn').click()
      
      // Reload page
      cy.reload()
      
      // Workout should still be there
      cy.get('#workoutLibrary').should('be.visible')
      cy.get('#workoutSelect option').should('contain', 'Persistent Workout')
      
      // Should be able to select and use it
      cy.get('#workoutSelect').select('Persistent Workout')
      cy.get('#workoutTitle').should('contain', 'New Workout')
    })

    it('should handle multiple new workouts correctly', () => {
      // Create first workout
      cy.get('#newWorkoutBtn').click()
      cy.get('#workoutNameInput').type('First Workout')
      
      cy.window().then((win) => {
        cy.stub(win, 'alert')
      })
      
      cy.get('#saveWorkoutBtn').click()
      
      // Create second workout
      cy.get('#newWorkoutBtn').click()
      cy.get('#workoutNameInput').type('Second Workout')
      cy.get('#saveWorkoutBtn').click()
      
      // Should have both workouts in library
      cy.get('#workoutSelect option').should('have.length', 3) // placeholder + 2 workouts
      cy.get('#workoutSelect option').should('contain', 'First Workout')
      cy.get('#workoutSelect option').should('contain', 'Second Workout')
      
      // Second workout should be selected
      cy.get('#workoutSelect option:selected').should('contain', 'Second Workout')
    })
  })

  describe('New Workout Validation', () => {
    beforeEach(() => {
      cy.get('#newWorkoutBtn').click()
    })

    it('should prevent saving with empty workout name', () => {
      // Leave name empty, try to save
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub')
      })
      
      cy.get('#saveWorkoutBtn').click()
      
      // Should show validation error
      cy.get('@alertStub').should('have.been.calledWith', 'Please provide both a workout name and content.')
      
      // Editor should still be visible
      cy.get('#workoutEditor').should('be.visible')
    })

    it('should prevent saving with empty workout content', () => {
      cy.get('#workoutNameInput').type('Test Workout')
      cy.get('#workoutMarkdownEditor').clear()
      
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub')
      })
      
      cy.get('#saveWorkoutBtn').click()
      
      // Should show validation error
      cy.get('@alertStub').should('have.been.calledWith', 'Please provide both a workout name and content.')
      
      // Editor should still be visible
      cy.get('#workoutEditor').should('be.visible')
    })

    it('should prevent saving with invalid markdown format', () => {
      cy.get('#workoutNameInput').type('Invalid Workout')
      cy.get('#workoutMarkdownEditor').clear().type('# Title with no exercises', { parseSpecialCharSequences: false })
      
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub')
      })
      
      cy.get('#saveWorkoutBtn').click()
      
      // Should show validation error
      cy.get('@alertStub').should('have.been.calledWith', 'Please provide valid workout content with at least one exercise.')
      
      // Editor should still be visible
      cy.get('#workoutEditor').should('be.visible')
    })

    it('should handle markdown parsing errors gracefully', () => {
      cy.get('#workoutNameInput').type('Parsing Error Workout')
      cy.get('#workoutMarkdownEditor').clear().type('# Title\n\n## Exercise with no time\nNo time format', { parseSpecialCharSequences: false })
      
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub')
      })
      
      cy.get('#saveWorkoutBtn').click()
      
      // Should show parsing error
      cy.get('@alertStub').should('have.been.calledWith', 'Error parsing workout content. Please check your markdown format.')
      
      // Editor should still be visible
      cy.get('#workoutEditor').should('be.visible')
    })
  })

  describe('Cancel New Workout', () => {
    it('should cancel new workout creation and return to initial state', () => {
      cy.get('#newWorkoutBtn').click()
      
      // Make some changes
      cy.get('#workoutNameInput').type('Cancelled Workout')
      cy.get('#workoutMarkdownEditor').clear().type('# Modified content', { parseSpecialCharSequences: false })
      
      // Cancel
      cy.get('#cancelEditBtn').click()
      
      // Editor should be hidden
      cy.get('#workoutEditor').should('not.be.visible')
      
      // Should not have created any workout
      cy.get('#workoutLibrary').should('not.be.visible')
      cy.get('#workoutDisplay').should('not.be.visible')
    })

    it('should cancel new workout when there are existing workouts', () => {
      // First create a workout
      cy.get('#newWorkoutBtn').click()
      cy.get('#workoutNameInput').type('Existing Workout')
      
      cy.window().then((win) => {
        cy.stub(win, 'alert')
      })
      
      cy.get('#saveWorkoutBtn').click()
      
      // Now try to create another and cancel
      cy.get('#newWorkoutBtn').click()
      cy.get('#workoutNameInput').type('Will Be Cancelled')
      cy.get('#cancelEditBtn').click()
      
      // Should return to previous workout
      cy.get('#workoutEditor').should('not.be.visible')
      cy.get('#workoutDisplay').should('be.visible')
      cy.get('#workoutTitle').should('contain', 'New Workout')
      cy.get('#workoutSelect option:selected').should('contain', 'Existing Workout')
    })
  })

  describe('Integration with Existing Features', () => {
    it('should work alongside file upload functionality', () => {
      // Create new workout first
      cy.get('#newWorkoutBtn').click()
      cy.get('#workoutNameInput').type('Created Workout')
      
      cy.window().then((win) => {
        cy.stub(win, 'alert')
      })
      
      cy.get('#saveWorkoutBtn').click()
      
      // Now load a file workout
      cy.loadWorkoutFile('test-workout.md')
      
      // Should have both workouts in library
      cy.get('#workoutSelect option').should('have.length', 3) // placeholder + 2 workouts
      cy.get('#workoutSelect option').should('contain', 'Created Workout')
      cy.get('#workoutSelect option').should('contain', 'test-workout')
      
      // File workout should be selected
      cy.get('#workoutSelect option:selected').should('contain', 'test-workout')
    })

    it('should work with edit functionality after creation', () => {
      // Create new workout
      cy.get('#newWorkoutBtn').click()
      cy.get('#workoutNameInput').type('Editable Workout')
      
      cy.window().then((win) => {
        cy.stub(win, 'alert')
      })
      
      cy.get('#saveWorkoutBtn').click()
      
      // Edit the workout
      cy.get('#editWorkoutBtn').click()
      cy.get('#workoutNameInput').should('have.value', 'Editable Workout')
      cy.get('#workoutNameInput').clear().type('Edited Workout')
      cy.get('#saveWorkoutBtn').click()
      
      // Should show updated name
      cy.get('#workoutSelect option:selected').should('contain', 'Edited Workout')
    })

    it('should work with delete functionality after creation', () => {
      // Create new workout
      cy.get('#newWorkoutBtn').click()
      cy.get('#workoutNameInput').type('Deletable Workout')
      
      cy.window().then((win) => {
        cy.stub(win, 'alert')
      })
      
      cy.get('#saveWorkoutBtn').click()
      
      // Delete the workout
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true)
      })
      
      cy.get('#deleteWorkoutBtn').click()
      
      // Library should be hidden again
      cy.get('#workoutLibrary').should('not.be.visible')
      cy.get('#workoutDisplay').should('not.be.visible')
    })

    it('should not interfere with timer functionality', () => {
      // Create new workout
      cy.get('#newWorkoutBtn').click()
      cy.get('#workoutNameInput').type('Timer Test Workout')
      
      cy.window().then((win) => {
        cy.stub(win, 'alert')
      })
      
      cy.get('#saveWorkoutBtn').click()
      
      // Timer should work
      cy.get('#startBtn').click()
      cy.get('#startBtn').should('be.disabled')
      cy.get('#pauseBtn').should('not.be.disabled')
      
      // Pause should work
      cy.get('#pauseBtn').click()
      cy.get('#startBtn').should('not.be.disabled')
      cy.get('#pauseBtn').should('be.disabled')
    })
  })

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
    })

    it('should display new workout button properly on mobile', () => {
      cy.get('#newWorkoutBtn').should('be.visible')
      cy.get('#newWorkoutBtn').should('have.css', 'width').should('not.equal', '0px')
    })

    it('should handle new workout creation on mobile', () => {
      cy.get('#newWorkoutBtn').click()
      
      // Editor should be visible and properly sized
      cy.get('#workoutEditor').should('be.visible')
      cy.get('#workoutNameInput').should('be.visible')
      cy.get('#workoutMarkdownEditor').should('be.visible')
      
      // Should be able to type
      cy.get('#workoutNameInput').type('Mobile Workout')
      cy.get('#workoutNameInput').should('have.value', 'Mobile Workout')
      
      // Action buttons should be visible
      cy.get('#saveWorkoutBtn').should('be.visible')
      cy.get('#cancelEditBtn').should('be.visible')
    })
  })
})