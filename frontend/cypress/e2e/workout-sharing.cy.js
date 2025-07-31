describe('Workout Sharing - Integration Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should share and load workout via URL parameters', () => {
    // Load a workout first
    cy.loadWorkoutFile('test-workout.md')
    
    // Share button should be visible
    cy.get('#shareWorkoutBtn').should('be.visible')
    
    // Create a simple shared workout test
    const workoutContent = `# Test Shared Workout
## Jumping Jacks - 0:30
Rest - 0:15`

    const encoded = btoa(encodeURIComponent(workoutContent))
    
    // Visit with shared workout
    cy.visit(`/?workout=${encoded}`)
    
    // Verify workout loads correctly
    cy.get('#workoutTitle').should('contain', 'Test Shared Workout')
    cy.get('#currentExercise').should('contain', 'Jumping Jacks')
    
    // Should be able to execute the shared workout
    cy.clickWorkoutControl('start')
    cy.getCurrentExercise().should('contain', 'Jumping Jacks')
  })

  it('should handle invalid shared workout gracefully', () => {
    cy.visit('/?workout=invalid-encoded-data')
    
    // Should show error and fallback to normal state
    cy.get('.sample-format').should('be.visible')
    cy.get('#workoutDisplay').should('not.be.visible')
  })
})
  });

  it('should handle invalid shared workout gracefully', () => {
    // Visit page with invalid encoded workout
    cy.visit('/?workout=invalid-encoded-data');
    
    // Should show error and fall back to normal interface
    cy.get('.file-input-section').should('be.visible');
    cy.get('#workoutDisplay').should('not.be.visible');
  });

  it('should clean URL after loading shared workout', () => {
    const workoutContent = `# Simple Workout

## Exercise - 0:30
Do the thing.`;

    const encoded = btoa(encodeURIComponent(workoutContent));
    cy.visit(`/?workout=${encoded}`);

    // Check that workout loaded
    cy.get('#workoutTitle').should('contain', 'Simple Workout');
    
    // Check that URL parameter is cleaned up
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should work with special characters in workout content', () => {
    const workoutContent = `# Special Workout! 💪 & More

## High-Intensity Exercise (Advanced) - 1:30
This includes special chars: áéíóú, çñ, and emoji 🔥
Multiple lines with "quotes" and 'apostrophes'.
Symbols: @#$%^&*()_+-=[]{}|;:,.<>?`;

    const encoded = btoa(encodeURIComponent(workoutContent));
    cy.visit(`/?workout=${encoded}`);

    // Check that workout loaded correctly with special characters
    cy.get('#workoutTitle').should('contain', 'Special Workout! 💪 & More');
    cy.get('#currentExercise').should('contain', 'High-Intensity Exercise (Advanced)');
    
    // Check that description contains special characters
    cy.get('#descriptionContent').should('contain', '🔥');
    cy.get('#descriptionContent').should('contain', 'áéíóú');
  });

  it('should show success message when share button is clicked', () => {
    // Load a workout first
    cy.fixture('test-workout.md').then(fileContent => {
      const file = new File([fileContent], 'test-workout.md', { type: 'text/markdown' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      cy.get('#workoutFile').then(input => {
        input[0].files = dataTransfer.files;
        input[0].dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    // Wait for workout to load
    cy.wait(1000);

    // Click share button
    cy.get('#shareWorkoutBtn').click();
    
    // Check for success message (will appear briefly)
    cy.get('body', { timeout: 10000 }).should('contain', 'Workout link copied to clipboard!');
  });

  it('should automatically save shared workouts to library', () => {
    const workoutContent = `# Shared Test Workout

## Squats - 0:45
Lower body exercise

Rest - 0:15

## Push-ups - 0:30
Upper body exercise`;

    const encoded = btoa(encodeURIComponent(workoutContent));
    cy.visit(`/?workout=${encoded}`);

    // Check that workout is loaded
    cy.get('#workoutTitle').should('contain', 'Shared Test Workout');
    cy.get('#currentExercise').should('contain', 'Squats');
    
    // Check that workout appears in the library dropdown (automatically saved)  
    cy.get('#workoutSelect').should('not.have.value', '');
    cy.get('#workoutSelect option:selected').should('contain', 'Shared Test Workout');
    
    // Verify edit/delete buttons are enabled (indicating it's a saved workout)
    cy.get('#editWorkoutBtn').should('not.be.disabled');
    cy.get('#deleteWorkoutBtn').should('not.be.disabled');
  });
});