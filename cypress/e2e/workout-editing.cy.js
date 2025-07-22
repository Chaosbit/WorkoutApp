describe('Workout Editing', () => {
  beforeEach(() => {
    cy.visit('/')
    // Clear localStorage before each test
    cy.clearLocalStorage()
  })

  describe('Edit Button States', () => {
    it('should have edit button disabled initially when no workout is selected', () => {
      cy.get('#editWorkoutBtn').should('be.disabled')
    })

    it('should enable edit button when a workout is loaded', () => {
      cy.loadWorkoutFile('test-workout.md')
      cy.get('#editWorkoutBtn').should('not.be.disabled')
    })

    it('should disable edit button when workout is deselected', () => {
      cy.loadWorkoutFile('test-workout.md')
      cy.get('#editWorkoutBtn').should('not.be.disabled')
      
      // Deselect workout
      cy.get('#workoutSelect').select('')
      cy.get('#editWorkoutBtn').should('be.disabled')
    })
  })

  describe('Editor UI Behavior', () => {
    beforeEach(() => {
      // Load a workout for testing
      cy.loadWorkoutFile('test-workout.md')
    })

    it('should show editor and hide workout display when edit button is clicked', () => {
      // Initially editor should be hidden
      cy.get('#workoutEditor').should('not.be.visible')
      cy.get('#workoutDisplay').should('be.visible')
      
      // Click edit button
      cy.get('#editWorkoutBtn').click()
      
      // Editor should be visible, workout display hidden
      cy.get('#workoutEditor').should('be.visible')
      cy.get('#workoutDisplay').should('not.be.visible')
    })

    it('should populate editor with current workout data', () => {
      cy.get('#editWorkoutBtn').click()
      
      // Check that name input is populated
      cy.get('#workoutNameInput').should('have.value', 'test-workout')
      
      // Check that markdown editor has content
      cy.get('#workoutMarkdownEditor').should('not.be.empty')
      cy.get('#workoutMarkdownEditor').should('contain.value', '# Test Workout')
    })

    it('should hide editor and show workout display when cancel is clicked', () => {
      cy.get('#editWorkoutBtn').click()
      cy.get('#workoutEditor').should('be.visible')
      
      // Click cancel
      cy.get('#cancelEditBtn').click()
      
      // Editor should be hidden, workout display visible
      cy.get('#workoutEditor').should('not.be.visible')
      cy.get('#workoutDisplay').should('be.visible')
    })

    it('should not save changes when cancel is clicked', () => {
      const originalTitle = 'Test Workout'
      cy.get('#workoutTitle').should('contain', originalTitle)
      
      cy.get('#editWorkoutBtn').click()
      
      // Modify content
      cy.get('#workoutNameInput').clear().type('Modified Workout')
      cy.get('#workoutMarkdownEditor').clear().type('# Modified Workout\n\n## New Exercise - 1:00')
      
      // Cancel without saving
      cy.get('#cancelEditBtn').click()
      
      // Should still show original content
      cy.get('#workoutTitle').should('contain', originalTitle)
      cy.get('#workoutSelect option:selected').should('contain', 'test-workout')
    })
  })

  describe('Saving Changes', () => {
    beforeEach(() => {
      cy.loadWorkoutFile('test-workout.md')
    })

    it('should successfully save workout name changes', () => {
      cy.get('#editWorkoutBtn').click()
      
      // Change only the name
      cy.get('#workoutNameInput').clear().type('updated-workout-name')
      
      // Stub alert for success message
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub')
      })
      
      cy.get('#saveWorkoutBtn').click()
      
      // Should show success message
      cy.get('@alertStub').should('have.been.calledWith', 'Workout updated successfully!')
      
      // Editor should be hidden
      cy.get('#workoutEditor').should('not.be.visible')
      cy.get('#workoutDisplay').should('be.visible')
      
      // Dropdown should show new name
      cy.get('#workoutSelect option:selected').should('contain', 'updated-workout-name')
    })

    it('should successfully save workout content changes', () => {
      cy.get('#editWorkoutBtn').click()
      
      // Change the content
      const newContent = `# Test Workout

## Modified Exercise - 2:00
New exercise description

## New Exercise - 1:30
Another new exercise`
      
      cy.get('#workoutMarkdownEditor').clear().type(newContent, { parseSpecialCharSequences: false })
      
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub')
      })
      
      cy.get('#saveWorkoutBtn').click()
      cy.get('@alertStub').should('have.been.calledWith', 'Workout updated successfully!')
      
      // Should display updated content
      cy.get('.exercise-item').should('contain', 'Modified Exercise')
      cy.get('.exercise-item').should('contain', 'New Exercise')
      cy.get('.exercise-item').should('have.length', 2)
    })

    it('should successfully save both name and content changes', () => {
      cy.get('#editWorkoutBtn').click()
      
      // Change both name and content
      cy.get('#workoutNameInput').clear().type('completely-new-workout')
      
      const newContent = `# Completely New Workout

## Push-ups - 0:45
## Sit-ups - 0:30
## Jumping Jacks - 1:00`
      
      cy.get('#workoutMarkdownEditor').clear().type(newContent, { parseSpecialCharSequences: false })
      
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub')
      })
      
      cy.get('#saveWorkoutBtn').click()
      cy.get('@alertStub').should('have.been.calledWith', 'Workout updated successfully!')
      
      // Check updated name in dropdown
      cy.get('#workoutSelect option:selected').should('contain', 'completely-new-workout')
      
      // Check updated content
      cy.get('#workoutTitle').should('contain', 'Completely New Workout')
      cy.get('.exercise-item').should('contain', 'Push-ups')
      cy.get('.exercise-item').should('contain', 'Sit-ups')
      cy.get('.exercise-item').should('contain', 'Jumping Jacks')
      cy.get('.exercise-item').should('have.length', 3)
    })

    it('should persist changes in localStorage', () => {
      cy.get('#editWorkoutBtn').click()
      
      // Make changes
      cy.get('#workoutNameInput').clear().type('persistent-workout')
      cy.get('#workoutMarkdownEditor').clear().type('# Persistent Workout\n\n## Test Exercise - 1:00', { parseSpecialCharSequences: false })
      
      cy.window().then((win) => {
        cy.stub(win, 'alert')
      })
      
      cy.get('#saveWorkoutBtn').click()
      
      // Reload page
      cy.reload()
      
      // Changes should persist
      cy.get('#workoutLibrary').should('be.visible')
      cy.get('#workoutSelect option').should('contain', 'persistent-workout')
      
      // Load the workout
      cy.get('#workoutSelect').select('persistent-workout')
      cy.get('#workoutTitle').should('contain', 'Persistent Workout')
      cy.get('.exercise-item').should('contain', 'Test Exercise')
    })
  })

  describe('Validation and Error Handling', () => {
    beforeEach(() => {
      cy.loadWorkoutFile('test-workout.md')
    })

    it('should prevent saving with empty workout name', () => {
      cy.get('#editWorkoutBtn').click()
      
      // Clear the name
      cy.get('#workoutNameInput').clear()
      
      // Try to save
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
      cy.get('#editWorkoutBtn').click()
      
      // Clear the content
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
      cy.get('#editWorkoutBtn').click()
      
      // Enter invalid content (no exercises)
      cy.get('#workoutMarkdownEditor').clear().type('# Just a title with no exercises', { parseSpecialCharSequences: false })
      
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
      cy.get('#editWorkoutBtn').click()
      
      // Enter content that might cause parsing issues
      cy.get('#workoutMarkdownEditor').clear().type('# Title\n\n## Exercise with no time\nNo time specified', { parseSpecialCharSequences: false })
      
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

  describe('Integration with Existing Features', () => {
    beforeEach(() => {
      cy.loadWorkoutFile('test-workout.md')
    })

    it('should not interfere with timer functionality after editing', () => {
      // Edit the workout
      cy.get('#editWorkoutBtn').click()
      cy.get('#workoutNameInput').clear().type('edited-for-timer-test')
      
      cy.window().then((win) => {
        cy.stub(win, 'alert')
      })
      
      cy.get('#saveWorkoutBtn').click()
      
      // Timer should still work
      cy.get('#startBtn').click()
      cy.get('#startBtn').should('be.disabled')
      cy.get('#pauseBtn').should('not.be.disabled')
      
      // Pause should work
      cy.get('#pauseBtn').click()
      cy.get('#startBtn').should('not.be.disabled')
      cy.get('#pauseBtn').should('be.disabled')
    })

    it('should not interfere with delete functionality', () => {
      // Load second workout to have multiple
      const secondWorkout = `# Second Workout

## Exercise A - 1:00
## Exercise B - 0:30`

      cy.get('#workoutFile').then(input => {
        const blob = new Blob([secondWorkout], { type: 'text/markdown' })
        const file = new File([blob], 'second-workout.md', { type: 'text/markdown' })
        
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        input[0].files = dataTransfer.files
        
        const changeEvent = new Event('change', { bubbles: true })
        input[0].dispatchEvent(changeEvent)
      })

      // Edit first workout
      cy.get('#workoutSelect').select('test-workout')
      cy.get('#editWorkoutBtn').click()
      cy.get('#workoutNameInput').clear().type('edited-before-delete')
      
      cy.window().then((win) => {
        cy.stub(win, 'alert')
      })
      
      cy.get('#saveWorkoutBtn').click()
      
      // Delete should still work
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true)
      })
      
      cy.get('#deleteWorkoutBtn').click()
      
      // Should only have second workout left
      cy.get('#workoutSelect option').should('have.length', 2) // placeholder + 1 workout
      cy.get('#workoutSelect option').should('contain', 'second-workout')
      cy.get('#workoutSelect option').should('not.contain', 'edited-before-delete')
    })

    it('should properly update workout selector after editing', () => {
      cy.get('#editWorkoutBtn').click()
      
      // Change name
      const newName = 'renamed-workout'
      cy.get('#workoutNameInput').clear().type(newName)
      
      cy.window().then((win) => {
        cy.stub(win, 'alert')
      })
      
      cy.get('#saveWorkoutBtn').click()
      
      // The renamed workout should be selected in dropdown
      cy.get('#workoutSelect').should('have.value', 'renamed-workout')
      cy.get('#workoutSelect option:selected').should('contain', newName)
      
      // Edit and delete buttons should still be enabled
      cy.get('#editWorkoutBtn').should('not.be.disabled')
      cy.get('#deleteWorkoutBtn').should('not.be.disabled')
    })
  })

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.loadWorkoutFile('test-workout.md')
      cy.viewport('iphone-x')
    })

    it('should display editor properly on mobile devices', () => {
      cy.get('#editWorkoutBtn').click()
      
      // Editor should be visible and properly sized
      cy.get('#workoutEditor').should('be.visible')
      cy.get('#workoutNameInput').should('be.visible')
      cy.get('#workoutMarkdownEditor').should('be.visible')
      
      // Action buttons should be visible
      cy.get('#saveWorkoutBtn').should('be.visible')
      cy.get('#cancelEditBtn').should('be.visible')
      
      // Text input should be properly sized
      cy.get('#workoutMarkdownEditor').should('have.css', 'width').should('not.equal', '0px')
    })

    it('should handle text input properly on mobile', () => {
      cy.get('#editWorkoutBtn').click()
      
      // Should be able to type in name field
      cy.get('#workoutNameInput').clear().type('mobile-test-workout')
      cy.get('#workoutNameInput').should('have.value', 'mobile-test-workout')
      
      // Should be able to type in content field
      cy.get('#workoutMarkdownEditor').clear().type('# Mobile Test\n\n## Exercise - 1:00', { parseSpecialCharSequences: false })
      cy.get('#workoutMarkdownEditor').should('contain.value', 'Mobile Test')
    })
  })
})