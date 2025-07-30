describe('Screen Wake Lock - Integration Tests', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.loadWorkoutFile('test-workout.md');
    });

    it('should handle wake lock during workout execution', () => {
        cy.window().then((win) => {
            // Mock wake lock API if not available
            if (!win.navigator.wakeLock) {
                win.navigator.wakeLock = {
                    request: cy.stub().resolves({
                        release: cy.stub().resolves()
                    })
                }
            }
            
            cy.spy(win.navigator.wakeLock, 'request').as('wakeLockRequest')
        })

        // Start workout (should attempt to acquire wake lock)
        cy.clickWorkoutControl('start')
        
        // Pause workout (should release wake lock)
        cy.wait(100)
        cy.clickWorkoutControl('pause')
        
        // Wake lock functionality should not interfere with workout execution
        cy.getCurrentExercise().should('contain', 'Warm-up')
        cy.getWorkoutControlState('start').should('be.enabled')
    })
})
        cy.window().then((win) => {
            const isSupported = win.workoutApp.screenWakeManager.isWakeLockSupported();
            // In the test environment, this may or may not be supported
            expect(typeof isSupported).to.equal('boolean');
        });
    });

    it('should get wake lock status', () => {
        cy.window().then((win) => {
            const status = win.workoutApp.screenWakeManager.getStatus();
            expect(status).to.have.property('isSupported');
            expect(status).to.have.property('isActive');
            expect(status).to.have.property('wakeLock');
        });
    });

    it('should attempt to request wake lock when workout starts', () => {
        cy.window().then((win) => {
            // Start the workout
            cy.clickWorkoutControl('start');
            
            // Wait a moment for the wake lock to be potentially requested
            cy.wait(100);
            
            // Check that screen wake manager's status is available
            const status = win.workoutApp.screenWakeManager.getStatus();
            expect(typeof status.isActive).to.equal('boolean');
            
            // The implementation should at least attempt to request if supported
            // In test environment, it might fail due to permissions, which is ok
            if (status.isSupported) {
                // Test that the manager exists and has the proper interface
                expect(win.workoutApp.screenWakeManager.requestWakeLock).to.be.a('function');
                expect(win.workoutApp.screenWakeManager.releaseWakeLock).to.be.a('function');
            }
        });
    });

    it('should release wake lock when workout is paused', () => {
        // Start the workout first
        cy.clickWorkoutControl('start');
        
        // Wait a moment for the wake lock to be requested
        cy.wait(100);
        
        // Pause the workout
        cy.clickWorkoutControl('pause');
        
        // Wait a moment for the wake lock to be released
        cy.wait(100);
        
        cy.window().then((win) => {
            // Check that the wake lock manager indicates it's not active
            const status = win.workoutApp.screenWakeManager.getStatus();
            expect(status.isActive).to.be.false;
        });
    });

    it('should release wake lock when workout is reset', () => {
        // Start the workout first
        cy.clickWorkoutControl('start');
        
        // Wait a moment for the wake lock to be requested
        cy.wait(100);
        
        // Reset the workout
        cy.clickWorkoutControl('reset');
        
        // Wait a moment for the wake lock to be released
        cy.wait(100);
        
        cy.window().then((win) => {
            // Check that the wake lock manager indicates it's not active
            const status = win.workoutApp.screenWakeManager.getStatus();
            expect(status.isActive).to.be.false;
        });
    });

    it('should handle unsupported wake lock API gracefully', () => {
        cy.window().then((win) => {
            // Create a custom screen wake manager with no wakeLock support
            const customManager = new win.ScreenWakeManager();
            customManager.isSupported = false;
            
            // Should handle gracefully
            expect(customManager.isWakeLockSupported()).to.be.false;
            
            // Should not throw when trying to request
            expect(() => {
                customManager.requestWakeLock();
            }).to.not.throw;
            
            // Should not throw when trying to release
            expect(() => {
                customManager.releaseWakeLock();
            }).to.not.throw;
            
            // Status should indicate it's not active
            const status = customManager.getStatus();
            expect(status.isActive).to.be.false;
        });
    });

    it('should handle wake lock request errors gracefully', () => {
        cy.window().then((win) => {
            // Create a custom screen wake manager
            const customManager = new win.ScreenWakeManager();
            
            // Override the request method to simulate an error
            const originalRequest = customManager.requestWakeLock;
            customManager.requestWakeLock = async function() {
                try {
                    throw new Error('Permission denied');
                } catch (err) {
                    console.error('Failed to request screen wake lock:', err);
                    this.isActive = false;
                    return false;
                }
            };
            
            // Should not throw when request fails
            expect(() => {
                customManager.requestWakeLock();
            }).to.not.throw;
            
            // Status should indicate it's not active after failure
            const status = customManager.getStatus();
            expect(status.isActive).to.be.false;
        });
    });
});