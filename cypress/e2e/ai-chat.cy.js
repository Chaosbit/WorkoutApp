describe('AI Chat Feature', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should display AI Chat tab and allow navigation', () => {
        // Check that AI Chat tab is visible
        cy.get('#aiChatTab').should('be.visible');
        cy.get('#aiChatTab').should('contain', 'AI Chat');
        
        // Click on AI Chat tab
        cy.get('#aiChatTab').click();
        
        // Verify AI Chat view is active
        cy.get('#aiChatView').should('have.class', 'active');
        cy.get('#workoutView').should('not.have.class', 'active');
        cy.get('#trainingPlanView').should('not.have.class', 'active');
        
        // Check AI Chat tab is marked as active
        cy.get('#aiChatTab').should('have.class', 'active');
        cy.get('#workoutsTab').should('not.have.class', 'active');
        cy.get('#trainingPlanTab').should('not.have.class', 'active');
    });

    it('should display AI Chat interface elements', () => {
        // Navigate to AI Chat
        cy.get('#aiChatTab').click();
        
        // Check main interface elements
        cy.get('#aiChatView h2').should('contain', 'AI Workout Assistant');
        cy.get('#aiChatView .ai-chat-subtitle').should('contain', 'Get personalized workout advice and modifications');
        
        // Check initial welcome message
        cy.get('.ai-message').should('be.visible');
        cy.get('.ai-message .message-bubble').should('contain', 'Hi! I\'m your AI workout assistant');
        
        // Check suggestion chips
        cy.get('.suggestion-chips').should('be.visible');
        cy.get('.suggestion-chip').should('have.length.at.least', 1);
        
        // Check input elements
        cy.get('#aiChatInput').should('be.visible');
        cy.get('#aiChatSendBtn').should('be.visible');
    });

    it('should handle chat input and responses', () => {
        // Navigate to AI Chat
        cy.get('#aiChatTab').click();
        
        // Type a message
        const testMessage = 'What are good push-up alternatives?';
        cy.get('#aiChatInput').type(testMessage);
        cy.get('#aiChatSendBtn').click();
        
        // Check user message appears
        cy.get('.user-message').should('be.visible');
        cy.get('.user-message .message-bubble').should('contain', testMessage);
        
        // Check thinking indicator appears briefly
        cy.get('#aiChatStatus').should('be.visible');
        cy.get('#aiChatStatus').should('contain', 'AI is thinking');
        
        // Wait for AI response
        cy.get('.ai-message').should('have.length.at.least', 2);
        
        // Check input is cleared
        cy.get('#aiChatInput').should('have.value', '');
    });

    it('should handle suggestion chip clicks', () => {
        // Navigate to AI Chat
        cy.get('#aiChatTab').click();
        
        // Click on a suggestion chip
        cy.get('.suggestion-chip').first().click();
        
        // Check that a user message was added
        cy.get('.user-message').should('be.visible');
        
        // Check that AI response appears
        cy.get('.ai-message').should('have.length.at.least', 2);
        
        // Check suggestions are hidden after use
        cy.get('#aiChatSuggestions').should('not.be.visible');
    });

    it('should navigate from navigation drawer to AI Chat', () => {
        // Open navigation drawer
        cy.get('#menuButton').click();
        cy.get('#navigationDrawer').should('have.class', 'open');
        
        // Click AI Chat in drawer
        cy.get('#navAIChat').click();
        
        // Check AI Chat view is active
        cy.get('#aiChatView').should('have.class', 'active');
        cy.get('#aiChatTab').should('have.class', 'active');
        
        // Check drawer is closed
        cy.get('#navigationDrawer').should('not.have.class', 'open');
    });

    it('should provide context-aware responses for different question types', () => {
        // Navigate to AI Chat
        cy.get('#aiChatTab').click();
        
        // Test substitution query
        cy.get('#aiChatInput').type('I need alternatives to push-ups for shoulder pain');
        cy.get('#aiChatSendBtn').click();
        
        // Wait for response with more flexible content check
        cy.get('.ai-message').should('have.length.at.least', 2);
        cy.get('.ai-message').last().should('contain.text', 'alternatives').or('contain.text', 'substitute');
        
        // Test time reduction query
        cy.get('#aiChatInput').type('How can I make this workout shorter?');
        cy.get('#aiChatSendBtn').click();
        
        // Wait for response with more flexible content check
        cy.get('.ai-message').should('have.length.at.least', 3);
        cy.get('.ai-message').last().should('contain.text', 'time').or('contain.text', 'workout').or('contain.text', 'reduce');
        
        // Test warm-up query
        cy.get('#aiChatInput').type('What warm-up should I do?');
        cy.get('#aiChatSendBtn').click();
        
        // Wait for response with more flexible content check
        cy.get('.ai-message').should('have.length.at.least', 4);
        cy.get('.ai-message').last().should('contain.text', 'warm').or('contain.text', 'exercise');
    });
});