describe('Exercise Descriptions', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should parse workout files with exercise descriptions', () => {
    const workoutWithDescriptions = `# Test Workout

## Push-ups - 0:05
Keep your body in a straight line.
Lower your chest to just above the ground.
Push back up explosively.

Rest - 0:02

## Plank - 0:03
Hold a push-up position on your forearms.
Keep your core engaged throughout.`

    cy.get('#workoutFile').then(input => {
      const blob = new Blob([workoutWithDescriptions], { type: 'text/markdown' })
      const file = new File([blob], 'descriptions-test.md', { type: 'text/markdown' })
      
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input[0].files = dataTransfer.files
      
      const changeEvent = new Event('change', { bubbles: true })
      input[0].dispatchEvent(changeEvent)
    })

    cy.get('#workoutDisplay').should('be.visible')
    cy.get('#currentDescription').should('be.visible')
  })

  it('should show expandable description in main timer area', () => {
    cy.loadWorkoutFile('sample-workout.md')
    
    cy.get('#currentDescription').should('be.visible')
    cy.get('.description-toggle').should('contain', 'Show Instructions')
    cy.get('.description-toggle .expand-icon').should('exist')
    
    cy.get('.description-toggle').click()
    cy.get('.exercise-description-main').should('have.class', 'expanded')
    cy.get('.description-content').should('be.visible')
    cy.get('.description-content p').should('exist')
  })

  it('should hide description for exercises without descriptions', () => {
    const workoutWithoutDescriptions = `# Simple Workout

## Exercise One - 0:05
## Exercise Two - 0:03`

    cy.get('#workoutFile').then(input => {
      const blob = new Blob([workoutWithoutDescriptions], { type: 'text/markdown' })
      const file = new File([blob], 'no-descriptions.md', { type: 'text/markdown' })
      
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input[0].files = dataTransfer.files
      
      const changeEvent = new Event('change', { bubbles: true })
      input[0].dispatchEvent(changeEvent)
    })

    cy.get('#currentDescription').should('not.be.visible')
  })

  it('should show expand icons in workout list for exercises with descriptions', () => {
    cy.loadWorkoutFile('sample-workout.md')
    
    cy.get('.exercise-item').first().within(() => {
      cy.get('.expand-icon').should('exist')
      cy.get('.exercise-header').should('have.attr', 'onclick')
    })
  })

  it('should expand and collapse descriptions in workout list', () => {
    cy.loadWorkoutFile('sample-workout.md')
    
    cy.get('.exercise-item').first().within(() => {
      cy.get('.exercise-header').click()
    })
    
    cy.get('.exercise-item').first().should('have.class', 'expanded')
    cy.get('.exercise-item').first().find('.exercise-description').should('be.visible')
    cy.get('.exercise-item').first().find('.exercise-description p').should('exist')
    
    cy.get('.exercise-item').first().within(() => {
      cy.get('.exercise-header').click()
    })
    
    cy.get('.exercise-item').first().should('not.have.class', 'expanded')
  })

  it('should update description when switching exercises', () => {
    cy.loadWorkoutFile('sample-workout.md')
    
    cy.get('#descriptionContent').should('contain', 'Light cardio')
    
    cy.get('#startBtn').click()
    cy.get('#skipBtn').click()
    
    cy.get('#descriptionContent').should('contain', 'Classic bodyweight exercise')
    cy.get('#currentExercise').should('contain', 'Push-ups')
  })

  it('should handle rest periods with default descriptions', () => {
    cy.loadWorkoutFile('sample-workout.md')
    
    cy.get('#startBtn').click()
    cy.get('#skipBtn').click()
    cy.get('#skipBtn').click()
    
    cy.get('#currentExercise').should('contain', 'Rest')
    cy.get('#descriptionContent').should('contain', 'Take a break and prepare')
  })

  it('should reset description expansion state when switching exercises', () => {
    cy.loadWorkoutFile('sample-workout.md')
    
    cy.get('.description-toggle').click()
    cy.get('.exercise-description-main').should('have.class', 'expanded')
    
    cy.get('#startBtn').click()
    cy.get('#skipBtn').click()
    
    cy.get('.exercise-description-main').should('not.have.class', 'expanded')
  })

  it('should display multi-line descriptions correctly', () => {
    const multilineWorkout = `# Multi-line Test

## Complex Exercise - 0:05
This is line one of the description.
This is line two with different content.
This is line three with even more details.

Rest - 0:02`

    cy.get('#workoutFile').then(input => {
      const blob = new Blob([multilineWorkout], { type: 'text/markdown' })
      const file = new File([blob], 'multiline-test.md', { type: 'text/markdown' })
      
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input[0].files = dataTransfer.files
      
      const changeEvent = new Event('change', { bubbles: true })
      input[0].dispatchEvent(changeEvent)
    })

    cy.get('.description-toggle').click()
    cy.get('.description-content p').should('have.length', 3)
    cy.get('.description-content p').first().should('contain', 'This is line one')
    cy.get('.description-content p').eq(1).should('contain', 'This is line two')
    cy.get('.description-content p').eq(2).should('contain', 'This is line three')
  })

  it('should be responsive on mobile devices', () => {
    cy.viewport('iphone-x')
    cy.loadWorkoutFile('sample-workout.md')
    
    cy.get('.description-toggle').should('be.visible')
    cy.get('.description-toggle').click()
    cy.get('.description-content').should('be.visible')
    
    cy.get('.exercise-item').first().within(() => {
      cy.get('.exercise-header').should('be.visible')
      cy.get('.expand-icon').should('be.visible')
    })
  })
})