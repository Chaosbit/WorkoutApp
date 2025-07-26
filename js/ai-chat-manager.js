/**
 * AI Chat Manager
 * Provides AI-like workout assistance through predefined knowledge patterns
 * Designed to work offline with local workout analysis
 */
export class AIChatManager {
    constructor(workoutApp) {
        this.workoutApp = workoutApp;
        this.messages = [];
        this.isThinking = false;
        
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

        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        // Generate AI response
        const response = this.generateResponse(message);
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
    generateResponse(userMessage) {
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