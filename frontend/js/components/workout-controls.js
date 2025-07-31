/**
 * WorkoutControlsComponent - A web component for workout control buttons
 * Encapsulates start, pause, skip, and reset functionality
 */
export class WorkoutControlsComponent extends HTMLElement {
    constructor() {
        super();
        
        // Component state
        this.isRunning = false;
        this.isPaused = false;
        this.canStart = false;
        this.canSkip = false;
        
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
        return ['is-running', 'is-paused', 'can-start', 'can-skip'];
    }
    
    /**
     * Handle attribute changes
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        switch (name) {
            case 'is-running':
                this.isRunning = newValue === 'true';
                this.updateButtonStates();
                break;
            case 'is-paused':
                this.isPaused = newValue === 'true';
                this.updateButtonStates();
                break;
            case 'can-start':
                this.canStart = newValue === 'true';
                this.updateButtonStates();
                break;
            case 'can-skip':
                this.canSkip = newValue === 'true';
                this.updateButtonStates();
                break;
        }
    }
    
    /**
     * Update button states based on current workout state
     */
    updateButtonStates() {
        const startBtn = this.shadowRoot.querySelector('#startBtn');
        const pauseBtn = this.shadowRoot.querySelector('#pauseBtn');
        const skipBtn = this.shadowRoot.querySelector('#skipBtn');
        const resetBtn = this.shadowRoot.querySelector('#resetBtn');
        
        if (!startBtn || !pauseBtn || !skipBtn || !resetBtn) return;
        
        // Start button - enabled when workout can start and not running
        startBtn.disabled = !this.canStart || this.isRunning;
        
        // Pause button - enabled when running
        pauseBtn.disabled = !this.isRunning;
        
        // Skip button - enabled when can skip (usually when running or paused)
        skipBtn.disabled = !this.canSkip;
        
        // Reset button - always enabled when workout is loaded
        resetBtn.disabled = !this.canStart;
        
        // Update start button text based on pause state
        const startBtnLabel = startBtn.querySelector('.button-label');
        const startBtnIcon = startBtn.querySelector('.material-icons');
        
        if (this.isPaused) {
            startBtnLabel.textContent = 'Resume';
            startBtnIcon.textContent = 'play_arrow';
        } else {
            startBtnLabel.textContent = 'Start';
            startBtnIcon.textContent = 'play_arrow';
        }
        
        // Update visual states
        this.updateVisualStates();
    }
    
    /**
     * Update visual states of buttons
     */
    updateVisualStates() {
        const startBtn = this.shadowRoot.querySelector('#startBtn');
        const pauseBtn = this.shadowRoot.querySelector('#pauseBtn');
        
        if (startBtn) {
            startBtn.classList.toggle('primary', !this.isRunning);
            startBtn.classList.toggle('secondary', this.isRunning);
        }
        
        if (pauseBtn) {
            pauseBtn.classList.toggle('active', this.isRunning);
        }
    }
    
