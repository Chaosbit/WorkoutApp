/**
 * TimerDisplayComponent - A web component for displaying exercise timer information
 * Encapsulates timer display, progress bar, exercise info, and reps completion
 */
export class TimerDisplayComponent extends HTMLElement {
    constructor() {
        super();
        
        // Component state
        this.currentExercise = null;
        this.timeRemaining = 0;
        this.totalTime = 0;
        this.isRunning = false;
        this.repsCompleted = 0;
        
        // Create shadow DOM for encapsulation
        this.attachShadow({ mode: 'open' });
        
        // Initialize component
        this.render();
        this.bindEvents();
    }
    
    /**
     * Define observed attributes for reactive updates
     */
    static get observedAttributes() {
        return ['time-remaining', 'total-time', 'is-running', 'reps-completed'];
    }
    
    /**
     * Handle attribute changes
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        switch (name) {
            case 'time-remaining':
                this.timeRemaining = parseInt(newValue) || 0;
                this.updateTimerDisplay();
                this.updateProgressBar();
                break;
            case 'total-time':
                this.totalTime = parseInt(newValue) || 0;
                this.updateProgressBar();
                break;
            case 'is-running':
                this.isRunning = newValue === 'true';
                this.updateRunningState();
                break;
            case 'reps-completed':
                this.repsCompleted = parseInt(newValue) || 0;
                this.updateRepsDisplay();
                break;
        }
    }
    
    /**
     * Set current exercise data
     */
    setExercise(exercise) {
        this.currentExercise = exercise;
        this.updateExerciseDisplay();
        this.updateVisibility();
    }
    
    /**
     * Update exercise information display
     */
    updateExerciseDisplay() {
        if (!this.currentExercise) return;
        
        const exerciseNameEl = this.shadowRoot.querySelector('#exerciseName');
        const descriptionEl = this.shadowRoot.querySelector('#exerciseDescription');
        const descriptionContentEl = this.shadowRoot.querySelector('#descriptionContent');
        const timerDisplayEl = this.shadowRoot.querySelector('#timerDisplay');
        const repsDisplayEl = this.shadowRoot.querySelector('#repsDisplay');
        const repCompletionEl = this.shadowRoot.querySelector('#repCompletion');
        
        if (exerciseNameEl) {
            exerciseNameEl.textContent = this.currentExercise.name || 'Exercise';
        }
        
        // Handle exercise description
        if (this.currentExercise.description && this.currentExercise.description.trim()) {
            descriptionEl.style.display = 'block';
            descriptionContentEl.innerHTML = this.currentExercise.description;
        } else {
            descriptionEl.style.display = 'none';
        }
        
        // Handle different exercise types
        const isRepBased = this.currentExercise.exerciseType === 'reps';
        
        if (isRepBased) {
            timerDisplayEl.style.display = 'none';
            repsDisplayEl.style.display = 'flex';
            repCompletionEl.style.display = 'block';
            this.updateRepsDisplay();
        } else {
            timerDisplayEl.style.display = 'block';
            repsDisplayEl.style.display = 'none';
            repCompletionEl.style.display = 'none';
            this.totalTime = this.currentExercise.duration || 0;
            this.timeRemaining = this.totalTime;
            this.updateTimerDisplay();
            this.updateProgressBar();
        }
    }
    
    /**
     * Update timer display
     */
    updateTimerDisplay() {
        const timerDisplayEl = this.shadowRoot.querySelector('#timerDisplay');
        if (timerDisplayEl) {
            timerDisplayEl.textContent = this.formatTime(this.timeRemaining);
        }
    }
    
    /**
     * Update progress bar
     */
    updateProgressBar() {
        const progressFillEl = this.shadowRoot.querySelector('#progressFill');
        if (progressFillEl && this.totalTime > 0) {
            const progress = Math.max(0, Math.min(100, ((this.totalTime - this.timeRemaining) / this.totalTime) * 100));
            progressFillEl.style.width = `${progress}%`;
        }
    }
    
    /**
     * Update reps display
     */
    updateRepsDisplay() {
        const repsCountEl = this.shadowRoot.querySelector('#repsCount');
        if (repsCountEl && this.currentExercise && this.currentExercise.exerciseType === 'reps') {
            const targetReps = this.currentExercise.reps || 0;
            repsCountEl.textContent = `${this.repsCompleted}/${targetReps}`;
        }
    }
    
    /**
     * Update running state visual indicators
     */
    updateRunningState() {
        const container = this.shadowRoot.querySelector('.timer-display-container');
        if (container) {
            container.classList.toggle('running', this.isRunning);
        }
    }
    
    /**
     * Update component visibility
     */
    updateVisibility() {
        const container = this.shadowRoot.querySelector('.timer-display-container');
        if (container) {
            container.style.display = this.currentExercise ? 'block' : 'none';
        }
    }
    
