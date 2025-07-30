/**
 * ExerciseListComponent - A web component for displaying workout exercise list
 * Encapsulates the list of exercises with progress indicators
 */
export class ExerciseListComponent extends HTMLElement {
    constructor() {
        super();
        
        // Component state
        this.workout = null;
        this.currentExerciseIndex = 0;
        this.completedExercises = new Set();
        
        // Create shadow DOM for encapsulation
        this.attachShadow({ mode: 'open' });
        
        // Initialize component
        this.render();
    }
    
    /**
     * Define observed attributes for reactive updates
     */
    static get observedAttributes() {
        return ['current-exercise-index'];
    }
    
    /**
     * Handle attribute changes
     */
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) return;
        
        switch (name) {
            case 'current-exercise-index':
                this.currentExerciseIndex = parseInt(newValue) || 0;
                this.updateExerciseStates();
                break;
        }
    }
    
    /**
     * Set workout data
     */
    setWorkout(workout) {
        this.workout = workout;
        this.completedExercises.clear();
        this.renderExerciseList();
        this.updateVisibility();
    }
    
    /**
     * Mark an exercise as completed
     */
    markExerciseCompleted(index) {
        this.completedExercises.add(index);
        this.updateExerciseStates();
    }
    
    /**
     * Reset all exercise states
     */
    resetExerciseStates() {
        this.completedExercises.clear();
        this.currentExerciseIndex = 0;
        this.updateExerciseStates();
    }
    
    /**
     * Update exercise states (current, completed, upcoming)
     */
    updateExerciseStates() {
        const exerciseItems = this.shadowRoot.querySelectorAll('.exercise-item');
        
        exerciseItems.forEach((item, index) => {
            const isCompleted = this.completedExercises.has(index);
            const isCurrent = index === this.currentExerciseIndex;
            const isUpcoming = index > this.currentExerciseIndex;
            
            item.classList.remove('current', 'completed', 'upcoming');
            
            if (isCompleted) {
                item.classList.add('completed');
            } else if (isCurrent) {
                item.classList.add('current');
            } else if (isUpcoming) {
                item.classList.add('upcoming');
            }
        });
        
        // Update progress info
        this.updateProgressInfo();
    }
    
    /**
     * Update progress information
     */
    updateProgressInfo() {
        const progressInfoEl = this.shadowRoot.querySelector('#progressInfo');
        if (progressInfoEl && this.workout && this.workout.exercises) {
            const totalExercises = this.workout.exercises.length;
            const currentExercise = this.currentExerciseIndex + 1;
            progressInfoEl.textContent = `Exercise ${currentExercise} of ${totalExercises}`;
        }
    }
    
    /**
     * Render the exercise list
     */
    renderExerciseList() {
        const listContainer = this.shadowRoot.querySelector('#exerciseList');
        if (!listContainer || !this.workout || !this.workout.exercises) {
            if (listContainer) listContainer.innerHTML = '';
            return;
        }
        
        const exercisesHtml = this.workout.exercises.map((exercise, index) => {
            const isRestExercise = exercise.type === 'rest' || exercise.name.toLowerCase().includes('rest');
            const exerciseNumber = isRestExercise ? '' : this.getNonRestExerciseNumber(index);
            const displayDuration = this.getDisplayDuration(exercise);
            const hasDescription = exercise.description && exercise.description.trim();
            
            if (isRestExercise) {
                return `
                    <div class="exercise-item rest-exercise" data-index="${index}">
                        <div class="exercise-content">
                            <div class="rest-indicator">
                                <span class="material-icons">pause_circle</span>
                            </div>
                            <div class="exercise-details">
                                <div class="exercise-name">💤 ${exercise.name}</div>
                                <div class="exercise-duration">${displayDuration}</div>
                            </div>
                        </div>
                        <div class="exercise-status">
                            <span class="material-icons status-icon">radio_button_unchecked</span>
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="exercise-item ${hasDescription ? 'has-description' : ''}" data-index="${index}">
                        <div class="exercise-content">
                            <div class="exercise-number">${exerciseNumber}</div>
                            <div class="exercise-details">
                                <div class="exercise-name">${exercise.name}</div>
                                <div class="exercise-duration ${exercise.exerciseType === 'reps' ? 'reps-based' : ''}">${displayDuration}</div>
                                ${hasDescription ? `
                                    <div class="exercise-description-preview">
                                        ${exercise.description.substring(0, 100)}${exercise.description.length > 100 ? '...' : ''}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        <div class="exercise-status">
                            <span class="material-icons status-icon">radio_button_unchecked</span>
                        </div>
                    </div>
                `;
            }
        }).join('');
        
        listContainer.innerHTML = exercisesHtml;
        this.bindExerciseEvents();
        this.updateExerciseStates();
    }
    
    /**
     * Get display duration for exercise
     */
    getDisplayDuration(exercise) {
        if (exercise.exerciseType === 'reps') {
            return `${exercise.reps} reps`;
        } else if (exercise.duration) {
            return this.formatTime(exercise.duration);
        }
        return '';
    }
    
    /**
     * Get non-rest exercise number
     */
    getNonRestExerciseNumber(index) {
        if (!this.workout || !this.workout.exercises) return '';
        
        let count = 0;
        for (let i = 0; i <= index; i++) {
            const exercise = this.workout.exercises[i];
            if (exercise.type !== 'rest' && !exercise.name.toLowerCase().includes('rest')) {
                count++;
            }
        }
        return count;
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
     * Bind exercise click events
     */
    bindExerciseEvents() {
        const exerciseItems = this.shadowRoot.querySelectorAll('.exercise-item');
        
        exerciseItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('exercise-selected', {
                    bubbles: true,
                    detail: { 
                        exerciseIndex: index,
                        exercise: this.workout ? this.workout.exercises[index] : null
                    }
                }));
            });
        });
    }
    
    /**
     * Update component visibility
     */
    updateVisibility() {
        const container = this.shadowRoot.querySelector('.exercise-list-container');
        if (container) {
            const hasWorkout = this.workout && this.workout.exercises && this.workout.exercises.length > 0;
            container.style.display = hasWorkout ? 'block' : 'none';
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
                    margin-top: 20px;
                }
                
                .exercise-list-container {
                    background: var(--md-sys-color-surface-container-lowest, #ffffff);
                    border: 1px solid var(--md-sys-color-outline-variant, #CAC4D0);
                    border-radius: 12px;
                    overflow: hidden;
                    display: none;
                }
                
                .list-header {
                    padding: 16px 20px;
                    background: var(--md-sys-color-surface-variant, #E7E0EC);
                    border-bottom: 1px solid var(--md-sys-color-outline-variant, #CAC4D0);
                }
                
                .list-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--md-sys-color-on-surface, #1C1B1F);
                    margin: 0;
                }
                
                #progressInfo {
                    font-size: 14px;
                    color: var(--md-sys-color-on-surface-variant, #49454F);
                    margin-top: 4px;
                }
                
                #exerciseList {
                    max-height: 400px;
                    overflow-y: auto;
                }
                
                .exercise-item {
                    display: flex;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--md-sys-color-outline-variant, #CAC4D0);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background: var(--md-sys-color-surface, #ffffff);
                }
                
                .exercise-item:last-child {
                    border-bottom: none;
                }
                
                .exercise-item:hover {
                    background: var(--md-sys-color-surface-container, #F3EDF7);
                }
                
                .exercise-item.current {
                    background: var(--md-sys-color-primary-container, #EADDFF);
                    border-left: 4px solid var(--md-sys-color-primary, #6750A4);
                }
                
                .exercise-item.completed {
                    background: var(--md-sys-color-tertiary-container, #FFD8E4);
                    opacity: 0.8;
                }
                
                .exercise-item.completed .status-icon {
                    color: var(--md-sys-color-tertiary, #7D5260);
                }
                
                .exercise-item.upcoming {
                    opacity: 0.7;
                }
                
                .exercise-item.rest-exercise {
                    background: var(--md-sys-color-surface-container-high, #ECE6F0);
                }
                
                .exercise-content {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                
                .exercise-number {
                    width: 32px;
                    height: 32px;
                    background: var(--md-sys-color-primary, #6750A4);
                    color: var(--md-sys-color-on-primary, #ffffff);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 14px;
                    flex-shrink: 0;
                }
                
                .rest-indicator {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                
                .rest-indicator .material-icons {
                    color: var(--md-sys-color-tertiary, #7D5260);
                    font-size: 24px;
                }
                
                .exercise-details {
                    flex: 1;
                    min-width: 0;
                }
                
                .exercise-name {
                    font-size: 16px;
                    font-weight: 500;
                    color: var(--md-sys-color-on-surface, #1C1B1F);
                    margin-bottom: 4px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .exercise-duration {
                    font-size: 14px;
                    color: var(--md-sys-color-on-surface-variant, #49454F);
                    font-weight: 500;
                }
                
                .exercise-duration.reps-based {
                    color: var(--md-sys-color-secondary, #625B71);
                }
                
                .exercise-description-preview {
                    font-size: 12px;
                    color: var(--md-sys-color-on-surface-variant, #49454F);
                    margin-top: 4px;
                    line-height: 1.3;
                    opacity: 0.8;
                }
                
                .exercise-status {
                    flex-shrink: 0;
                    margin-left: 12px;
                }
                
                .status-icon {
                    color: var(--md-sys-color-on-surface-variant, #49454F);
                    font-size: 20px;
                    transition: color 0.2s ease;
                }
                
                .exercise-item.current .status-icon {
                    color: var(--md-sys-color-primary, #6750A4);
                }
                
                .exercise-item.completed .status-icon::before {
                    content: 'check_circle';
                }
                
                .exercise-item.current .status-icon::before {
                    content: 'play_circle';
                }
                
                /* Scrollbar styling */
                #exerciseList::-webkit-scrollbar {
                    width: 6px;
                }
                
                #exerciseList::-webkit-scrollbar-track {
                    background: var(--md-sys-color-surface-variant, #E7E0EC);
                }
                
                #exerciseList::-webkit-scrollbar-thumb {
                    background: var(--md-sys-color-outline, #79747E);
                    border-radius: 3px;
                }
                
                #exerciseList::-webkit-scrollbar-thumb:hover {
                    background: var(--md-sys-color-primary, #6750A4);
                }
                
                @media (max-width: 768px) {
                    .exercise-item {
                        padding: 12px 16px;
                    }
                    
                    .exercise-content {
                        gap: 12px;
                    }
                    
                    .exercise-number {
                        width: 28px;
                        height: 28px;
                        font-size: 12px;
                    }
                    
                    .exercise-name {
                        font-size: 14px;
                    }
                    
                    .exercise-duration {
                        font-size: 12px;
                    }
                    
                    #exerciseList {
                        max-height: 300px;
                    }
                }
            </style>
            
            <div class="exercise-list-container">
                <div class="list-header">
                    <h3 class="list-title">Workout Exercises</h3>
                    <div id="progressInfo">Exercise 1 of 1</div>
                </div>
                <div id="exerciseList">
                    <!-- Exercise items will be rendered here -->
                </div>
            </div>
        `;
    }
}

// Register the custom element
customElements.define('exercise-list', ExerciseListComponent);