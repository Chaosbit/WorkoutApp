describe('PWA Features', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should have PWA manifest file', () => {
    cy.checkPWAManifest()
  })

  it('should have correct meta tags for PWA', () => {
    cy.get('meta[name="theme-color"]').should('have.attr', 'content', '#6750A4')
    cy.get('meta[name="apple-mobile-web-app-capable"]').should('have.attr', 'content', 'yes')
    cy.get('meta[name="mobile-web-app-capable"]').should('have.attr', 'content', 'yes')
    cy.get('link[rel="apple-touch-icon"]').should('exist')
    cy.get('link[rel="icon"]').should('exist')
  })

  it.skip('should register service worker', () => {
    cy.checkServiceWorker()
    
    cy.window().then((win) => {
      expect(win.navigator.serviceWorker.controller).to.not.be.null
    })
  })

  it('should have proper viewport meta tag', () => {
    cy.get('meta[name="viewport"]').should(
      'have.attr', 
      'content', 
      'width=device-width, initial-scale=1.0'
    )
  })

  it('should load manifest.json with correct properties', () => {
    cy.request('/manifest.json').then((response) => {
      expect(response.body.name).to.equal('Workout Timer')
      expect(response.body.short_name).to.equal('WorkoutTimer')
      expect(response.body.display).to.equal('standalone')
      expect(response.body.background_color).to.equal('#667eea')
      expect(response.body.theme_color).to.equal('#667eea')
      expect(response.body.icons).to.have.length(2)
      expect(response.body.start_url).to.equal('./index.html')
    })
  })

  it.skip('should have service worker available', () => {
    cy.request('/sw.js').then((response) => {
      expect(response.status).to.equal(200)
      expect(response.body).to.include('workout-timer-v1')
      expect(response.body).to.include('install')
      expect(response.body).to.include('fetch')
    })
  })

  it('should cache essential files for offline use', () => {
    cy.request('/sw.js').then((response) => {
      const swContent = response.body
      expect(swContent).to.include('index.html')
      expect(swContent).to.include('styles.css')
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

  it.skip('should handle offline scenarios gracefully', () => {
    cy.loadWorkoutFile('test-workout.md')
    
    cy.intercept('GET', '**', { forceNetworkError: true }).as('networkError')
    
    cy.reload()
    
    cy.get('h1').should('contain', '🏋️ Workout Timer')
    cy.get('#workoutFile').should('exist')
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

  it.skip('should work with touch interactions on mobile', () => {
    cy.viewport('iphone-x')
    cy.loadWorkoutFile('test-workout.md')
    
    cy.get('#startBtn').trigger('touchstart').trigger('touchend')
    cy.get('#startBtn').should('be.disabled')
    cy.get('#pauseBtn').should('be.enabled')
    
    cy.get('#pauseBtn').trigger('touchstart').trigger('touchend')
    cy.get('#startBtn').should('be.enabled')
    cy.get('#pauseBtn').should('be.disabled')
  })
})