    /**
     * Format time as MM:SS
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Bind event handlers
     */
    bindEvents() {
        const descriptionToggle = this.shadowRoot.querySelector('.description-toggle');
        const completeRepBtn = this.shadowRoot.querySelector('#completeRepBtn');
        
        if (descriptionToggle) {
            descriptionToggle.addEventListener('click', () => {
                const descriptionEl = this.shadowRoot.querySelector('#exerciseDescription');
                descriptionEl.classList.toggle('expanded');
            });
        }
        
        if (completeRepBtn) {
            completeRepBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('rep-completed', {
                    bubbles: true,
                    detail: { exercise: this.currentExercise }
                }));
            });
        }
    }
    
    /**
     * Render the component
     */
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-bottom: 1rem;
                }
                
                .timer-display-container {
                    background: var(--md-sys-color-surface-container, #ffffff);
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    display: none;
                    transition: all 0.3s ease;
                }
                
                .timer-display-container.running {
                    box-shadow: 0 4px 12px rgba(103, 80, 164, 0.3);
                    border: 2px solid var(--md-sys-color-primary, #6750A4);
                }
                
                #exerciseName {
                    font-size: 28px;
                    font-weight: 600;
                    color: var(--md-sys-color-on-surface, #1C1B1F);
                    margin-bottom: 16px;
                    text-align: center;
                    line-height: 1.2;
                }
                
                #exerciseDescription {
                    margin-bottom: 20px;
                    display: none;
                }
                
                .description-toggle {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    background: var(--md-sys-color-surface-variant, #E7E0EC);
                    color: var(--md-sys-color-on-surface-variant, #49454F);
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                }
                
                .description-toggle:hover {
                    background: var(--md-sys-color-primary-container, #EADDFF);
                    color: var(--md-sys-color-on-primary-container, #21005D);
                }
                
                .expand-icon {
                    transition: transform 0.2s ease;
                }
                
                #exerciseDescription.expanded .expand-icon {
                    transform: rotate(180deg);
                }
                
                .description-content {
                    margin-top: 12px;
                    padding: 16px;
                    background: var(--md-sys-color-surface-container-lowest, #ffffff);
                    border-radius: 8px;
                    font-size: 14px;
                    line-height: 1.5;
                    color: var(--md-sys-color-on-surface-variant, #49454F);
                    display: none;
                }
                
                #exerciseDescription.expanded .description-content {
                    display: block;
                }
                
                #timerDisplay {
                    font-size: 48px;
                    font-weight: 700;
                    text-align: center;
                    margin: 20px 0;
                    color: var(--md-sys-color-primary, #6750A4);
                    font-feature-settings: 'tnum';
                    letter-spacing: -0.02em;
                }
                
                #repsDisplay {
                    display: none;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    margin: 20px 0;
                    font-size: 24px;
                    font-weight: 600;
                    color: var(--md-sys-color-primary, #6750A4);
                }
                
                #repsDisplay .material-icons {
                    font-size: 28px;
                }
                
                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: var(--md-sys-color-surface-variant, #E7E0EC);
                    border-radius: 4px;
                    overflow: hidden;
                    margin: 16px 0;
                }
                
                #progressFill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--md-sys-color-primary, #6750A4), var(--md-sys-color-secondary, #625B71));
                    border-radius: 4px;
                    transition: width 0.3s ease;
                    width: 0%;
                }
                
                #repCompletion {
                    display: none;
                    text-align: center;
                    margin-top: 20px;
                }
                
                #completeRepBtn {
                    background: var(--md-sys-color-primary, #6750A4);
                    color: var(--md-sys-color-on-primary, #ffffff);
                    border: none;
                    border-radius: 24px;
                    padding: 12px 24px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0 auto;
                    transition: all 0.2s ease;
                }
                
                #completeRepBtn:hover {
                    background: var(--md-sys-color-primary-container, #EADDFF);
                    color: var(--md-sys-color-on-primary-container, #21005D);
                    box-shadow: 0 2px 8px rgba(103, 80, 164, 0.3);
                }
                
                #completeRepBtn .material-icons {
                    font-size: 18px;
                }
                
                @media (max-width: 768px) {
                    .timer-display-container {
                        padding: 16px;
                    }
                    
                    #exerciseName {
                        font-size: 24px;
                    }
                    
                    #timerDisplay {
                        font-size: 40px;
                    }
                    
                    #repsDisplay {
                        font-size: 20px;
                    }
                }
            </style>
            
            <div class="timer-display-container">
                <h3 id="exerciseName">Exercise</h3>
                
                <div id="exerciseDescription">
                    <div class="description-toggle">
                        <span>Show Instructions</span>
                        <span class="material-icons expand-icon">expand_more</span>
                    </div>
                    <div class="description-content" id="descriptionContent"></div>
                </div>
                
                <div id="timerDisplay">00:00</div>
                
                <div id="repsDisplay">
                    <span class="material-icons">fitness_center</span>
                    <span id="repsCount">0/0</span> reps
                </div>
                
                <div class="progress-bar">
                    <div id="progressFill"></div>
                </div>
                
                <div id="repCompletion">
                    <button id="completeRepBtn">
                        <span class="material-icons">check</span>
                        <span>Complete Exercise</span>
                    </button>
                </div>
            </div>
        `;
    }
}

// Register the custom element
customElements.define('timer-display', TimerDisplayComponent);