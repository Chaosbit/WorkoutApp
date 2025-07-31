/**
 * WorkoutContextComponent - A web component for displaying workout context information
 * Shows previous/next exercises and total workout time remaining
 */
export class WorkoutContextComponent extends HTMLElement {
    constructor() {
        super();
        
        // Component state
        this.workout = null;
        this.currentExerciseIndex = 0;
        this.isRunning = false;
        this.timeRemaining = 0;
        
        // Create shadow DOM for encapsulation
        this.attachShadow({ mode: 'open' });
        
        // Initialize component
        this.render();
    }
    
    /**
     * Define observed attributes for reactive updates
     */
    static get observedAttributes() {
        return ['current-exercise-index', 'is-running', 'time-remaining'];
    }
    
    /**
     * Handle attribute changes
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        switch (name) {
            case 'current-exercise-index':
                this.currentExerciseIndex = parseInt(newValue) || 0;
                this.updateContext();
                break;
            case 'is-running':
                this.isRunning = newValue === 'true';
                this.updateTimeRemaining();
                break;
            case 'time-remaining':
                this.timeRemaining = parseInt(newValue) || 0;
                this.updateTimeRemaining();
                break;
        }
    }
    
    /**
     * Set workout data
     */
    setWorkout(workout) {
        this.workout = workout;
        this.updateContext();
        this.updateTimeRemaining();
        this.updateVisibility();
    }
    
    /**
     * Update exercise context (previous/next)
     */
    updateContext() {
        if (!this.workout || !this.workout.exercises || this.workout.exercises.length === 0) {
            return;
        }
        
        const previousNameElement = this.shadowRoot.querySelector('#previousExerciseName');
        const nextNameElement = this.shadowRoot.querySelector('#nextExerciseName');
        
        // Update previous exercise
        if (this.currentExerciseIndex > 0) {
            const prevExercise = this.workout.exercises[this.currentExerciseIndex - 1];
            previousNameElement.textContent = prevExercise.name;
        } else {
            previousNameElement.textContent = '-';
        }
        
        // Update next exercise
        if (this.currentExerciseIndex < this.workout.exercises.length - 1) {
            const nextExercise = this.workout.exercises[this.currentExerciseIndex + 1];
            nextNameElement.textContent = nextExercise.name;
        } else {
            nextNameElement.textContent = '-';
        }
    }
    
    /**
     * Update workout time remaining display
     */
    updateTimeRemaining() {
        const timeRemainingElement = this.shadowRoot.querySelector('#workoutTimeRemaining');
        
        if (!this.workout || !this.workout.exercises) {
            timeRemainingElement.style.display = 'none';
            return;
        }
        
        let remainingTime = 0;
        
        // Add time from current exercise if it's timer-based and running
        const currentExercise = this.workout.exercises[this.currentExerciseIndex];
        if (currentExercise && currentExercise.exerciseType !== 'reps' && this.isRunning) {
            remainingTime += this.timeRemaining;
        } else if (currentExercise && currentExercise.exerciseType !== 'reps' && !this.isRunning) {
            // If not running, add full duration of current exercise
            remainingTime += currentExercise.duration || 0;
        }
        
        // Add time from all remaining exercises
        for (let i = this.currentExerciseIndex + 1; i < this.workout.exercises.length; i++) {
            const exercise = this.workout.exercises[i];
            if (exercise.exerciseType !== 'reps') {
                remainingTime += exercise.duration || 0;
            }
        }
        
        if (remainingTime > 0) {
            timeRemainingElement.textContent = `Time remaining: ${this.formatTime(remainingTime)}`;
            timeRemainingElement.style.display = 'block';
        } else {
            timeRemainingElement.style.display = 'none';
        }
    }
    
    /**
     * Update component visibility based on workout state
     */
    updateVisibility() {
        const container = this.shadowRoot.querySelector('.workout-context');
        if (this.workout && this.workout.exercises && this.workout.exercises.length > 0) {
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    }
    
    /**
     * Format time in MM:SS format
     */
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
                
                .workout-context {
                    background: var(--md-sys-color-surface-container-lowest, #ffffff);
                    border: 1px solid var(--md-sys-color-outline-variant, #CAC4D0);
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    display: none;
                }
                
                .exercise-navigation {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                
                .exercise-nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 12px;
                    border-radius: 8px;
                    min-height: 60px;
                    justify-content: center;
                }
                
                .previous-exercise {
                    background: var(--md-sys-color-tertiary-container, #FFD8E4);
                    border-left: 4px solid var(--md-sys-color-tertiary, #7D5260);
                }
                
                .next-exercise {
                    background: var(--md-sys-color-secondary-container, #E8DEF8);
                    border-right: 4px solid var(--md-sys-color-secondary, #625B71);
                }
                
                .exercise-label {
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--md-sys-color-on-surface-variant, #49454F);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                }
                
                .exercise-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--md-sys-color-on-surface, #1C1B1F);
                    text-align: center;
                    line-height: 1.2;
                }
                
                .progress-info {
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid var(--md-sys-color-outline-variant, #CAC4D0);
                }
                
                #workoutTimeRemaining {
                    font-size: 14px;
                    color: var(--md-sys-color-primary, #6750A4);
                    font-weight: 500;
                    text-align: center;
                    display: none;
                }
                
                @media (max-width: 768px) {
                    .exercise-navigation {
                        gap: 12px;
                    }
                    
                    .exercise-nav-item {
                        padding: 8px;
                        min-height: 50px;
                    }
                    
                    .exercise-name {
                        font-size: 13px;
                    }
                }
            </style>
            
            <div class="workout-context">
                <div class="exercise-navigation">
                    <div class="exercise-nav-item previous-exercise">
                        <span class="exercise-label">Previous</span>
                        <span class="exercise-name" id="previousExerciseName">-</span>
                    </div>
                    <div class="exercise-nav-item next-exercise">
                        <span class="exercise-label">Next</span>
                        <span class="exercise-name" id="nextExerciseName">-</span>
                    </div>
                </div>
                <div class="progress-info">
                    <div id="workoutTimeRemaining">Time remaining: 0:00</div>
                </div>
            </div>
        `;
    }
}

// Register the custom element
customElements.define('workout-context', WorkoutContextComponent);