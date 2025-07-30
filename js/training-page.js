import { WorkoutApp } from './workout-app.js';
import { WorkoutLibrary } from './workout-library.js';
import { WorkoutParser } from './workout-parser.js';
import { TimerManager } from './timer-manager.js';
import { AudioManager } from './audio-manager.js';
import { StatisticsManager } from './statistics-manager.js';
import { ScreenWakeManager } from './screen-wake-manager.js';
import { UIUtils } from './ui-utils.js';

// Import web components for training experience
import './workout-context-component.js';
import './components/timer-display.js';
import './components/workout-controls.js';
import './components/exercise-list.js';

/**
 * Training Page - Distraction-free workout execution
 */
class TrainingPage {
    constructor() {
        this.workoutLibrary = new WorkoutLibrary();
        this.workoutParser = new WorkoutParser();
        this.timerManager = new TimerManager();
        this.audioManager = new AudioManager();
        this.statisticsManager = new StatisticsManager();
        this.screenWakeManager = new ScreenWakeManager();
        
        this.currentWorkout = null;
        this.currentExerciseIndex = 0;
        this.sessionStartTime = null;
        
        this.initializePage();
        this.bindEvents();
    }

    /**
     * Initialize the training page
     */
    initializePage() {
        // Load the active workout from session storage
        const activeWorkoutId = sessionStorage.getItem('activeWorkoutId');
        if (activeWorkoutId) {
            this.loadWorkout(activeWorkoutId);
        } else {
            this.showNoWorkoutMessage();
        }
        
        // Keep screen awake during training
        this.screenWakeManager.requestWakeLock();
    }

    /**
     * Load workout for training
     */
    loadWorkout(workoutId) {
        try {
            const workout = this.workoutLibrary.getWorkout(workoutId);
            if (!workout) {
                throw new Error('Workout not found');
            }
            
            // Parse workout content
            const parsedWorkout = this.workoutParser.parseMarkdown(workout.content);
            this.currentWorkout = {
                ...workout,
                ...parsedWorkout
            };
            
            this.displayWorkout();
            this.initializeComponents();
            
        } catch (error) {
            console.error('Error loading workout:', error);
            UIUtils.showMessage('Failed to load workout', 'error');
            this.showNoWorkoutMessage();
        }
    }

    /**
     * Display workout information
     */
    displayWorkout() {
        const workoutTitle = document.getElementById('workoutTitle');
        const workoutMeta = document.getElementById('workoutMeta');
        
        if (workoutTitle && this.currentWorkout) {
            workoutTitle.textContent = this.currentWorkout.name || 'Training Session';
        }
        
        if (workoutMeta && this.currentWorkout) {
            const exerciseCount = this.currentWorkout.exercises?.length || 0;
            const totalTime = this.currentWorkout.totalTime || 'Unknown duration';
            workoutMeta.innerHTML = `
                <p class="md-typescale-body-medium">
                    ${exerciseCount} exercises • ${totalTime}
                </p>
            `;
        }
    }

    /**
     * Initialize web components for training
     */
    initializeComponents() {
        if (!this.currentWorkout || !this.currentWorkout.exercises) return;
        
        // Initialize workout context
        const workoutContext = document.getElementById('workoutContext');
        if (workoutContext) {
            workoutContext.setAttribute('workout-name', this.currentWorkout.name || '');
            workoutContext.setAttribute('current-exercise-index', '0');
        }
        
        // Initialize exercise list
        const exerciseList = document.getElementById('exerciseList');
        if (exerciseList && exerciseList.setWorkout) {
            exerciseList.setWorkout(this.currentWorkout);
        }
        
        // Initialize timer display
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay && this.currentWorkout.exercises[0]) {
            this.updateTimerDisplay(this.currentWorkout.exercises[0]);
        }
        
        // Initialize workout controls
        const workoutControls = document.getElementById('workoutControls');
        if (workoutControls) {
            workoutControls.setAttribute('can-start', 'true');
        }
        
