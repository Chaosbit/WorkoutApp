describe('Audio Features', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.loadWorkoutFile('test-workout.md')
  })

  it('should initialize audio context', () => {
    cy.window().then((win) => {
      expect(win.AudioContext || win.webkitAudioContext).to.exist
    })
  })

  it('should have audio functionality in WorkoutTimer', () => {
    cy.window().its('WorkoutTimer').should('exist')
    
    cy.window().then((win) => {
      const app = new win.WorkoutTimer()
      expect(app.audioContext).to.exist
      expect(app.playSound).to.be.a('function')
      expect(app.playCompletionSound).to.be.a('function')
    })
  })

  it('should play sound when exercise completes', () => {
    cy.window().then((win) => {
      cy.spy(win.AudioContext.prototype, 'createOscillator').as('createOscillator')
      cy.spy(win.AudioContext.prototype, 'createGain').as('createGain')
    })
    
    cy.clickWorkoutControl('start')
    cy.clickWorkoutControl('skip')
    
    cy.get('@createOscillator').should('have.been.called')
    cy.get('@createGain').should('have.been.called')
  })

  it('should play completion sound when workout finishes', () => {
    cy.window().then((win) => {
      cy.spy(win.AudioContext.prototype, 'createOscillator').as('createOscillator')
    })
    
    cy.clickWorkoutControl('start')
    
    for (let i = 0; i < 6; i++) {
      cy.clickWorkoutControl('skip')
      cy.wait(100)
    }
    
    cy.get('@createOscillator').should('have.been.called')
  })

  it('should handle audio errors gracefully', () => {
    cy.window().then((win) => {
      cy.stub(win.AudioContext.prototype, 'createOscillator').throws(new Error('Audio error'))
      cy.spy(win.console, 'warn').as('consoleWarn')
    })
    
    cy.clickWorkoutControl('start')
    cy.clickWorkoutControl('skip')
    
    cy.get('@consoleWarn').should('have.been.calledWith', 'Error playing sound:', Cypress.sinon.match.instanceOf(Error))
  })

  it('should resume audio context when suspended', () => {
    cy.window().then((win) => {
      const mockAudioContext = {
        state: 'suspended',
        resume: cy.stub().resolves(),
        createOscillator: cy.stub().returns({
          connect: cy.stub(),
          start: cy.stub(),
          stop: cy.stub(),
          frequency: { setValueAtTime: cy.stub() },
          type: 'sine'
        }),
        createGain: cy.stub().returns({
          connect: cy.stub(),
          gain: { 
            setValueAtTime: cy.stub(), 
            exponentialRampToValueAtTime: cy.stub() 
          }
        }),
        destination: {},
        currentTime: 0
      }
      
      win.audioContextMock = mockAudioContext
    })
    
    cy.window().then((win) => {
      const timer = new win.WorkoutTimer()
      timer.audioContext = win.audioContextMock
      timer.playSound()
      
      expect(win.audioContextMock.resume).to.have.been.called
    })
  })
})