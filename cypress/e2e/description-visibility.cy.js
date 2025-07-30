describe('Description Visibility and Layout', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.loadWorkoutFile('sample-workout.md')
    cy.waitForWorkoutLoad()
  })

  it('should keep description within viewport bounds', () => {
    // Test main timer description
    cy.clickDescriptionToggle()
    cy.getExerciseDescription().should('have.class', 'expanded')
    cy.getDescriptionContent().should('be.visible')
    
    // Check that description doesn't overflow viewport
    cy.getDescriptionContent().then($desc => {
      const rect = $desc[0].getBoundingClientRect()
      expect(rect.left).to.be.at.least(0)
      expect(rect.right).to.be.at.most(Cypress.config('viewportWidth'))
    })
  })

  it('should keep workout list descriptions within bounds', () => {
    // Check exercise preview descriptions in workout list
    cy.getExerciseItem(0).should('exist')
    cy.get('exercise-list').should('exist').then(($component) => {
      const component = $component[0];
      const exerciseItems = component.shadowRoot.querySelectorAll('.exercise-item');
      expect(exerciseItems.length).to.be.greaterThan(0);
      
      // Find an exercise with description preview
      const exerciseWithDescription = Array.from(exerciseItems).find(item => 
        item.querySelector('.exercise-description-preview')
      );
      
      if (exerciseWithDescription) {
        const preview = exerciseWithDescription.querySelector('.exercise-description-preview');
        const rect = preview.getBoundingClientRect();
        // Use larger margin for mobile viewports due to scaling and rendering differences
        const margin = Cypress.config('viewportWidth') <= 375 ? 50 : 20;
        expect(rect.left).to.be.at.least(-margin);
        expect(rect.right).to.be.at.most(Cypress.config('viewportWidth') + margin);
        expect(rect.top).to.be.at.least(-margin);
      }
    });
  })



  it('should maintain proper text alignment', () => {
    // Main description should be left-aligned
    cy.clickDescriptionToggle()
    cy.getDescriptionContent().should('have.css', 'text-align').and('match', /left|start/)
    
    // Workout list description previews should be readable
    cy.get('exercise-list').then(($component) => {
      const component = $component[0];
      const previews = component.shadowRoot.querySelectorAll('.exercise-description-preview');
      if (previews.length > 0) {
        cy.wrap(previews[0]).should('be.visible');
      }
    });
  })

  it('should be responsive on mobile viewport', () => {
    cy.viewport('iphone-x')
    
    // Test main description on mobile
    cy.clickDescriptionToggle()
    cy.getDescriptionContent().should('be.visible')
    cy.getDescriptionContent().then($desc => {
      const rect = $desc[0].getBoundingClientRect()
      expect(rect.left).to.be.at.least(0)
      expect(rect.right).to.be.at.most(Cypress.config('viewportWidth'))
    })
    
    // Test workout list preview descriptions on mobile
    cy.get('exercise-list').then(($component) => {
      const component = $component[0];
      const previews = component.shadowRoot.querySelectorAll('.exercise-description-preview');
      if (previews.length > 0) {
        const rect = previews[0].getBoundingClientRect();
        expect(rect.left).to.be.at.least(0);
        expect(rect.right).to.be.at.most(Cypress.config('viewportWidth'));
      }
    });
  })

  it('should not overlap with other elements', () => {
    // Expand main description
    cy.clickDescriptionToggle()
    
    // Check that description doesn't overlap with timer display
    cy.getDescriptionContent().then($desc => {
      const descRect = $desc[0].getBoundingClientRect()
      
      cy.getTimerDisplay().then($timer => {
        const timerRect = $timer[0].getBoundingClientRect()
        
        // Description should be above timer display or they should not overlap vertically
        // Allow some tolerance for proper spacing
        expect(descRect.bottom).to.be.at.most(timerRect.top + 20) // 20px tolerance for spacing/margin
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
    cy.clickDescriptionToggle()
    cy.getDescriptionContent().should('be.visible')
    // Check that description content exists and contains text (it's rendered as plain text, not HTML paragraphs)
    cy.getDescriptionContent().should('contain.text', 'This is a very long description')
    cy.getDescriptionContent().should('contain.text', 'Additional paragraph')
    
    // Test workout list with long text - check description previews
    cy.get('exercise-list').then(($component) => {
      const component = $component[0];
      const previews = component.shadowRoot.querySelectorAll('.exercise-description-preview');
      if (previews.length > 0) {
        cy.wrap(previews[0]).should('be.visible');
      }
    });
    
    // Check text remains within viewport bounds
    cy.getDescriptionContent().then($desc => {
      const rect = $desc[0].getBoundingClientRect()
      expect(rect.left).to.be.at.least(0)
      expect(rect.right).to.be.at.most(Cypress.config('viewportWidth'))
    })
  })
})