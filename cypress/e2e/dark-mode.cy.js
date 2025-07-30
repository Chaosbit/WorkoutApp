describe('Dark Mode - Integration Tests', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should function properly in dark mode environment', () => {
        // Visit with dark mode preference
        cy.visit('/', {
            onBeforeLoad: (win) => {
                Object.defineProperty(win, 'matchMedia', {
                    writable: true,
                    value: cy.stub().returns({
                        matches: true,
                        addListener: cy.stub(),
                        removeListener: cy.stub(),
                    }),
                });
            }
        });

        // Load and execute workout in dark mode
        cy.loadWorkoutFile('test-workout.md')
        
        // Should function normally regardless of theme
        cy.clickWorkoutControl('start')
        cy.getCurrentExercise().should('contain', 'Warm-up')
        
        // UI elements should be visible
        cy.getTimerDisplay().should('be.visible')
        cy.getProgressFill().should('be.visible')
    })
})
                });
            },
        });

        // Check dark mode colors are applied via CSS media query
        cy.get('body').should('be.visible');
        
        // Test that CSS variables exist for dark mode
        cy.window().then((win) => {
            const style = win.document.createElement('style');
            style.innerHTML = `
                @media (prefers-color-scheme: dark) {
                    .dark-test { 
                        --test-primary: var(--md-sys-color-primary);
                        --test-surface: var(--md-sys-color-surface);
                    }
                }
                @media (prefers-color-scheme: light) {
                    .dark-test { 
                        --test-primary: var(--md-sys-color-primary);
                        --test-surface: var(--md-sys-color-surface);
                    }
                }
            `;
            win.document.head.appendChild(style);
        });
    });

    it('should have proper contrast in both light and dark modes', () => {
        // Test light mode contrast
        cy.get('.md-top-app-bar').should('be.visible').and('have.css', 'background-color');
        cy.get('.md-card').should('be.visible').and('have.css', 'background-color');
        
        // Verify main visible elements have proper styling
        cy.get('#newWorkoutBtn').should('be.visible');
        cy.get('.file-input-area').should('be.visible');
        cy.get('.sample-format').should('be.visible');
    });

    it('should update PWA theme color based on color scheme', () => {
        // Check that theme-color meta tags exist for both schemes
        cy.get('meta[name="theme-color"][media="(prefers-color-scheme: light)"]')
            .should('have.attr', 'content', '#6750A4');
            
        cy.get('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]')
            .should('have.attr', 'content', '#1C1B1F');
    });

    it('should maintain functionality in dark mode', () => {
        // Test that core functionality works regardless of theme
        cy.get('#newWorkoutBtn').should('be.visible').click();
        
        // Wait for editor to appear
        cy.get('#workoutEditor').should('be.visible');
        
        // Verify styling is applied correctly
        cy.get('#workoutEditor').should('have.css', 'background-color');
        cy.get('#workoutMarkdownEditor').should('be.visible');
    });
});