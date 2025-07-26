describe('Training Plan', () => {
  beforeEach(() => {
    cy.visit('/')
    // Clear localStorage before each test
    cy.clearLocalStorage()
  })

  it('should show training plan tab and switch views', () => {
    // Check that training plan tab exists
    cy.get('#trainingPlanTab').should('exist').and('contain', 'Training Plan')
    cy.get('#workoutsTab').should('exist').and('contain', 'Workouts').and('have.class', 'active')
    
    // Initially, workouts view should be active
    cy.get('#workoutView').should('have.class', 'active')
    cy.get('#trainingPlanView').should('not.have.class', 'active')
    
    // Click training plan tab
    cy.get('#trainingPlanTab').click()
    
    // Training plan view should now be active
    cy.get('#trainingPlanView').should('have.class', 'active')
    cy.get('#workoutView').should('not.have.class', 'active')
    cy.get('#trainingPlanTab').should('have.class', 'active')
    cy.get('#workoutsTab').should('not.have.class', 'active')
  })

  it('should display calendar with current month', () => {
    // Switch to training plan view
    cy.get('#trainingPlanTab').click()
    
    // Calendar should be visible
    cy.get('.training-plan-section').should('be.visible')
    cy.get('#currentMonthYear').should('exist').and('not.be.empty')
    cy.get('.calendar-grid').should('be.visible')
    cy.get('.calendar-days').should('be.visible')
    
    // Should have 7 day headers
    cy.get('.calendar-day-header').should('have.length', 7)
    cy.get('.calendar-day-header').first().should('contain', 'Sun')
    cy.get('.calendar-day-header').last().should('contain', 'Sat')
    
    // Should have calendar days
    cy.get('.calendar-day').should('exist')
  })

  it('should navigate between months', () => {
    // Switch to training plan view
    cy.get('#trainingPlanTab').click()
    
    // Get initial month
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