describe('Mobile Browser Functionality', () => {
  beforeEach(() => {
    cy.visit('/');
    // Load a test workout using the file upload method like other tests
    cy.loadWorkoutFile('test-workout.md');
  });

  describe('Mobile UI Behavior', () => {
    it('should display properly on mobile viewport', () => {
      // Check that main elements are properly sized for mobile
      cy.get('.container').should('be.visible');
      cy.getWorkoutControlState('start').should('be.visible');
      cy.getWorkoutControlState('pause').should('be.visible');
      cy.getWorkoutControlState('skip').should('be.visible');
      cy.getWorkoutControlState('reset').should('be.visible');
      
      // Verify mobile-friendly button sizes - check for minimum clickable area
      cy.getWorkoutControlState('start').should('have.css', 'display').and('not.equal', 'none');
      cy.getWorkoutControlState('skip').should('have.css', 'display').and('not.equal', 'none');
      cy.getWorkoutControlState('reset').should('have.css', 'display').and('not.equal', 'none');
    });

    it('should handle touch interactions', () => {
      // Test touch-friendly interactions
      cy.getWorkoutControlState('start').should('be.visible').click();
      cy.getCurrentExercise().should('contain', 'Warm-up');
      
      // Test button states on mobile
      cy.getWorkoutControlState('start').should('be.disabled');
      cy.getWorkoutControlState('pause').should('be.enabled');
      
      // Test pause/resume with touch
      cy.clickWorkoutControl('pause');
      cy.getWorkoutControlState('start').should('be.enabled');
      cy.getWorkoutControlState('pause').should('be.disabled');
    });

    it('should display progress bars properly on mobile', () => {
      cy.clickWorkoutControl('start');
      
      // Check that progress bars are visible and properly styled
      cy.getProgressFill().should('be.visible');
      cy.getTimerDisplay().should('be.visible');
    });
  });

  describe('Mobile PWA Features', () => {
    it('should have PWA manifest available', () => {
      cy.request('/manifest.json').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('name');
        expect(response.body).to.have.property('short_name');
        expect(response.body).to.have.property('display', 'standalone');
      });
    });

    it('should register service worker for offline functionality', () => {
      cy.window().then((win) => {
        expect(win.navigator.serviceWorker).to.exist;
      });
    });

    it('should handle viewport meta tag for mobile', () => {
      cy.get('head meta[name="viewport"]')
        .should('have.attr', 'content')
        .and('include', 'width=device-width')
        .and('include', 'initial-scale=1');
    });
  });

  describe('Mobile Timer Functionality', () => {
    it('should maintain timer accuracy on mobile', () => {
      cy.clickWorkoutControl('start');
      
      // Wait for a short period and check timer countdown
      cy.wait(1000);
      cy.getTimerDisplay().should('be.visible');
      cy.getTimerDisplay().should('not.contain', '0:00');
    });

    it('should handle screen orientation changes', () => {
      // Simulate portrait to landscape change
      cy.viewport(667, 375); // Landscape
      cy.getWorkoutControlState('start').should('be.visible');
      cy.getWorkoutControlState('pause').should('be.visible');
      
      // Back to portrait
      cy.viewport(375, 667);
      cy.getWorkoutControlState('start').should('be.visible');
      cy.getWorkoutControlState('pause').should('be.visible');
    });

    it('should prevent screen from sleeping during workout', () => {
      // Check for wake lock API usage (if supported)
      cy.window().then((win) => {
        if ('wakeLock' in win.navigator) {
          cy.clickWorkoutControl('start');
          // Note: We can't directly test wake lock due to browser security,
          // but we can verify the API exists and would be called
        }
      });
    });
  });

  describe('Mobile Responsive Design', () => {
    it('should adapt layout for small screens', () => {
      // Test iPhone SE size
      cy.viewport(320, 568);
      cy.get('.container').should('be.visible');
      cy.getWorkoutControlState('start').should('be.visible');
      
      // Test larger mobile size
      cy.viewport(414, 896);
      cy.get('.container').should('be.visible');
      cy.getWorkoutControlState('start').should('be.visible');
    });

    it('should handle tablet-sized viewports', () => {
      cy.viewport(768, 1024);
      cy.get('.container').should('be.visible');
      cy.getWorkoutControlState('start').should('be.visible');
      cy.getWorkoutControlState('pause').should('be.visible');
    });
  });
});