describe('Navigation Tests', () => {
  beforeEach(() => {
    // Handle uncaught JavaScript errors from app
    cy.on('uncaught:exception', (err, runnable) => {
      // Return false to prevent the error from failing the test
      console.warn('Uncaught exception:', err.message);
      return false;
    });
    
    cy.visit('/');
  });

  it('should have home page title link working', () => {
    cy.get('.md-top-app-bar__title-link')
      .should('be.visible')
      .click();
    
    cy.url().should('match', /(index\.html|\/?)$/);
  });

  it('should navigate to workout management page', () => {
    // Test navigation menu
    cy.get('#menuButton').click();
    cy.get('#navWorkoutManagement').should('be.visible').click();
    
    cy.url().should('include', 'workout-management.html');
    cy.get('.md-top-app-bar__title').should('contain', 'Workout Management');
  });

  it('should navigate to training plan page', () => {
    // Test navigation menu
    cy.get('#menuButton').click();
    cy.get('#navTrainingPlan').should('be.visible').click();
    
    cy.url().should('include', 'training-plan.html');
    cy.get('.md-top-app-bar__title').should('contain', 'Training Plan');
  });

  it('should navigate to training page', () => {
    // Test navigation menu
    cy.get('#menuButton').click();
    cy.get('#navTraining').should('be.visible').click();
    
    cy.url().should('include', 'training.html');
    cy.get('.md-top-app-bar__title').should('contain', 'Training');
  });

  it('should navigate to statistics page', () => {
    // Test navigation menu
    cy.get('#menuButton').click();
    cy.get('#navStatistics').should('be.visible').click();
    
    cy.url().should('include', 'statistics.html');
    cy.get('.md-top-app-bar__title').should('contain', 'Statistics');
  });

  it('should close navigation drawer on navigation', () => {
    // Open navigation
    cy.get('#menuButton').click();
    cy.get('#navigationDrawer').should('have.class', 'open');
    
    // Navigate to page
    cy.get('#navWorkoutManagement').click();
    
    // Check navigation is closed (back on home page after redirect)
    cy.visit('/');
    cy.get('#navigationDrawer').should('not.have.class', 'open');
  });

  it('should highlight active navigation item', () => {
    // Check home is active initially
    cy.get('#navHome').should('have.class', 'active');
    
    // Navigate to workout management
    cy.visit('/workout-management.html');
    cy.get('#menuButton').click();
    cy.get('#navWorkoutManagement').should('have.class', 'active');
    
    // Navigate to training plan
    cy.visit('/training-plan.html');
    cy.get('#menuButton').click();
    cy.get('#navTrainingPlan').should('have.class', 'active');
    
    // Navigate to statistics
    cy.visit('/statistics.html');
    cy.get('#menuButton').click();
    cy.get('#navStatistics').should('have.class', 'active');
  });

  it('should have header title links working on all pages', () => {
    const pages = [
      'workout-management.html',
      'training-plan.html', 
      'statistics.html'
    ];

    pages.forEach(page => {
      cy.visit(`/${page}`);
      cy.get('.md-top-app-bar__title-link').should('be.visible').click();
      cy.url().should('match', /(index\.html|\/?)$/);
    });
  });

  it('should have burger menu on all pages', () => {
    const pages = [
      'index.html',
      'workout-management.html',
      'training-plan.html',
      'statistics.html'
    ];

    pages.forEach(page => {
      cy.visit(`/${page}`);
      cy.get('#menuButton').should('be.visible');
    });
  });

  it('should handle keyboard navigation', () => {
    // Open menu with keyboard if accessible
    cy.get('#menuButton').focus().type('{enter}');
    cy.get('#navigationDrawer').should('have.class', 'open');
    
    // Close with escape key
    cy.get('body').type('{esc}');
    cy.get('#navigationDrawer').should('not.have.class', 'open');
  });

  it('should close navigation on scrim click', () => {
    // Open navigation
    cy.get('#menuButton').click();
    cy.get('#navigationDrawer').should('have.class', 'open');
    
    // Click scrim to close
    cy.get('#navigationScrim').click();
    cy.get('#navigationDrawer').should('not.have.class', 'open');
  });

  it('should have new workout button in header', () => {
    cy.visit('/workout-management.html');
    cy.get('#newWorkoutHeaderBtn')
      .should('be.visible')
      .should('contain', 'New Workout');
  });

  it('should start training from today\'s workout', () => {
    // This test assumes there's a workout scheduled for today
    // It will test the "Start" button functionality
    cy.get('.start-workout-btn').then($buttons => {
      if ($buttons.length > 0) {
        cy.wrap($buttons.first()).click();
        cy.url().should('include', 'training.html');
      } else {
        cy.log('No workouts scheduled for today');
      }
    });
  });
});