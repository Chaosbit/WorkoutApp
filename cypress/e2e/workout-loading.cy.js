describe('Workout File Loading', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the initial interface correctly', () => {
    cy.get('h1').should('contain', '🏋️ Workout Timer')
    cy.get('h2').should('contain', 'Load Workout')
    cy.get('#workoutFile').should('exist')
    cy.get('#workoutDisplay').should('not.be.visible')
  })

  it('should show sample workout format', () => {
    cy.get('.sample-format').should('be.visible')
    cy.get('.sample-format h3').should('contain', 'Sample Workout Format')
    cy.get('.sample-format pre').should('contain', '# Push Day Workout')
    cy.get('.sample-format pre').should('contain', '## Warm-up - 5:00')
  })

  it('should load and parse a valid workout file', () => {
    cy.loadWorkoutFile('test-workout.md')
    
    cy.get('#workoutDisplay').should('be.visible')
    cy.get('#workoutTitle').should('contain', 'Test Workout')
    cy.get('#currentExercise').should('contain', 'Warm-up')
    cy.get('#timerDisplay').should('contain', '00:03')
    cy.get('#progressText').should('contain', 'Exercise 1 of 6')
  })

  it('should display all exercises in the workout list', () => {
    cy.loadWorkoutFile('test-workout.md')
    
    cy.get('.exercise-item').should('have.length', 6)
    cy.get('.exercise-item').first().should('contain', 'Warm-up').and('contain', '00:03')
    cy.get('.exercise-item').eq(1).should('contain', 'Push-ups').and('contain', '00:02')
    cy.get('.exercise-item').eq(2).should('contain', 'Rest').and('contain', '00:01')
  })

  it('should handle file loading errors gracefully', () => {
    cy.window().then((win) => {
      cy.stub(win, 'alert').as('windowAlert')
    })
    
    cy.get('#workoutFile').selectFile('cypress/fixtures/nonexistent-file.md', { force: true })
    
    cy.get('@windowAlert').should('have.been.called')
  })

  it('should parse workout files with different time formats', () => {
    const workoutContent = `# Time Format Test

## Exercise One - 1:30
Rest - 0:45

## Exercise Two - 10:00`

    cy.get('#workoutFile').then(input => {
      const blob = new Blob([workoutContent], { type: 'text/markdown' })
      const file = new File([blob], 'time-test.md', { type: 'text/markdown' })
      
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input[0].files = dataTransfer.files
      
      const changeEvent = new Event('change', { bubbles: true })
      input[0].dispatchEvent(changeEvent)
    })

    cy.get('#workoutDisplay').should('be.visible')
    cy.get('#timerDisplay').should('contain', '01:30')
    
    cy.get('.exercise-item').should('have.length', 3)
    cy.get('.exercise-item').eq(0).should('contain', '01:30')
    cy.get('.exercise-item').eq(1).should('contain', '00:45')
    cy.get('.exercise-item').eq(2).should('contain', '10:00')
  })
})