    /**
     * Bind event handlers
     */
    bindEvents() {
        const startBtn = this.shadowRoot.querySelector('#startBtn');
        const pauseBtn = this.shadowRoot.querySelector('#pauseBtn');
        const skipBtn = this.shadowRoot.querySelector('#skipBtn');
        const resetBtn = this.shadowRoot.querySelector('#resetBtn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('workout-start', {
                    bubbles: true,
                    detail: { isPaused: this.isPaused }
                }));
            });
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('workout-pause', {
                    bubbles: true
                }));
            });
        }
        
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('workout-skip', {
                    bubbles: true
                }));
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('workout-reset', {
                    bubbles: true
                }));
            });
        }
    }
    
    /**
     * Set workout state from external source
     */
    setWorkoutState(state) {
        this.isRunning = state.isRunning || false;
        this.isPaused = state.isPaused || false;
        this.canStart = state.canStart || false;
        this.canSkip = state.canSkip || false;
        this.updateButtonStates();
    }
    
    /**
     * Enable/disable all controls
     */
    setEnabled(enabled) {
        const buttons = this.shadowRoot.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = !enabled;
        });
    }
    
    /**
     * Render the component
     */
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin: 20px 0;
                }
                
                .workout-controls {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    flex-wrap: wrap;
                    align-items: center;
                }
                
                .control-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 20px;
                    border: none;
                    border-radius: 24px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    min-width: 100px;
                    justify-content: center;
                    user-select: none;
                }
                
                .control-button:disabled {
                    opacity: 0.38;
                    cursor: not-allowed;
                    pointer-events: none;
                }
                
                .control-button.primary {
                    background: var(--md-sys-color-primary, #6750A4);
                    color: var(--md-sys-color-on-primary, #ffffff);
                    box-shadow: 0 2px 4px rgba(103, 80, 164, 0.3);
                }
                
                .control-button.primary:hover:not(:disabled) {
                    background: var(--md-sys-color-primary-container, #EADDFF);
                    color: var(--md-sys-color-on-primary-container, #21005D);
                    box-shadow: 0 4px 8px rgba(103, 80, 164, 0.4);
                    transform: translateY(-2px);
                }
                
                .control-button.secondary {
                    background: var(--md-sys-color-surface-variant, #E7E0EC);
                    color: var(--md-sys-color-on-surface-variant, #49454F);
                    border: 1px solid var(--md-sys-color-outline-variant, #CAC4D0);
                }
                
                .control-button.secondary:hover:not(:disabled) {
                    background: var(--md-sys-color-secondary-container, #E8DEF8);
                    color: var(--md-sys-color-on-secondary-container, #1D192B);
                    border-color: var(--md-sys-color-secondary, #625B71);
                }
                
                .control-button.outlined {
                    background: transparent;
                    color: var(--md-sys-color-primary, #6750A4);
                    border: 1px solid var(--md-sys-color-outline, #79747E);
                }
                
                .control-button.outlined:hover:not(:disabled) {
                    background: var(--md-sys-color-primary-container, #EADDFF);
                    color: var(--md-sys-color-on-primary-container, #21005D);
                    border-color: var(--md-sys-color-primary, #6750A4);
                }
                
                .control-button.active {
                    background: var(--md-sys-color-tertiary, #7D5260);
                    color: var(--md-sys-color-on-tertiary, #ffffff);
                    box-shadow: 0 2px 4px rgba(125, 82, 96, 0.3);
                }
                
                .control-button.active:hover:not(:disabled) {
                    background: var(--md-sys-color-tertiary-container, #FFD8E4);
                    color: var(--md-sys-color-on-tertiary-container, #31111D);
                }
                
                .material-icons {
                    font-size: 18px;
                }
                
                .button-label {
                    font-weight: 500;
                    letter-spacing: 0.1px;
                }
                
                /* Responsive design */
                @media (max-width: 768px) {
                    .workout-controls {
                        gap: 8px;
                        padding: 0 16px;
                    }
                    
                    .control-button {
                        padding: 10px 16px;
                        font-size: 14px;
                        min-width: 80px;
                    }
                    
                    .material-icons {
                        font-size: 16px;
                    }
                }
                
                @media (max-width: 480px) {
                    .workout-controls {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 8px;
                        max-width: 280px;
                        margin: 0 auto;
                    }
                    
                    .control-button {
                        width: 100%;
                        justify-content: center;
                    }
                }
            </style>
            
            <div class="workout-controls">
                <button id="startBtn" class="control-button primary" disabled>
                    <span class="material-icons">play_arrow</span>
                    <span class="button-label">Start</span>
                </button>
                
                <button id="pauseBtn" class="control-button outlined" disabled>
                    <span class="material-icons">pause</span>
                    <span class="button-label">Pause</span>
                </button>
                
                <button id="skipBtn" class="control-button outlined" disabled>
                    <span class="material-icons">skip_next</span>
                    <span class="button-label">Skip</span>
                </button>
                
                <button id="resetBtn" class="control-button outlined" disabled>
                    <span class="material-icons">refresh</span>
                    <span class="button-label">Reset</span>
                </button>
            </div>
        `;
    }
}

// Register the custom element
customElements.define('workout-controls', WorkoutControlsComponent);