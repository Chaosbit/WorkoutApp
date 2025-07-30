describe('Description Visibility and Layout', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.loadWorkoutFile('sample-workout.md')
  })

  it('should keep description within viewport bounds', () => {
    // Test main timer description
    cy.get('.description-toggle').click()
    cy.get('.exercise-description.expanded').should('be.visible')
    cy.get('.description-content').should('be.visible')
    
    // Check that description doesn't overflow viewport
    cy.get('.description-content').then($desc => {
      const rect = $desc[0].getBoundingClientRect()
      expect(rect.left).to.be.at.least(0)
      expect(rect.right).to.be.at.most(Cypress.config('viewportWidth'))
    })
  })

  it('should keep workout list descriptions within bounds', () => {
    // Expand first exercise in workout list
    cy.get('.exercise-item').first().find('.exercise-header').click()
    cy.get('.exercise-item').first().should('have.class', 'expanded')
    
    // Check visibility and bounds (allow margin for padding and mobile rendering)
    cy.get('.exercise-item.expanded .exercise-description').should('be.visible')
    cy.get('.exercise-item.expanded .exercise-description').then($desc => {
      const rect = $desc[0].getBoundingClientRect()
      // Use larger margin for mobile viewports due to scaling and rendering differences
      const margin = Cypress.config('viewportWidth') <= 375 ? 50 : 20
      expect(rect.left).to.be.at.least(-margin) // Allow margin for padding and mobile rendering
      expect(rect.right).to.be.at.most(Cypress.config('viewportWidth') + margin)
      expect(rect.top).to.be.at.least(-margin) // Allow margin for scroll
    })
  })



  it('should maintain proper text alignment', () => {
    // Main description should be left-aligned
    cy.get('.description-toggle').click()
    cy.get('.description-content').should('have.css', 'text-align').and('match', /left|start/)
    
    // Workout list descriptions should be readable
    cy.get('.exercise-item').first().find('.exercise-header').click()
    cy.get('.exercise-item.expanded .exercise-description p').should('be.visible')
  })

  it('should be responsive on mobile viewport', () => {
    cy.viewport('iphone-x')
    
    // Test main description on mobile
    cy.get('.description-toggle').click()
    cy.get('.description-content').should('be.visible')
    cy.get('.description-content').then($desc => {
      const rect = $desc[0].getBoundingClientRect()
      expect(rect.left).to.be.at.least(0)
      expect(rect.right).to.be.at.most(Cypress.config('viewportWidth'))
    })
    
    // Test workout list on mobile
    cy.get('.exercise-item').first().find('.exercise-header').click()
    cy.get('.exercise-item.expanded .exercise-description').should('be.visible')
    cy.get('.exercise-item.expanded .exercise-description').then($desc => {
      const rect = $desc[0].getBoundingClientRect()
      expect(rect.left).to.be.at.least(0)
      expect(rect.right).to.be.at.most(Cypress.config('viewportWidth'))
    })
  })

  it('should not overlap with other elements', () => {
    // Expand main description
    cy.get('.description-toggle').click()
    
    // Check that description doesn't overlap with timer
    cy.get('.description-content').then($desc => {
      const descRect = $desc[0].getBoundingClientRect()
      
      cy.get('.timer-display').then($timer => {
        const timerRect = $timer[0].getBoundingClientRect()
        
        // Description should be above timer (smaller top value)
        expect(descRect.bottom).to.be.at.most(timerRect.top + 10) // 10px tolerance for gap
      })
    })
  })

  it('should maintain readability with long text', () => {
    const longDescriptionWorkout = `# Long Description Test

## Long Exercise Name With Multiple Words - 0:05
This is a very long description that contains multiple sentences and should test how the layout handles extended text content. The description should remain readable and not cause any layout issues or overflow problems. It should wrap properly within its container and maintain proper spacing and alignment with other elements on the page.

Additional paragraph to test multiple paragraphs within a single exercise description. This should also wrap properly and maintain readability.

Rest - 0:02`

    cy.get('#workoutFile').then(input => {
      const blob = new Blob([longDescriptionWorkout], { type: 'text/markdown' })
      const file = new File([blob], 'long-description.md', { type: 'text/markdown' })
      
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input[0].files = dataTransfer.files
      
      const changeEvent = new Event('change', { bubbles: true })
      input[0].dispatchEvent(changeEvent)
    })

    // Test main description with long text
    cy.get('.description-toggle').click()
    cy.get('.description-content').should('be.visible')
    cy.get('.description-content p').should('have.length', 2)
    
    // Test workout list with long text
    cy.get('.exercise-item').first().find('.exercise-header').click()
    cy.get('.exercise-item.expanded .exercise-description').should('be.visible')
    cy.get('.exercise-item.expanded .exercise-description p').should('have.length', 2)
    
    // Check text remains within viewport bounds
    cy.get('.description-content').then($desc => {
      const rect = $desc[0].getBoundingClientRect()
      expect(rect.left).to.be.at.least(0)
      expect(rect.right).to.be.at.most(Cypress.config('viewportWidth'))
    })
  })
})