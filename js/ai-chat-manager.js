/**
 * AI Chat Manager
 * Provides AI-powered workout assistance through generative AI (online LLM or device-based)
 * Falls back to pattern matching for offline functionality
 */
export class AIChatManager {
    constructor(workoutApp) {
        this.workoutApp = workoutApp;
        this.messages = [];
        this.isThinking = false;
        
        // AI Provider configuration
        this.aiConfig = {
            proxyUrl: localStorage.getItem('aiProxyUrl') || '',
            provider: localStorage.getItem('aiProvider') || 'openai', // openai, gemini, anthropic
            apiKey: localStorage.getItem('aiApiKey') || '',
            model: localStorage.getItem('aiModel') || 'gpt-3.5-turbo'
        };
        
        // Online status tracking
        this.isOnline = navigator.onLine;
        window.addEventListener('online', () => { this.isOnline = true; });
        window.addEventListener('offline', () => { this.isOnline = false; });
        


        this.initializeElements();
        this.bindEvents();
        this.showSuggestions();
        this.checkAIConfiguration();
    }

    /**
     * Check AI configuration and show settings if needed
     */
    checkAIConfiguration() {
        if (!this.aiConfig.proxyUrl || !this.aiConfig.apiKey) {
            const configSuggestion = [{
                action: 'configure_ai',
                data: {},
                icon: 'settings',
                label: 'Setup AI Assistant'
            }];
            
            this.addMessage(
                '<p>🤖 <strong>Welcome to AI Workout Assistant!</strong></p>' +
                '<p>To get personalized workout advice, you need to set up the AI assistant with your preferred provider.</p>' +
                '<p><strong>Note:</strong> A proxy server is required due to browser security limitations. <a href="https://github.com/Chaosbit/WorkoutApp/blob/main/AI_SETUP.md" target="_blank">See setup guide</a></p>',
                'ai',
                configSuggestion
            );
        }
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.messagesContainer = document.getElementById('aiChatMessages');
        this.chatInput = document.getElementById('aiChatInput');
        this.sendButton = document.getElementById('aiChatSendBtn');
        this.statusIndicator = document.getElementById('aiChatStatus');
        this.suggestionsContainer = document.getElementById('aiChatSuggestions');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        if (!this.chatInput) return;

        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Bind suggestion chips
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-chip') || 
                e.target.closest('.suggestion-chip')) {
                const chip = e.target.closest('.suggestion-chip') || e.target;
                const suggestion = chip.dataset.suggestion;
                if (suggestion) {
                    this.chatInput.value = suggestion;
                    this.sendMessage();
                }
            }
        });
    }

    /**
     * Send a message to the AI
     */
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        this.hideSuggestions();

        // Show thinking indicator
        this.showThinking();

        // Simulate AI processing delay for offline mode only
        if (!this.aiConfig.useOnlineAI || !this.aiConfig.apiKey || !this.isOnline) {
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        }

        // Generate AI response
        const response = await this.generateResponse(message);
        this.hideThinking();
        this.addMessage(response.text, 'ai', response.suggestions);
    }

    /**
     * Add a message to the chat
     */
    addMessage(text, sender, suggestions = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;

        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble user-bubble">
                        <p>${this.escapeHtml(text)}</p>
                    </div>
                </div>
                <div class="message-avatar">
                    <span class="material-icons">person</span>
                </div>
            `;
        } else {
            let suggestionsHtml = '';
            if (suggestions && suggestions.length > 0) {
                suggestionsHtml = `
                    <div class="ai-suggestions">
                        <h5 class="md-typescale-title-small">Suggested Actions:</h5>
                        ${suggestions.map(suggestion => `
                            <button class="md-button md-button--outlined ai-suggestion-btn" 
                                    data-action="${suggestion.action}" 
                                    data-data="${JSON.stringify(suggestion.data).replace(/"/g, '&quot;')}">
                                <span class="material-icons md-button__icon">${suggestion.icon}</span>
                                <span class="md-button__label">${suggestion.label}</span>
                            </button>
                        `).join('')}
                    </div>
                `;
            }

            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <span class="material-icons">smart_toy</span>
                </div>
                <div class="message-content">
                    <div class="message-bubble ai-bubble">
                        ${text}
                        ${suggestionsHtml}
                    </div>
                </div>
            `;
        }

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();

        // Bind suggestion button events
        if (suggestions) {
            messageDiv.querySelectorAll('.ai-suggestion-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const action = btn.dataset.action;
                    const data = JSON.parse(btn.dataset.data.replace(/&quot;/g, '"'));
                    this.executeSuggestion(action, data);
                });
            });
        }

        this.messages.push({ text, sender, timestamp: Date.now(), suggestions });
    }

    /**
     * Generate AI response based on user input
     */
    async generateResponse(userMessage) {
        // Check if we have API configuration
        if (!this.aiConfig.apiKey) {
            return {
                text: '<p>❌ <strong>API Configuration Required</strong></p>' +
                      '<p>Please configure your AI provider with a valid API key to use the AI assistant.</p>',
                suggestions: [{
                    action: 'configure_ai',
                    data: {},
                    icon: 'settings', 
                    label: 'Configure AI'
                }]
            };
        }

        if (!this.isOnline) {
            return {
                text: '<p>🌐 <strong>Internet Connection Required</strong></p>' +
                      '<p>The AI assistant requires an internet connection to provide responses. Please check your connection and try again.</p>',
                suggestions: []
            };
        }

        try {
            return await this.generateAIResponse(userMessage);
        } catch (error) {
            console.error('AI API failed:', error);
            
            // Handle CORS errors specifically
            if (error.message.includes('CORS_ERROR:')) {
                return {
                    text: '<p>🚫 <strong>Browser Security Limitation</strong></p>' +
                          '<p>AI providers block direct browser connections for security reasons. To use AI features, you need to set up a simple proxy server.</p>' +
                          '<p><strong>Quick Setup Options:</strong></p>' +
                          '<ul>' +
                          '<li><strong>Vercel/Netlify Functions:</strong> Serverless proxy (recommended)</li>' +
                          '<li><strong>Local Node.js server:</strong> Simple Express proxy</li>' +
                          '<li><strong>Cloudflare Workers:</strong> Edge-based proxy</li>' +
                          '</ul>' +
                          '<p>See the <a href="#" onclick="window.open(\'https://github.com/Chaosbit/WorkoutApp/blob/main/AI_SETUP.md\', \'_blank\')">AI Setup Guide</a> for detailed instructions.</p>',
                    suggestions: [{
                        action: 'configure_ai',
                        data: {},
                        icon: 'settings',
                        label: 'Setup Guide'
                    }]
                };
            }
            
            return {
                text: '<p>❌ <strong>AI Service Error</strong></p>' +
                      '<p>There was an error communicating with the AI service. Please check your API key configuration and try again.</p>' +
                      `<p><small>Error: ${error.message}</small></p>`,
                suggestions: [{
                    action: 'configure_ai',
                    data: {},
                    icon: 'settings',
                    label: 'Check Configuration'
                }]
            };
        }
    }

    /**
     * Generate response using online AI service
     */
    async generateAIResponse(userMessage) {
        const workoutContext = this.workoutApp.workout ? this.getWorkoutContextForAI(this.workoutApp.workout) : null;
        
        // Build context for AI
        let systemPrompt = `You are a helpful fitness assistant for a workout timer app. You help users with:
- Exercise substitutions for injuries or equipment limitations
- Workout modifications to fit time constraints  
- Warm-up and cool-down suggestions
- General fitness advice
- Making workouts more or less challenging

Keep responses concise, practical, and focused on actionable advice. Use HTML formatting for better readability with <p>, <ul>, <li>, and <strong> tags.`;

        if (workoutContext) {
            systemPrompt += `\n\nCurrent workout context:
- Total exercises: ${workoutContext.exerciseCount}
- Estimated duration: ~${Math.round(workoutContext.totalDuration / 60)} minutes
- Exercise names: ${workoutContext.exerciseNames.join(', ')}`;
        }

        let response;
        switch (this.aiConfig.provider) {
            case 'openai':
                response = await this.callOpenAI(systemPrompt, userMessage);
                break;
            case 'gemini':
                response = await this.callGemini(systemPrompt, userMessage);
                break;
            case 'anthropic':
                response = await this.callAnthropic(systemPrompt, userMessage);
                break;
            default:
                throw new Error(`Unsupported AI provider: ${this.aiConfig.provider}`);
        }

        return { text: response, suggestions: [] };
    }

    /**
     * Get basic workout context for AI (simplified version)
     */
    getWorkoutContextForAI(workout) {
        if (!workout || !workout.exercises) return null;

        const exerciseNames = workout.exercises.map(ex => ex.name);
        const totalDuration = workout.exercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);
        
        return {
            exerciseCount: workout.exercises.length,
            exerciseNames,
            totalDuration
        };
    }

    /**
     * Call OpenAI API through proxy
     */
    async callOpenAI(systemPrompt, userMessage) {
        if (!this.aiConfig.proxyUrl) {
            throw new Error('CORS_ERROR: Proxy URL not configured. You need to set up a proxy server to use AI features. See the AI Chat documentation for setup instructions.');
        }

        try {
            const response = await fetch(this.aiConfig.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    provider: 'openai',
                    apiKey: this.aiConfig.apiKey,
                    body: {
                        model: this.aiConfig.model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userMessage }
                        ],
                        max_tokens: 500,
                        temperature: 0.7
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`OpenAI API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            if (error.message.includes('NetworkError') || error.message.includes('CORS') || error.name === 'TypeError') {
                throw new Error('CORS_ERROR: Cannot connect to proxy server. Please check your proxy URL configuration and ensure the server is running.');
            }
            throw error;
        }
    }

    /**
     * Call Google Gemini API through proxy
     */
    async callGemini(systemPrompt, userMessage) {
        if (!this.aiConfig.proxyUrl) {
            throw new Error('CORS_ERROR: Proxy URL not configured. You need to set up a proxy server to use AI features. See the AI Chat documentation for setup instructions.');
        }

        try {
            const response = await fetch(this.aiConfig.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    provider: 'gemini',
                    apiKey: this.aiConfig.apiKey,
                    body: {
                        contents: [{
                            parts: [{
                                text: `${systemPrompt}\n\nUser: ${userMessage}`
                            }]
                        }],
                        generationConfig: {
                            maxOutputTokens: 500,
                            temperature: 0.7
                        }
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Gemini API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            if (error.message.includes('NetworkError') || error.message.includes('CORS') || error.name === 'TypeError') {
                throw new Error('CORS_ERROR: Cannot connect to proxy server. Please check your proxy URL configuration and ensure the server is running.');
            }
            throw error;
        }
    }

    /**
     * Call Anthropic Claude API through proxy
     */
    async callAnthropic(systemPrompt, userMessage) {
        if (!this.aiConfig.proxyUrl) {
            throw new Error('CORS_ERROR: Proxy URL not configured. You need to set up a proxy server to use AI features. See the AI Chat documentation for setup instructions.');
        }

        try {
            const response = await fetch(this.aiConfig.proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    provider: 'anthropic',
                    apiKey: this.aiConfig.apiKey,
                    body: {
                        model: 'claude-3-haiku-20240307',
                        max_tokens: 500,
                        system: systemPrompt,
                        messages: [
                            { role: 'user', content: userMessage }
                        ]
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Anthropic API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
            }

            const data = await response.json();
            return data.content[0].text;
        } catch (error) {
            if (error.message.includes('NetworkError') || error.message.includes('CORS') || error.name === 'TypeError') {
                throw new Error('CORS_ERROR: Cannot connect to proxy server. Please check your proxy URL configuration and ensure the server is running.');
            }
            throw error;
        }
    }

















    /**
     * Execute an AI suggestion
     */
    executeSuggestion(action, data) {
        switch (action) {
            case 'configure_ai':
                this.showAIConfiguration();
                break;
            default:
                console.warn('Unknown suggestion action:', action);
                break;
        }
    }

    /**
     * Show AI configuration interface
     */
    showAIConfiguration() {
        const configHtml = `
            <div class="ai-config-form">
                <h4 class="md-typescale-title-medium">AI Configuration</h4>
                
                <div class="md-form-field">
                    <label class="md-form-field__label">Proxy Server URL:</label>
                    <input type="text" id="aiProxyUrlInput" class="md-text-field__input" 
                           value="${this.aiConfig.proxyUrl || ''}" placeholder="https://your-proxy.vercel.app/api/ai-proxy">
                    <small class="help-text">Required: Set up a proxy server to enable AI features. <a href="https://github.com/Chaosbit/WorkoutApp/blob/main/AI_SETUP.md" target="_blank">See setup guide</a></small>
                </div>
                
                <div class="md-form-field">
                    <label class="md-form-field__label">AI Provider:</label>
                    <select id="aiProviderSelect" class="md-select">
                        <option value="openai" ${this.aiConfig.provider === 'openai' ? 'selected' : ''}>OpenAI GPT</option>
                        <option value="gemini" ${this.aiConfig.provider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
                        <option value="anthropic" ${this.aiConfig.provider === 'anthropic' ? 'selected' : ''}>Anthropic Claude</option>
                    </select>
                </div>

                <div class="md-form-field">
                    <label class="md-form-field__label">API Key:</label>
                    <input type="password" id="aiApiKeyInput" class="md-text-field__input" 
                           value="${this.aiConfig.apiKey}" placeholder="Enter your API key">
                    <small class="help-text">Your API key is stored locally and never shared</small>
                </div>

                <div class="ai-config-actions">
                    <button class="md-button md-button--filled" id="saveAIConfig">
                        <span class="material-icons md-button__icon">save</span>
                        <span class="md-button__label">Save Configuration</span>
                    </button>
                    <button class="md-button md-button--outlined" id="testAIConfig">
                        <span class="material-icons md-button__icon">verified</span>
                        <span class="md-button__label">Test Connection</span>
                    </button>
                </div>
            </div>
        `;

        this.addMessage(configHtml, 'ai');

        // Bind configuration events
        setTimeout(() => {
            const proxyUrlInput = document.getElementById('aiProxyUrlInput');
            const providerSelect = document.getElementById('aiProviderSelect');
            const apiKeyInput = document.getElementById('aiApiKeyInput');
            const saveBtn = document.getElementById('saveAIConfig');
            const testBtn = document.getElementById('testAIConfig');

            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    this.saveAIConfiguration(proxyUrlInput.value, providerSelect.value, apiKeyInput.value);
                });
            }

            if (testBtn) {
                testBtn.addEventListener('click', () => {
                    this.testAIConnection(proxyUrlInput.value, providerSelect.value, apiKeyInput.value);
                });
            }
        }, 100);
    }

    /**
     * Save AI configuration
     */
    saveAIConfiguration(proxyUrl, provider, apiKey) {
        this.aiConfig.proxyUrl = proxyUrl;
        this.aiConfig.provider = provider;
        this.aiConfig.apiKey = apiKey;

        localStorage.setItem('aiProxyUrl', proxyUrl);
        localStorage.setItem('aiProvider', provider);
        localStorage.setItem('aiApiKey', apiKey);

        this.addMessage('<p>✅ <strong>Configuration saved!</strong> Your AI settings have been updated.</p>', 'ai');
    }

    /**
     * Test AI connection
     */
    async testAIConnection(proxyUrl, provider, apiKey) {
        if (!proxyUrl) {
            this.addMessage('<p>❌ <strong>Proxy URL required!</strong> Please enter your proxy server URL to test the connection. <a href="https://github.com/Chaosbit/WorkoutApp/blob/main/AI_SETUP.md" target="_blank">See setup guide</a></p>', 'ai');
            return;
        }
        
        if (!apiKey) {
            this.addMessage('<p>❌ <strong>API key required!</strong> Please enter your API key to test the connection.</p>', 'ai');
            return;
        }

        this.showThinking();
        // Save temporarily for testing
        const oldConfig = { ...this.aiConfig };
        try {
            this.aiConfig.proxyUrl = proxyUrl;
            this.aiConfig.provider = provider;
            this.aiConfig.apiKey = apiKey;

            const response = await this.generateAIResponse('Test connection - respond with "Connection successful!"');
            this.hideThinking();
            this.addMessage('<p>✅ <strong>Connection successful!</strong> Your AI provider is working correctly.</p>', 'ai');
            
        } catch (error) {
            this.hideThinking();
            this.addMessage(`<p>❌ <strong>Connection failed!</strong> ${error.message}</p>`, 'ai');
            // Restore old config
            this.aiConfig = oldConfig;
        }
    }





    // UI helper methods
    showThinking() {
        this.isThinking = true;
        this.statusIndicator.style.display = 'flex';
        this.sendButton.disabled = true;
    }

    hideThinking() {
        this.isThinking = false;
        this.statusIndicator.style.display = 'none';
        this.sendButton.disabled = false;
    }

    showSuggestions() {
        this.suggestionsContainer.style.display = 'block';
    }

    hideSuggestions() {
        this.suggestionsContainer.style.display = 'none';
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}