        this.updateProgress();
    }

    /**
     * Update timer display for current exercise
     */
    updateTimerDisplay(exercise) {
        const timerDisplay = document.getElementById('timerDisplay');
        if (!timerDisplay || !exercise) return;
        
        timerDisplay.setAttribute('exercise-name', exercise.name || '');
        timerDisplay.setAttribute('exercise-description', exercise.description || '');
        timerDisplay.setAttribute('exercise-type', exercise.type || 'time');
        
        if (exercise.duration) {
            timerDisplay.setAttribute('exercise-duration', exercise.duration.toString());
        }
        
        if (exercise.reps) {
            timerDisplay.setAttribute('reps', exercise.reps.toString());
        }
    }

    /**
     * Update progress information
     */
    updateProgress() {
        const progressText = document.getElementById('progressText');
        if (progressText && this.currentWorkout) {
            const current = this.currentExerciseIndex + 1;
            const total = this.currentWorkout.exercises?.length || 0;
            progressText.textContent = `Exercise ${current} of ${total}`;
        }
    }

    /**
     * Show no workout message
     */
    showNoWorkoutMessage() {
        const workoutMeta = document.getElementById('workoutMeta');
        if (workoutMeta) {
            workoutMeta.innerHTML = `
                <p class="md-typescale-body-medium">
                    No workout loaded. <a href="workout-management.html">Choose a workout</a> to start training.
                </p>
            `;
        }
    }

    /**
     * Start workout session
     */
    startWorkout() {
        if (!this.currentWorkout || !this.currentWorkout.exercises) return;
        
        this.sessionStartTime = new Date();
        this.currentExerciseIndex = 0;
        
        // Record session start
        this.statisticsManager.recordWorkoutStart(this.currentWorkout.id, this.currentWorkout.name);
        
        this.startCurrentExercise();
        
        // Update controls
        const workoutControls = document.getElementById('workoutControls');
        if (workoutControls) {
            workoutControls.setAttribute('is-running', 'true');
            workoutControls.setAttribute('can-start', 'false');
            workoutControls.setAttribute('can-skip', 'true');
        }
    }

    /**
     * Start current exercise
     */
    startCurrentExercise() {
        const exercise = this.currentWorkout.exercises[this.currentExerciseIndex];
        if (!exercise) return;
        
        this.updateTimerDisplay(exercise);
        this.updateProgress();
        
        // Start timer for timed exercises
        if (exercise.type === 'time' && exercise.duration) {
            this.timerManager.startTimer(exercise.duration, {
                onTick: (remaining) => this.onTimerTick(remaining),
                onComplete: () => this.onExerciseComplete()
            });
        }
        
        // Update exercise list
        const exerciseList = document.getElementById('exerciseList');
        if (exerciseList) {
            exerciseList.setAttribute('current-exercise-index', this.currentExerciseIndex.toString());
        }
    }

    /**
     * Handle timer tick
     */
    onTimerTick(remaining) {
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.setAttribute('time-remaining', remaining.toString());
        }
    }

    /**
     * Handle exercise completion
     */
    onExerciseComplete() {
        this.audioManager.playCompletionSound();
        
        // Mark exercise as completed
        const exerciseList = document.getElementById('exerciseList');
        if (exerciseList && exerciseList.completeExercise) {
            exerciseList.completeExercise(this.currentExerciseIndex);
        }
        
        // Move to next exercise
        this.nextExercise();
    }

    /**
     * Move to next exercise
     */
    nextExercise() {
        if (this.currentExerciseIndex < this.currentWorkout.exercises.length - 1) {
            this.currentExerciseIndex++;
            this.startCurrentExercise();
        } else {
            this.completeWorkout();
        }
    }

    /**
     * Skip current exercise
     */
    skipExercise() {
        this.timerManager.stopTimer();
        this.nextExercise();
    }

    /**
     * Pause workout
     */
    pauseWorkout() {
        this.timerManager.pauseTimer();
        
        const workoutControls = document.getElementById('workoutControls');
        if (workoutControls) {
            workoutControls.setAttribute('is-paused', 'true');
        }
    }

    /**
     * Resume workout
     */
    resumeWorkout() {
        this.timerManager.resumeTimer();
        
        const workoutControls = document.getElementById('workoutControls');
        if (workoutControls) {
            workoutControls.setAttribute('is-paused', 'false');
        }
    }

    /**
     * Complete entire workout
     */
    completeWorkout() {
        const endTime = new Date();
        const duration = this.sessionStartTime ? endTime - this.sessionStartTime : 0;
        
        // Record completion
        this.statisticsManager.recordWorkoutCompletion(
            this.currentWorkout.id,
            this.currentWorkout.name,
            duration,
            true
        );
        
        UIUtils.showMessage('🎉 Workout completed! Great job!', 'success');
        
        // Update controls
        const workoutControls = document.getElementById('workoutControls');
        if (workoutControls) {
            workoutControls.setAttribute('is-running', 'false');
            workoutControls.setAttribute('can-start', 'false');
        }
        
        // Show completion options
        setTimeout(() => {
            this.showCompletionOptions();
        }, 2000);
    }

    /**
     * Show completion options
     */
    showCompletionOptions() {
        UIUtils.showConfirmDialog(
            'Workout completed! What would you like to do next?',
            'View Statistics',
            'Return Home',
            () => window.location.href = 'statistics.html',
            () => window.location.href = 'index.html'
        );
    }

    /**
     * Exit training session
     */
    exitTraining() {
        UIUtils.showConfirmDialog(
            'Are you sure you want to exit the training session?',
            'Exit',
            'Continue Training',
            () => {
                this.cleanupSession();
                window.location.href = 'index.html';
            }
        );
    }

    /**
     * Cleanup training session
     */
    cleanupSession() {
        this.timerManager.stopTimer();
        this.screenWakeManager.releaseWakeLock();
        sessionStorage.removeItem('activeWorkoutId');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Back button
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', () => this.exitTraining());
        }
        
        // Exit training button
        const exitTrainingBtn = document.getElementById('exitTrainingBtn');
        if (exitTrainingBtn) {
            exitTrainingBtn.addEventListener('click', () => this.exitTraining());
        }
        
        // Share workout button
        const shareWorkoutBtn = document.getElementById('shareWorkoutBtn');
        if (shareWorkoutBtn) {
            shareWorkoutBtn.addEventListener('click', () => this.shareWorkout());
        }
        
        // Listen for workout control events
        document.addEventListener('workout-start', () => this.startWorkout());
        document.addEventListener('workout-pause', () => this.pauseWorkout());
        document.addEventListener('workout-resume', () => this.resumeWorkout());
        document.addEventListener('workout-skip', () => this.skipExercise());
        document.addEventListener('workout-reset', () => this.resetWorkout());
        
        // Listen for exercise selection
        document.addEventListener('exercise-selected', (e) => {
            if (e.detail && typeof e.detail.index === 'number') {
                this.currentExerciseIndex = e.detail.index;
                this.startCurrentExercise();
            }
        });
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // App is hidden, but keep timer running
            } else {
                // App is visible again
            }
        });
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanupSession();
        });
    }

    /**
     * Reset workout to beginning
     */
    resetWorkout() {
        this.timerManager.stopTimer();
        this.currentExerciseIndex = 0;
        
        const workoutControls = document.getElementById('workoutControls');
        if (workoutControls) {
            workoutControls.setAttribute('is-running', 'false');
            workoutControls.setAttribute('is-paused', 'false');
            workoutControls.setAttribute('can-start', 'true');
        }
        
        this.initializeComponents();
    }

    /**
     * Share workout
     */
    shareWorkout() {
        if (!this.currentWorkout) return;
        
        if (navigator.share) {
            navigator.share({
                title: this.currentWorkout.name,
                text: `Check out this workout: ${this.currentWorkout.name}`,
                url: window.location.href
            });
        } else {
            // Fallback - copy to clipboard
            const text = `${this.currentWorkout.name}\n\n${this.currentWorkout.content}`;
            navigator.clipboard.writeText(text).then(() => {
                UIUtils.showMessage('Workout copied to clipboard!', 'success');
            });
        }
    }
}

// Initialize the training page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.trainingPage = new TrainingPage();
});