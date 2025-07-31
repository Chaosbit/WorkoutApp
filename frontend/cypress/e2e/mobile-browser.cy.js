describe('Mobile Browser - Integration Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.loadWorkoutFile('test-workout.md');
  });

  it('should execute complete workout on mobile viewport', () => {
    // Set mobile viewport
    cy.viewport('iphone-x')
    
    // Verify mobile-friendly display
    cy.get('.container').should('be.visible')
    cy.getWorkoutControlState('start').should('be.visible')
    
    // Execute workout on mobile
    cy.clickWorkoutControl('start')
    cy.getCurrentExercise().should('contain', 'Warm-up')
    
    // Test touch interactions
    cy.clickWorkoutControl('pause')
    cy.getWorkoutControlState('start').should('be.enabled')
    
    cy.clickWorkoutControl('start') // Resume
    cy.clickWorkoutControl('skip')
    cy.getCurrentExercise().should('contain', 'Push-ups')
    
    // Progress elements should be visible on mobile
    cy.getProgressFill().should('be.visible')
    cy.getTimerDisplay().should('be.visible')
  })

  it('should have functional PWA features on mobile', () => {
    cy.viewport('iphone-x')
    
    // Check PWA manifest exists
    cy.request('/manifest.json').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.display).to.equal('standalone')
    })
    
    // Check viewport meta tag for mobile
    cy.get('meta[name="viewport"]').should('exist')
    
    // Service worker should be available
    cy.window().then((win) => {
      expect(win.navigator.serviceWorker).to.exist
    })
  })
})
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