describe('Print Functionality - Integration Tests', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should display and function print button when workout is loaded', () => {
        // Load workout
        cy.loadWorkoutFile('test-workout.md')
        
        // Print button should be visible
        cy.get('#workoutDisplay').should('be.visible')
        cy.get('#printWorkoutBtn').should('be.visible')
        cy.get('#printWorkoutBtn').should('contain', 'Print Workout')
        
        // Basic print functionality test (window.print is difficult to test fully in Cypress)
        cy.window().then((win) => {
            cy.stub(win, 'print').as('windowPrint')
        })
        
        cy.get('#printWorkoutBtn').click()
        cy.get('@windowPrint').should('have.been.called')
    })
})
        cy.get('#printWorkoutBtn .material-icons').should('contain', 'print');
    });

    it('should open print window when print button is clicked', () => {
        // Load sample workout
        cy.fixture('sample-workout.md').then((content) => {
            const blob = new Blob([content], { type: 'text/markdown' });
            const file = new File([blob], 'test-workout.md', { type: 'text/markdown' });
            
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            
            cy.get('#workoutFile').then((input) => {
                input[0].files = dataTransfer.files;
                input[0].dispatchEvent(new Event('change', { bubbles: true }));
            });
        });
        
        cy.on('window:alert', () => true);
        cy.get('#workoutDisplay').should('be.visible');
        
        // Mock window.open to test that it's called
        cy.window().then((win) => {
            cy.stub(win, 'open').as('windowOpen');
        });

        cy.get('#printWorkoutBtn').click();
        cy.get('@windowOpen').should('have.been.calledWith', '', '_blank');
    });

    it('should show message when trying to print without workout loaded', () => {        
        // Get the app instance and test print with no workout
        cy.window().its('workoutApp').then((app) => {
            app.workout = null;
            app.printWorkout();
        });
        
        // Should show warning message instead of alert
        cy.get('.app-message--warning').should('be.visible')
        cy.get('.app-message--warning').should('contain', 'No workout loaded to print.')
    });
});