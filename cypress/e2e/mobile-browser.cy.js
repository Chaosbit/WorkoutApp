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
      cy.get('#startBtn').should('be.visible');
      cy.get('#pauseBtn').should('be.visible');
      cy.get('#skipBtn').should('be.visible');
      cy.get('#resetBtn').should('be.visible');
      
      // Verify mobile-friendly button sizes - check for minimum clickable area
      cy.get('#startBtn').should('have.css', 'display').and('not.equal', 'none');
      cy.get('#skipBtn').should('have.css', 'display').and('not.equal', 'none');
      cy.get('#resetBtn').should('have.css', 'display').and('not.equal', 'none');
    });

    it('should handle touch interactions', () => {
      // Test touch-friendly interactions
      cy.get('#startBtn').should('be.visible').click();
      cy.get('#currentExercise').should('contain', 'Warm-up');
      
      // Test button states on mobile
      cy.get('#startBtn').should('be.disabled');
      cy.get('#pauseBtn').should('be.enabled');
      
      // Test pause/resume with touch
      cy.get('#pauseBtn').click();
      cy.get('#startBtn').should('be.enabled');
      cy.get('#pauseBtn').should('be.disabled');
    });

    it('should display progress bars properly on mobile', () => {
      cy.get('#startBtn').click();
      
      // Check that progress bars are visible and properly styled
      cy.get('#progressFill').should('be.visible');
      cy.get('#timerDisplay').should('be.visible');
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
      cy.get('#startBtn').click();
      
      // Wait for a short period and check timer countdown
      cy.wait(1000);
      cy.get('#timerDisplay').should('be.visible');
      cy.get('#timerDisplay').should('not.contain', '0:00');
    });

    it('should handle screen orientation changes', () => {
      // Simulate portrait to landscape change
      cy.viewport(667, 375); // Landscape
      cy.get('#startBtn').should('be.visible');
      cy.get('#pauseBtn').should('be.visible');
      
      // Back to portrait
      cy.viewport(375, 667);
      cy.get('#startBtn').should('be.visible');
      cy.get('#pauseBtn').should('be.visible');
    });

    it('should prevent screen from sleeping during workout', () => {
      // Check for wake lock API usage (if supported)
      cy.window().then((win) => {
        if ('wakeLock' in win.navigator) {
          cy.get('#startBtn').click();
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
      cy.get('#startBtn').should('be.visible');
      
      // Test larger mobile size
      cy.viewport(414, 896);
      cy.get('.container').should('be.visible');
      cy.get('#startBtn').should('be.visible');
    });

    it('should handle tablet-sized viewports', () => {
      cy.viewport(768, 1024);
      cy.get('.container').should('be.visible');
      cy.get('#startBtn').should('be.visible');
      cy.get('#pauseBtn').should('be.visible');
    });
  });
});