describe('Training Plan - Integration Tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.clearLocalStorage()
  })

  it('should switch to training plan view and display calendar', () => {
    // Check tab switching
    cy.get('#trainingPlanTab').click()
    
    // Training plan view should be active
    cy.get('#trainingPlanView').should('have.class', 'active')
    cy.get('#workoutView').should('not.have.class', 'active')
    
    // Calendar should be visible
    cy.get('.training-plan-section').should('be.visible')
    cy.get('#currentMonthYear').should('exist').and('not.be.empty')
    cy.get('.calendar-grid').should('be.visible')
    cy.get('.calendar-day').should('exist')
  })

  it('should assign workout to calendar day and persist data', () => {
    // Load a workout first
    cy.loadWorkoutFile('test-workout.md')
    
    // Switch to training plan
    cy.get('#trainingPlanTab').click()
    
    // Click on a calendar day
    cy.get('.calendar-day').first().click()
    
    // Assignment modal should open
    cy.get('#workoutAssignmentModal').should('be.visible')
    cy.get('#assignWorkoutSelect').should('exist')
    
    // Assign workout
    cy.get('#assignWorkoutSelect').select('test-workout')
    cy.get('#assignWorkoutBtn').click()
    
    // Modal should close and day should show assignment
    cy.get('#workoutAssignmentModal').should('not.be.visible')
    
    // Reload and verify persistence
    cy.reload()
    cy.get('#trainingPlanTab').click()
    
    // Assignment should still be visible
    // (This would depend on the specific UI implementation for showing assignments)
  })

  it('should handle navigation between months', () => {
    cy.get('#trainingPlanTab').click()
    
    // Get initial month
    cy.get('#currentMonthYear').invoke('text').then((initialMonth) => {
      // Navigate to next month
      cy.get('#nextMonthBtn').click()
      
      // Month should have changed
      cy.get('#currentMonthYear').should('not.contain', initialMonth)
      
      // Navigate back
      cy.get('#prevMonthBtn').click()
      
      // Should be back to original month
      cy.get('#currentMonthYear').should('contain', initialMonth)
    })
  })
})
    cy.get('#currentMonthYear').invoke('text').then((initialMonth) => {
      // Click next month
      cy.get('#nextMonthBtn').click()
      cy.get('#currentMonthYear').should('not.contain', initialMonth)
      
      // Click previous month to return
      cy.get('#prevMonthBtn').click()
      cy.get('#currentMonthYear').should('contain', initialMonth)
    })
  })

  it('should open assignment modal when clicking a day', () => {
    // Switch to training plan view
    cy.get('#trainingPlanTab').click()
    
    // Modal should not be visible initially
    cy.get('#workoutAssignmentModal').should('not.have.class', 'show')
    
    // Click on a calendar day (find first non-empty day)
    cy.get('.calendar-day').not('.empty').first().click()
    
    // Modal should now be visible
    cy.get('#workoutAssignmentModal').should('have.class', 'show')
    cy.get('.modal-content').should('be.visible')
    cy.get('#selectedDateText').should('not.be.empty')
    cy.get('#workoutAssignmentSelect').should('exist')
    cy.get('#assignWorkoutBtn').should('be.disabled')
    cy.get('#closeModalBtn').should('be.visible')
  })

  it('should close assignment modal when clicking close button', () => {
    // Switch to training plan view and open modal
    cy.get('#trainingPlanTab').click()
    cy.get('.calendar-day').not('.empty').first().click()
    cy.get('#workoutAssignmentModal').should('have.class', 'show')
    
    // Close modal
    cy.get('#closeModalBtn').click()
    cy.get('#workoutAssignmentModal').should('not.have.class', 'show')
  })

  it('should assign workout to calendar day', () => {
    // First create a workout
    cy.get('#newWorkoutBtn').click()
    cy.get('#workoutNameInput').type('Test Training')
    cy.get('#saveWorkoutBtn').click()
    cy.on('window:alert', () => true) // Handle alert
    
    // Switch to training plan view
    cy.get('#trainingPlanTab').click()
    
    // Click on a calendar day
    cy.get('.calendar-day').not('.empty').first().click()
    
    // Select workout from dropdown
    cy.get('#workoutAssignmentSelect').select('Test Training')
    
    // Assign button should now be enabled
    cy.get('#assignWorkoutBtn').should('not.be.disabled')
    
    // Assign the workout
    cy.get('#assignWorkoutBtn').click()
    
    // Workout should appear in assigned workouts list
    cy.get('#assignedWorkoutsList').should('contain', 'Test Training')
    
    // Close modal
    cy.get('#closeModalBtn').click()
    
    // Workout should appear on the calendar day
    cy.get('.calendar-day').not('.empty').first().should('contain', 'Test Training')
  })

  it('should remove workout from calendar day', () => {
    // First create and assign a workout
    cy.get('#newWorkoutBtn').click()
    cy.get('#workoutNameInput').type('Test Training')
    cy.get('#saveWorkoutBtn').click()
    cy.on('window:alert', () => true)
    
    cy.get('#trainingPlanTab').click()
    cy.get('.calendar-day').not('.empty').first().click()
    cy.get('#workoutAssignmentSelect').select('Test Training')
    cy.get('#assignWorkoutBtn').click()
    
    // Remove the workout
    cy.get('.remove-workout-btn').click()
    
    // Workout should be removed from assigned list
    cy.get('#assignedWorkoutsList').should('contain', 'No workouts assigned')
    
    // Close modal and verify workout is removed from calendar
    cy.get('#closeModalBtn').click()
    cy.get('.calendar-day').not('.empty').first().should('not.contain', 'Test Training')
  })

  it('should persist training plan data in localStorage', () => {
    // Create and assign a workout
    cy.get('#newWorkoutBtn').click()
    cy.get('#workoutNameInput').type('Persistent Workout')
    cy.get('#saveWorkoutBtn').click()
    cy.on('window:alert', () => true)
    
    cy.get('#trainingPlanTab').click()
    cy.get('.calendar-day').not('.empty').first().click()
    cy.get('#workoutAssignmentSelect').select('Persistent Workout')
    cy.get('#assignWorkoutBtn').click()
    cy.get('#closeModalBtn').click()
    
    // Reload page
    cy.reload()
    
    // Training plan data should persist
    cy.get('#trainingPlanTab').click()
    cy.get('.calendar-day').not('.empty').first().should('contain', 'Persistent Workout')
  })

  it('should navigate to today when clicking Today button', () => {
    cy.get('#trainingPlanTab').click()
    
    // Navigate to a different month
    cy.get('#nextMonthBtn').click()
    cy.get('#nextMonthBtn').click()
    
    // Click Today button
    cy.get('#todayBtn').click()
    
    // Should show current month with today highlighted
    const currentDate = new Date()
    const monthName = currentDate.toLocaleString('default', { month: 'long' })
    const year = currentDate.getFullYear()
    
    cy.get('#currentMonthYear').should('contain', `${monthName} ${year}`)
    cy.get('.calendar-day.today').should('exist')
  })
})