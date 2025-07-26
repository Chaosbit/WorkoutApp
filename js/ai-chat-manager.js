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
            provider: localStorage.getItem('aiProvider') || 'openai', // openai, gemini, anthropic, offline
            apiKey: localStorage.getItem('aiApiKey') || '',
            useOnlineAI: localStorage.getItem('useOnlineAI') !== 'false',
            model: localStorage.getItem('aiModel') || 'gpt-3.5-turbo'
        };
        
        // Online status tracking
        this.isOnline = navigator.onLine;
        window.addEventListener('online', () => { this.isOnline = true; });
        window.addEventListener('offline', () => { this.isOnline = false; });
        
        // Initialize exercise database for substitutions
        this.exerciseSubstitutions = {
            'push-ups': ['incline push-ups', 'wall push-ups', 'knee push-ups', 'chest press', 'resistance band chest press'],
            'pull-ups': ['assisted pull-ups', 'lat pulldowns', 'resistance band rows', 'inverted rows', 'bent-over rows'],
            'squats': ['chair squats', 'wall sits', 'leg press', 'lunges', 'step-ups'],
            'burpees': ['squat thrusts', 'mountain climbers', 'jumping jacks', 'high knees', 'step-ups'],
            'planks': ['wall planks', 'knee planks', 'dead bugs', 'bird dogs', 'glute bridges'],
            'lunges': ['reverse lunges', 'stationary lunges', 'chair-assisted lunges', 'wall squats', 'step-ups'],
            'jumping jacks': ['step touches', 'arm circles', 'marching in place', 'seated jacks', 'heel touches'],
            'mountain climbers': ['standing knee raises', 'seated leg extensions', 'marching in place', 'step touches', 'arm swings']
        };

        // Warm-up suggestions based on workout type
        this.warmupSuggestions = {
            'upper body': ['arm circles', 'shoulder rolls', 'arm swings', 'neck rolls', 'light arm movements'],
            'lower body': ['leg swings', 'hip circles', 'ankle rolls', 'marching in place', 'gentle squats'],
            'full body': ['jumping jacks', 'arm and leg swings', 'light stretching', 'marching in place', 'dynamic movements'],
            'cardio': ['light marching', 'arm swings', 'gentle movements', 'ankle rolls', 'easy stepping']
        };

        this.initializeElements();
        this.bindEvents();
        this.showSuggestions();
        this.checkAIConfiguration();
    }

    /**
     * Check AI configuration and show settings if needed
     */
    checkAIConfiguration() {
        if (this.aiConfig.useOnlineAI && !this.aiConfig.apiKey && this.isOnline) {
            const configSuggestion = [{
                action: 'configure_ai',
                data: {},
                icon: 'settings',
                label: 'Configure AI'
            }];
            
            this.addMessage(
                '<p>🔧 <strong>AI Configuration Needed</strong></p>' +
                '<p>To use advanced AI features, please configure your AI provider in settings. ' +
                'Until then, I\'ll use offline pattern matching to help with your workouts.</p>', 
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
        // Check if we should use online AI
        if (this.aiConfig.useOnlineAI && this.aiConfig.apiKey && this.isOnline) {
            try {
                return await this.generateAIResponse(userMessage);
            } catch (error) {
                console.warn('AI API failed, falling back to offline mode:', error);
                // Fall back to pattern matching
                return this.generateOfflineResponse(userMessage);
            }
        } else {
            // Use offline pattern matching
            return this.generateOfflineResponse(userMessage);
        }
    }

    /**
     * Generate response using online AI service
     */
    async generateAIResponse(userMessage) {
        const workoutContext = this.workoutApp.workout ? this.analyzeWorkout(this.workoutApp.workout) : null;
        
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
- Workout type: ${workoutContext.workoutType}
- Total duration: ~${Math.round(workoutContext.totalDuration / 60)} minutes
- Exercises: ${workoutContext.exercises.join(', ')}
- Has cardio: ${workoutContext.hasCardio ? 'Yes' : 'No'}`;
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
     * Call OpenAI API
     */
    async callOpenAI(systemPrompt, userMessage) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.aiConfig.apiKey}`
            },
            body: JSON.stringify({
                model: this.aiConfig.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    /**
     * Call Google Gemini API
     */
    async callGemini(systemPrompt, userMessage) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.aiConfig.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${systemPrompt}\n\nUser: ${userMessage}`
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 500,
                    temperature: 0.7
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    /**
     * Call Anthropic Claude API
     */
    async callAnthropic(systemPrompt, userMessage) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.aiConfig.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 500,
                system: systemPrompt,
                messages: [
                    { role: 'user', content: userMessage }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text;
    }

    /**
     * Generate response using offline pattern matching (fallback)
     */
    generateOfflineResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Analyze current workout if available
        const currentWorkout = this.workoutApp.workout;
        const workoutContext = currentWorkout ? this.analyzeWorkout(currentWorkout) : null;

        // Handle different types of questions
        if (this.isSubstitutionQuery(message)) {
            return this.handleSubstitutionQuery(message, workoutContext);
        } else if (this.isTimeReductionQuery(message)) {
            return this.handleTimeReductionQuery(message, workoutContext);
        } else if (this.isWarmupQuery(message)) {
            return this.handleWarmupQuery(message, workoutContext);
        } else if (this.isDifficultyQuery(message)) {
            return this.handleDifficultyQuery(message, workoutContext);
        } else if (this.isGeneralFitnessQuery(message)) {
            return this.handleGeneralFitnessQuery(message);
        } else {
            return this.handleGeneralResponse(message);
        }
    }

    /**
     * Analyze current workout to provide context
     */
    analyzeWorkout(workout) {
        if (!workout || !workout.exercises) return null;

        const exercises = workout.exercises.map(ex => ex.name.toLowerCase());
        const totalDuration = workout.exercises.reduce((sum, ex) => sum + (ex.duration || 0), 0);
        
        // Categorize workout type
        let workoutType = 'full body';
        const upperBodyExercises = ['push-ups', 'pull-ups', 'bench press', 'shoulder press', 'bicep curls'];
        const lowerBodyExercises = ['squats', 'lunges', 'deadlifts', 'leg press', 'calf raises'];
        
        const hasUpper = exercises.some(ex => upperBodyExercises.some(upper => ex.includes(upper)));
        const hasLower = exercises.some(ex => lowerBodyExercises.some(lower => ex.includes(lower)));
        
        if (hasUpper && !hasLower) workoutType = 'upper body';
        else if (hasLower && !hasUpper) workoutType = 'lower body';
        
        return {
            exercises,
            totalDuration,
            workoutType,
            hasCardio: exercises.some(ex => ex.includes('cardio') || ex.includes('running') || ex.includes('jumping'))
        };
    }

    /**
     * Handle exercise substitution queries
     */
    handleSubstitutionQuery(message, workoutContext) {
        const exercise = this.extractExerciseFromMessage(message);
        const reason = this.extractReasonFromMessage(message);
        
        let substitutions = [];
        if (exercise && this.exerciseSubstitutions[exercise]) {
            substitutions = this.exerciseSubstitutions[exercise];
        } else {
            // Try to find partial matches
            for (const [key, subs] of Object.entries(this.exerciseSubstitutions)) {
                if (message.includes(key) || key.includes(exercise)) {
                    substitutions = subs;
                    break;
                }
            }
        }

        if (substitutions.length === 0) {
            substitutions = ['modified bodyweight version', 'resistance band alternative', 'machine-based variation', 'lower-intensity option'];
        }

        let responseText = `<p>Here are some great alternatives${exercise ? ` for ${exercise}` : ''}:</p><ul>`;
        substitutions.slice(0, 5).forEach(sub => {
            responseText += `<li><strong>${sub.charAt(0).toUpperCase() + sub.slice(1)}</strong></li>`;
        });
        responseText += '</ul>';

        if (reason.includes('shoulder') || reason.includes('pain')) {
            responseText += '<p><strong>💡 Tip:</strong> Since you mentioned pain, please consult with a healthcare professional before making substitutions. Start with lower intensity alternatives.</p>';
        }

        const suggestions = [];
        if (workoutContext && exercise) {
            suggestions.push({
                action: 'substitute_exercise',
                data: { originalExercise: exercise, alternatives: substitutions.slice(0, 3) },
                icon: 'swap_horiz',
                label: 'Apply Substitution'
            });
        }

        return { text: responseText, suggestions };
    }

    /**
     * Handle time reduction queries
     */
    handleTimeReductionQuery(message, workoutContext) {
        const targetTime = this.extractTimeFromMessage(message);
        
        let responseText = '<p>Here are ways to reduce your workout time:</p><ul>';
        responseText += '<li><strong>Reduce rest periods</strong> - Cut rest time between exercises by 25-50%</li>';
        responseText += '<li><strong>Circuit training</strong> - Do exercises back-to-back with minimal rest</li>';
        responseText += '<li><strong>Supersets</strong> - Combine two exercises that work different muscle groups</li>';
        responseText += '<li><strong>Remove repetitions</strong> - Maintain exercise duration but skip some rounds</li>';
        responseText += '<li><strong>Focus on compound movements</strong> - Choose exercises that work multiple muscle groups</li>';
        responseText += '</ul>';

        if (workoutContext) {
            const currentMinutes = Math.round(workoutContext.totalDuration / 60);
            const targetMinutes = targetTime || 15;
            if (currentMinutes > targetMinutes) {
                const reductionNeeded = currentMinutes - targetMinutes;
                responseText += `<p><strong>Your workout analysis:</strong> Current duration is ~${currentMinutes} minutes. To reach ${targetMinutes} minutes, you need to reduce by ${reductionNeeded} minutes.</p>`;
            }
        }

        const suggestions = [];
        if (workoutContext) {
            suggestions.push({
                action: 'reduce_workout_time',
                data: { targetTime: targetTime || 15, currentDuration: workoutContext.totalDuration },
                icon: 'schedule',
                label: 'Create Shortened Version'
            });
        }

        return { text: responseText, suggestions };
    }

    /**
     * Handle warm-up queries
     */
    handleWarmupQuery(message, workoutContext) {
        let workoutType = 'full body';
        if (workoutContext) {
            workoutType = workoutContext.workoutType;
        }

        const warmups = this.warmupSuggestions[workoutType] || this.warmupSuggestions['full body'];
        
        let responseText = `<p>Great warm-up exercises for your ${workoutType} workout:</p><ul>`;
        warmups.forEach(warmup => {
            responseText += `<li><strong>${warmup.charAt(0).toUpperCase() + warmup.slice(1)}</strong> - 30-60 seconds</li>`;
        });
        responseText += '</ul>';
        responseText += '<p><strong>💡 Tip:</strong> Spend 5-10 minutes warming up to prevent injury and improve performance.</p>';

        const suggestions = [{
            action: 'add_warmup',
            data: { exercises: warmups, workoutType },
            icon: 'play_arrow',
            label: 'Add Warm-up to Workout'
        }];

        return { text: responseText, suggestions };
    }

    /**
     * Handle difficulty increase queries
     */
    handleDifficultyQuery(message, workoutContext) {
        let responseText = '<p>Ways to increase workout difficulty:</p><ul>';
        responseText += '<li><strong>Add weight</strong> - Use dumbbells, resistance bands, or weighted objects</li>';
        responseText += '<li><strong>Increase reps or duration</strong> - Add 25-50% more repetitions or time</li>';
        responseText += '<li><strong>Reduce rest time</strong> - Take shorter breaks between exercises</li>';
        responseText += '<li><strong>Add plyometric variations</strong> - Jump squats instead of squats, explosive push-ups</li>';
        responseText += '<li><strong>Increase range of motion</strong> - Deeper squats, fuller push-ups</li>';
        responseText += '<li><strong>Add instability</strong> - Single-leg variations, unstable surfaces</li>';
        responseText += '</ul>';

        const suggestions = [];
        if (workoutContext) {
            suggestions.push({
                action: 'increase_difficulty',
                data: { modifications: ['add_weight', 'increase_reps', 'reduce_rest'] },
                icon: 'trending_up',
                label: 'Apply Difficulty Mods'
            });
        }

        return { text: responseText, suggestions };
    }

    /**
     * Handle general fitness questions
     */
    handleGeneralFitnessQuery(message) {
        const responses = [
            {
                keywords: ['frequency', 'often', 'times', 'week'],
                response: '<p>For general fitness, aim for:</p><ul><li><strong>150 minutes</strong> of moderate aerobic activity per week</li><li><strong>2-3 strength training sessions</strong> per week</li><li><strong>Rest days</strong> between intense workouts</li><li><strong>Listen to your body</strong> - some weeks you might need more recovery</li></ul>'
            },
            {
                keywords: ['protein', 'nutrition', 'eat', 'diet'],
                response: '<p>Nutrition tips for fitness:</p><ul><li><strong>Protein:</strong> 0.8-1g per kg of body weight daily</li><li><strong>Timing:</strong> Eat protein within 30 minutes post-workout</li><li><strong>Hydration:</strong> Drink water before, during, and after exercise</li><li><strong>Balance:</strong> Include carbs for energy and healthy fats</li></ul>'
            },
            {
                keywords: ['recovery', 'rest', 'sleep', 'sore'],
                response: '<p>Recovery is crucial for fitness progress:</p><ul><li><strong>Sleep:</strong> 7-9 hours per night for muscle recovery</li><li><strong>Active recovery:</strong> Light walking or stretching on rest days</li><li><strong>Hydration:</strong> Helps reduce soreness and inflammation</li><li><strong>Listen to pain:</strong> Sharp pain = stop, muscle fatigue = normal</li></ul>'
            }
        ];

        for (const response of responses) {
            if (response.keywords.some(keyword => message.includes(keyword))) {
                return { text: response.response, suggestions: [] };
            }
        }

        return {
            text: '<p>I\'d be happy to help with your fitness questions! I can assist with exercise modifications, workout planning, and general fitness advice. What specific aspect would you like to know more about?</p>',
            suggestions: []
        };
    }

    /**
     * Handle general responses
     */
    handleGeneralResponse(message) {
        const responses = [
            "I'm here to help with your workout! Could you be more specific about what you'd like assistance with?",
            "Let me know if you need help with exercise modifications, workout timing, or fitness advice!",
            "I can help you customize your workout. What would you like to change or improve?",
            "Feel free to ask about exercise alternatives, workout duration, or any fitness concerns you have."
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        return { text: `<p>${randomResponse}</p>`, suggestions: [] };
    }

    /**
     * Execute an AI suggestion
     */
    executeSuggestion(action, data) {
        switch (action) {
            case 'configure_ai':
                this.showAIConfiguration();
                break;
            case 'substitute_exercise':
                this.handleExerciseSubstitution(data);
                break;
            case 'reduce_workout_time':
                this.handleWorkoutTimeReduction(data);
                break;
            case 'add_warmup':
                this.handleAddWarmup(data);
                break;
            case 'increase_difficulty':
                this.handleIncreaseDifficulty(data);
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
                    <label class="md-form-field__label">AI Provider:</label>
                    <select id="aiProviderSelect" class="md-select">
                        <option value="openai" ${this.aiConfig.provider === 'openai' ? 'selected' : ''}>OpenAI GPT</option>
                        <option value="gemini" ${this.aiConfig.provider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
                        <option value="anthropic" ${this.aiConfig.provider === 'anthropic' ? 'selected' : ''}>Anthropic Claude</option>
                        <option value="offline" ${this.aiConfig.provider === 'offline' ? 'selected' : ''}>Offline Only</option>
                    </select>
                </div>

                <div class="md-form-field" id="apiKeyField" style="${this.aiConfig.provider === 'offline' ? 'display: none' : ''}">
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
            const providerSelect = document.getElementById('aiProviderSelect');
            const apiKeyField = document.getElementById('apiKeyField');
            const apiKeyInput = document.getElementById('aiApiKeyInput');
            const saveBtn = document.getElementById('saveAIConfig');
            const testBtn = document.getElementById('testAIConfig');

            if (providerSelect) {
                providerSelect.addEventListener('change', () => {
                    apiKeyField.style.display = providerSelect.value === 'offline' ? 'none' : 'block';
                });
            }

            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    this.saveAIConfiguration(providerSelect.value, apiKeyInput.value);
                });
            }

            if (testBtn) {
                testBtn.addEventListener('click', () => {
                    this.testAIConnection(providerSelect.value, apiKeyInput.value);
                });
            }
        }, 100);
    }

    /**
     * Save AI configuration
     */
    saveAIConfiguration(provider, apiKey) {
        this.aiConfig.provider = provider;
        this.aiConfig.apiKey = apiKey;
        this.aiConfig.useOnlineAI = provider !== 'offline';

        localStorage.setItem('aiProvider', provider);
        localStorage.setItem('aiApiKey', apiKey);
        localStorage.setItem('useOnlineAI', this.aiConfig.useOnlineAI.toString());

        this.addMessage('<p>✅ <strong>Configuration saved!</strong> Your AI settings have been updated.</p>', 'ai');
    }

    /**
     * Test AI connection
     */
    async testAIConnection(provider, apiKey) {
        if (provider === 'offline') {
            this.addMessage('<p>✅ <strong>Offline mode enabled!</strong> Pattern matching is ready to help.</p>', 'ai');
            return;
        }

        if (!apiKey) {
            this.addMessage('<p>❌ <strong>API key required!</strong> Please enter your API key to test the connection.</p>', 'ai');
            return;
        }

        this.showThinking();
        try {
            // Save temporarily for testing
            const oldConfig = { ...this.aiConfig };
            this.aiConfig.provider = provider;
            this.aiConfig.apiKey = apiKey;
            this.aiConfig.useOnlineAI = true;

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

    /**
     * Handle exercise substitution suggestion
     */
    handleExerciseSubstitution(data) {
        // This would integrate with the workout editor
        this.addMessage(`Would you like me to replace "${data.originalExercise}" with one of these alternatives: ${data.alternatives.join(', ')}? You can edit your workout to make this change.`, 'ai');
    }

    /**
     * Handle workout time reduction suggestion
     */
    handleWorkoutTimeReduction(data) {
        const minutes = Math.round(data.currentDuration / 60);
        const targetMinutes = data.targetTime;
        this.addMessage(`I can help you reduce your ${minutes}-minute workout to ${targetMinutes} minutes. Would you like me to suggest specific exercises to shorten or remove?`, 'ai');
    }

    /**
     * Handle add warmup suggestion
     */
    handleAddWarmup(data) {
        const warmupList = data.exercises.join(', ');
        this.addMessage(`I recommend adding these warm-up exercises: ${warmupList}. Each should be done for 30-60 seconds before starting your main workout.`, 'ai');
    }

    /**
     * Handle increase difficulty suggestion
     */
    handleIncreaseDifficulty(data) {
        this.addMessage('I can suggest specific ways to make each exercise in your workout more challenging. Would you like me to go through your workout exercise by exercise?', 'ai');
    }

    // Helper methods for message analysis
    isSubstitutionQuery(message) {
        const substitutionKeywords = ['substitute', 'alternative', 'replace', 'instead of', 'can\'t do', 'unable to do', 'hurt', 'pain', 'injury', 'different exercise'];
        return substitutionKeywords.some(keyword => message.includes(keyword));
    }

    isTimeReductionQuery(message) {
        const timeKeywords = ['reduce', 'shorten', 'less time', 'quicker', 'faster', 'minutes', 'time constraint'];
        return timeKeywords.some(keyword => message.includes(keyword));
    }

    isWarmupQuery(message) {
        const warmupKeywords = ['warm up', 'warmup', 'warm-up', 'before workout', 'prepare', 'preparation'];
        return warmupKeywords.some(keyword => message.includes(keyword));
    }

    isDifficultyQuery(message) {
        const difficultyKeywords = ['harder', 'more difficult', 'challenging', 'intense', 'advanced', 'increase difficulty'];
        return difficultyKeywords.some(keyword => message.includes(keyword));
    }

    isGeneralFitnessQuery(message) {
        const fitnessKeywords = ['nutrition', 'diet', 'recovery', 'sleep', 'frequency', 'how often', 'protein', 'rest day'];
        return fitnessKeywords.some(keyword => message.includes(keyword));
    }

    extractExerciseFromMessage(message) {
        for (const exercise of Object.keys(this.exerciseSubstitutions)) {
            if (message.includes(exercise)) {
                return exercise;
            }
        }
        return null;
    }

    extractReasonFromMessage(message) {
        const reasons = ['shoulder', 'knee', 'back', 'wrist', 'ankle', 'pain', 'injury', 'hurt'];
        return reasons.find(reason => message.includes(reason)) || '';
    }

    extractTimeFromMessage(message) {
        const timeMatch = message.match(/(\d+)\s*min/);
        return timeMatch ? parseInt(timeMatch[1]) : null;
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