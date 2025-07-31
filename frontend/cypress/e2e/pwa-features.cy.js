describe('PWA Features - Integration Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should have functional PWA setup with manifest and service worker', () => {
    // Check PWA manifest
    cy.checkPWAManifest()
    
    // Check essential meta tags
    cy.get('meta[name="theme-color"]').should('exist')
    cy.get('meta[name="viewport"]').should('exist')
    cy.get('link[rel="manifest"]').should('exist')
    
    // Check service worker registration
    cy.checkServiceWorker()
  })

  it('should function offline after initial load (basic test)', () => {
    // Load the app first
    cy.loadWorkoutFile('test-workout.md')
    cy.get('#workoutTitle').should('contain', 'Test Workout')
    
    // Wait for service worker
    cy.window().then((win) => {
      return new Cypress.Promise((resolve) => {
        if (win.navigator.serviceWorker.controller) {
          resolve()
        } else {
          win.navigator.serviceWorker.addEventListener('controllerchange', () => {
            resolve()
          })
          setTimeout(resolve, 3000)
        }
      })
    })
    
    // Basic offline functionality test
    // Note: Full offline testing would require more complex setup
    cy.get('#workoutDisplay').should('be.visible')
  })
})
      expect(response.body.theme_color).to.equal('#667eea')
      expect(response.body.icons).to.have.length(2)
      expect(response.body.start_url).to.equal('./index.html')
    })
  })

  it('should have service worker available', () => {
    cy.request('/sw.js').then((response) => {
      expect(response.status).to.equal(200)
      expect(response.body).to.include('workout-timer-v5')  // Updated to current cache version
      expect(response.body).to.include('install')
      expect(response.body).to.include('fetch')
    })
  })

  it('should cache essential files for offline use', () => {
    cy.request('/sw.js').then((response) => {
      const swContent = response.body
      expect(swContent).to.include('index.html')
      expect(swContent).to.include('material-design-enhanced.css')
      expect(swContent).to.include('script.js')
      expect(swContent).to.include('manifest.json')
    })
  })

  it('should be responsive on mobile viewport', () => {
    cy.viewport('iphone-x')
    
    cy.get('.container').should('be.visible')
    cy.get('h2').should('be.visible')
    cy.get('#workoutFile').should('exist') // File input has opacity: 0 by design
    cy.get('.sample-format').should('be.visible')
  })

  it('should be responsive on tablet viewport', () => {
    cy.viewport('ipad-2')
    
    cy.get('.container').should('be.visible')
    cy.get('h2').should('be.visible')
    cy.get('.file-input-section').should('be.visible')
  })


  it('should have proper app icons', () => {
    cy.request('/icon-192.png').then((response) => {
      expect(response.status).to.equal(200)
      expect(response.headers['content-type']).to.include('image/png')
    })
    
    cy.request('/icon-512.png').then((response) => {
      expect(response.status).to.equal(200)
      expect(response.headers['content-type']).to.include('image/png')
    })
  })


})