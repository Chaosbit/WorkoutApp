describe('Circle Training', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should parse circle training syntax correctly', () => {
        cy.fixture('circle-workout.md').then((workoutContent) => {
            cy.get('#workoutFile').selectFile({
                contents: Cypress.Buffer.from(workoutContent),
                fileName: 'circle-workout.md',
                mimeType: 'text/markdown'
            }, { force: true });

            // Check that exercises are expanded with round information
            cy.get('.exercise-item').should('have.length.greaterThan', 3);
            
            // Verify that circle exercises are labeled with rounds
            cy.get('.exercise-item').should('contain', 'Round 1/3');
            cy.get('.exercise-item').should('contain', 'Round 2/3');
            cy.get('.exercise-item').should('contain', 'Round 3/3');
            
            // Verify specific exercises appear in each round
            cy.get('.exercise-item').should('contain', 'Round 1/3: Push-ups');
            cy.get('.exercise-item').should('contain', 'Round 1/3: Squats');
            cy.get('.exercise-item').should('contain', 'Round 1/3: Burpees');
        });
    });

    it('should maintain proper exercise order in circles', () => {
        cy.fixture('circle-workout.md').then((workoutContent) => {
            cy.get('#workoutFile').selectFile({
                contents: Cypress.Buffer.from(workoutContent),
                fileName: 'circle-workout.md',
                mimeType: 'text/markdown'
            }, { force: true });

            // Start the workout
            cy.get('#startBtn').click();
            
            // Check that the first exercise is Warm-up (not part of circle)
            cy.get('#currentExercise').should('contain', 'Warm-up');
            
            // Skip to first circle exercise
            cy.get('#skipBtn').click();
            cy.get('#currentExercise').should('contain', 'Round 1/3: Push-ups');
            
            // Skip through the round to verify order
            cy.get('#skipBtn').click();
            cy.get('#currentExercise').should('contain', 'Round 1/3: Squats');
            
            cy.get('#skipBtn').click();
            cy.get('#currentExercise').should('contain', 'Round 1/3: Burpees');
            
            cy.get('#skipBtn').click();
            cy.get('#currentExercise').should('contain', 'Rest');
            
            cy.get('#skipBtn').click();
            cy.get('#currentExercise').should('contain', 'Round 2/3: Push-ups');
        });
    });

    it('should handle multiple circles in one workout', () => {
        const multiCircleWorkout = `# Multi-Circle Workout

## Warm-up - 0:10

### Circle: 2 rounds
## Exercise A - 0:15
## Exercise B - 0:20

Rest - 0:05

### Circle: 3 rounds
## Exercise C - 0:10
## Exercise D - 0:15

## Cool Down - 0:10`;

        cy.get('#workoutFile').selectFile({
            contents: Cypress.Buffer.from(multiCircleWorkout),
            fileName: 'multi-circle.md',
            mimeType: 'text/markdown'
        }, { force: true });

        // Verify both circuits are parsed
        cy.get('.exercise-item').should('contain', 'Round 1/2: Exercise A');
        cy.get('.exercise-item').should('contain', 'Round 2/2: Exercise B');
        cy.get('.exercise-item').should('contain', 'Round 1/3: Exercise C');
        cy.get('.exercise-item').should('contain', 'Round 3/3: Exercise D');
    });

    it('should preserve exercise descriptions in circles', () => {
        cy.fixture('circle-workout.md').then((workoutContent) => {
            cy.get('#workoutFile').selectFile({
                contents: Cypress.Buffer.from(workoutContent),
                fileName: 'circle-workout.md',
                mimeType: 'text/markdown'
            }, { force: true });

            cy.get('#startBtn').click();
            
            // Skip to first circle exercise
            cy.get('#skipBtn').click();
            
            // Verify description is preserved
            cy.get('#descriptionContent').should('contain', 'Standard push-ups targeting chest and arms');
        });
    });
});