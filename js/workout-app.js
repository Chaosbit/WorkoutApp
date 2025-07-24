import { WorkoutParser } from './workout-parser.js';
import { WorkoutLibrary } from './workout-library.js';
import { AudioManager } from './audio-manager.js';
import { TimerManager } from './timer-manager.js';
import { registerServiceWorker } from './sw-registration.js';

/**
 * WorkoutApp - Main application coordinator class
 * Manages the overall application state and coordinates between components
 */
export class WorkoutApp {
    constructor() {
        this.workout = null;
        this.currentWorkoutId = null;
        this.currentExerciseIndex = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.isAdvancing = false;
        this.lastCompletionTime = 0;
        this.previousWorkoutId = null;

        // Initialize components
        this.library = new WorkoutLibrary();
        this.audioManager = new AudioManager();
        this.timerManager = new TimerManager();

        // Setup timer callbacks
        this.timerManager.setOnTick((timeRemaining) => {
            this.updateTimerDisplay();
            this.updateProgressBar();
        });
        
        this.timerManager.setOnComplete(() => {
            this.nextExercise();
        });

        // Initialize UI elements and events
        this.initializeElements();
        this.bindEvents();
        this.loadWorkoutSelector();

        // Register service worker
        registerServiceWorker();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        // File and workout management elements
        this.fileInput = document.getElementById('workoutFile');
        this.workoutDisplay = document.getElementById('workoutDisplay');
        this.workoutTitle = document.getElementById('workoutTitle');
        
        // Exercise display elements
        this.currentExercise = document.getElementById('currentExercise');
        this.currentDescription = document.getElementById('currentDescription');
        this.descriptionContent = document.getElementById('descriptionContent');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.repsDisplay = document.getElementById('repsDisplay');
        this.repsCount = document.getElementById('repsCount');
        this.repCompletion = document.getElementById('repCompletion');
        this.completeRepBtn = document.getElementById('completeRepBtn');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.workoutList = document.getElementById('workoutList');
        
        // Workout library elements
        this.workoutLibrarySection = document.getElementById('workoutLibrary');
        this.workoutSelect = document.getElementById('workoutSelect');
        this.editWorkoutBtn = document.getElementById('editWorkoutBtn');
        this.deleteWorkoutBtn = document.getElementById('deleteWorkoutBtn');
        
        // Workout editor elements
        this.workoutEditor = document.getElementById('workoutEditor');
        this.workoutNameInput = document.getElementById('workoutNameInput');
        this.workoutMarkdownEditor = document.getElementById('workoutMarkdownEditor');
        this.saveWorkoutBtn = document.getElementById('saveWorkoutBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        
        // Control elements
        this.newWorkoutBtn = document.getElementById('newWorkoutBtn');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.resetBtn = document.getElementById('resetBtn');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.fileInput.addEventListener('change', (e) => this.loadWorkoutFile(e));
        this.workoutSelect.addEventListener('change', (e) => this.selectWorkout(e));
        this.editWorkoutBtn.addEventListener('click', () => this.editSelectedWorkout());
        this.deleteWorkoutBtn.addEventListener('click', () => this.deleteSelectedWorkout());
        this.newWorkoutBtn.addEventListener('click', () => this.createNewWorkout());
        this.saveWorkoutBtn.addEventListener('click', () => this.saveWorkoutChanges());
        this.cancelEditBtn.addEventListener('click', () => this.cancelWorkoutEdit());
        this.startBtn.addEventListener('click', () => this.startWorkout());
        this.pauseBtn.addEventListener('click', () => this.pauseWorkout());
        this.skipBtn.addEventListener('click', () => this.skipExercise());
        this.resetBtn.addEventListener('click', () => this.resetWorkout());
        this.completeRepBtn.addEventListener('click', () => this.completeRepExercise());
    }

    /**
     * Load workout from file input
     */
    async loadWorkoutFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const content = await file.text();
            const workoutData = WorkoutParser.parseMarkdown(content);
            
            // Save to library
            const savedWorkout = this.library.addWorkout(file.name, content, workoutData);
            this.currentWorkoutId = savedWorkout.id;
            
            // Set as current workout
            this.workout = workoutData;
            this.displayWorkout();
            this.loadWorkoutSelector();
            
            // Select the new workout in the dropdown
            this.workoutSelect.value = this.currentWorkoutId;
            
            alert('Workout loaded and saved successfully!');
        } catch (error) {
            console.error('Error loading workout:', error);
            alert('Error loading workout: ' + error.message);
        }
    }

    /**
     * Select a workout from the dropdown
     */
    selectWorkout(event) {
        const workoutId = event.target.value;
        if (!workoutId) {
            this.workout = null;
            this.currentWorkoutId = null;
            this.workoutDisplay.style.display = 'none';
            this.updateDeleteButtonState();
            return;
        }
        
        const savedWorkout = this.library.getWorkout(workoutId);
        if (savedWorkout) {
            this.currentWorkoutId = workoutId;
            this.workout = savedWorkout.data;
            this.displayWorkout();
            this.updateDeleteButtonState();
        }
    }

    /**
     * Display the current workout
     */
    displayWorkout() {
        if (!this.workout) return;
        
        this.workoutTitle.textContent = this.workout.title || 'Workout';
        this.workoutDisplay.style.display = 'block';
        
        // Hide the sample format when a workout is loaded
        const sampleFormat = document.querySelector('.sample-format');
        if (sampleFormat) {
            sampleFormat.style.display = 'none';
        }
        
        this.resetWorkout();
        this.updateWorkoutList();
    }

    /**
     * Start the workout
     */
    startWorkout() {
        if (!this.workout || this.workout.exercises.length === 0) return;
        
        this.isRunning = true;
        this.isPaused = false;
        
        const currentExercise = this.workout.exercises[this.currentExerciseIndex];
        if (currentExercise && currentExercise.exerciseType === 'timer') {
            this.timerManager.setExercise(currentExercise);
            this.timerManager.start();
        }
        
        this.updateControls();
    }

    /**
     * Pause the workout
     */
    pauseWorkout() {
        this.isPaused = true;
        this.isRunning = false;
        this.timerManager.pause();
        this.updateControls();
    }

    /**
     * Move to next exercise
     */
    nextExercise() {
        if (this.isAdvancing) return;
        this.isAdvancing = true;
        
        this.timerManager.stop();
        this.audioManager.playExerciseComplete();
        this.currentExerciseIndex++;
        
        if (this.currentExerciseIndex >= this.workout.exercises.length) {
            this.completeWorkout();
        } else {
            this.loadCurrentExercise();
            if (this.isRunning) {
                const currentExercise = this.workout.exercises[this.currentExerciseIndex];
                if (currentExercise && currentExercise.exerciseType === 'timer') {
                    this.timerManager.setExercise(currentExercise);
                    this.timerManager.start();
                }
            }
        }
        
        setTimeout(() => {
            this.isAdvancing = false;
        }, 10);
    }

    /**
     * Complete the workout
     */
    completeWorkout() {
        this.timerManager.stop();
        this.isRunning = false;
        this.isPaused = false;
        this.currentExercise.textContent = 'Workout Complete! 🎉';
        this.timerDisplay.textContent = '00:00';
        this.timerDisplay.style.display = 'block';
        this.repsDisplay.style.display = 'none';
        this.repCompletion.style.display = 'none';
        this.progressFill.style.width = '100%';
        this.updateControls();
        this.updateWorkoutList();
        
        this.audioManager.playWorkoutComplete();
        
        setTimeout(() => {
            alert('Workout completed! Great job! 💪');
        }, 500);
    }

    /**
     * Update timer display
     */
    updateTimerDisplay() {
        this.timerDisplay.textContent = this.timerManager.getFormattedTime();
        this.updateProgress();
    }

    /**
     * Update progress bar
     */
    updateProgressBar() {
        const progress = this.timerManager.getProgress();
        this.progressFill.style.width = `${progress}%`;
    }

    /**
     * Update progress text
     */
    updateProgress() {
        if (this.workout && this.workout.exercises.length > 0) {
            this.progressText.textContent = `Exercise ${this.currentExerciseIndex + 1} of ${this.workout.exercises.length}`;
        }
    }

    /**
     * Load current exercise
     */
    loadCurrentExercise() {
        if (!this.workout || this.currentExerciseIndex >= this.workout.exercises.length) return;
        
        const exercise = this.workout.exercises[this.currentExerciseIndex];
        this.currentExercise.textContent = exercise.name;
        
        if (exercise.exerciseType === 'reps') {
            // Rep-based exercise
            this.timerManager.stop();
            this.timerDisplay.style.display = 'none';
            this.repsDisplay.style.display = 'block';
            this.repCompletion.style.display = 'block';
            this.repsCount.textContent = exercise.reps;
            exercise.completed = false;
            this.progressFill.style.width = '0%';
        } else {
            // Timer-based exercise
            this.timerManager.setExercise(exercise);
            this.timerDisplay.style.display = 'block';
            this.repsDisplay.style.display = 'none';
            this.repCompletion.style.display = 'none';
            this.progressFill.style.width = '0%';
        }
        
        // Handle exercise description
        if (exercise.description && exercise.description.trim().length > 0) {
            this.descriptionContent.innerHTML = exercise.description.split('\n').map(line => `<p>${line}</p>`).join('');
            this.currentDescription.style.display = 'block';
            this.currentDescription.classList.remove('expanded');
        } else {
            this.currentDescription.style.display = 'none';
        }
        
        this.updateTimerDisplay();
        this.updateProgress();
        this.updateWorkoutList();
        this.updateControls();
    }

    /**
     * Update control button states
     */
    updateControls() {
        const hasWorkout = this.workout && this.workout.exercises.length > 0;
        
        this.startBtn.disabled = !hasWorkout || this.isRunning;
        this.pauseBtn.disabled = !hasWorkout || !this.isRunning;
        this.skipBtn.disabled = !hasWorkout || (!this.isRunning && !this.isPaused);
        this.resetBtn.disabled = !hasWorkout;
    }

    /**
     * Reset workout to beginning
     */
    resetWorkout() {
        this.timerManager.stop();
        this.isRunning = false;
        this.isPaused = false;
        this.currentExerciseIndex = 0;
        
        if (this.workout && this.workout.exercises.length > 0) {
            this.loadCurrentExercise();
        }
        
        this.timerDisplay.textContent = '00:00';
        this.timerDisplay.style.display = 'block';
        this.progressFill.style.width = '0%';
        this.updateControls();
        this.updateWorkoutList();
    }

    /**
     * Skip to next exercise
     */
    skipExercise() {
        this.nextExercise();
    }

    /**
     * Complete a rep-based exercise
     */
    completeRepExercise() {
        const now = Date.now();
        if (now - this.lastCompletionTime < 1000) return;
        this.lastCompletionTime = now;
        
        const exercise = this.workout.exercises[this.currentExerciseIndex];
        if (exercise && exercise.exerciseType === 'reps' && !exercise.completed) {
            exercise.completed = true;
            this.progressFill.style.width = '100%';
            
            setTimeout(() => {
                this.nextExercise();
            }, 1000);
        }
    }

    /**
     * Load workout selector dropdown
     */
    loadWorkoutSelector() {
        const workouts = this.library.getAllWorkouts();
        this.workoutSelect.innerHTML = '<option value="">Choose a saved workout...</option>';
        
        if (workouts.length > 0) {
            this.workoutLibrarySection.style.display = 'block';
            workouts.forEach(workout => {
                const option = document.createElement('option');
                option.value = workout.id;
                option.textContent = workout.name;
                this.workoutSelect.appendChild(option);
            });
        } else {
            this.workoutLibrarySection.style.display = 'none';
        }
        
        this.updateDeleteButtonState();
    }

    /**
     * Update delete button state
     */
    updateDeleteButtonState() {
        const hasSelection = this.workoutSelect.value !== '';
        this.editWorkoutBtn.disabled = !hasSelection;
        this.deleteWorkoutBtn.disabled = !hasSelection;
    }

    /**
     * Update workout list display
     */
    updateWorkoutList() {
        if (!this.workout) {
            this.workoutList.innerHTML = '';
            return;
        }
        
        this.workoutList.innerHTML = '';
        this.workout.exercises.forEach((exercise, index) => {
            const exerciseElement = document.createElement('div');
            exerciseElement.className = 'workout-item';
            if (index === this.currentExerciseIndex) {
                exerciseElement.classList.add('current');
            }
            if (index < this.currentExerciseIndex) {
                exerciseElement.classList.add('completed');
            }
            
            const exerciseInfo = document.createElement('div');
            exerciseInfo.className = 'exercise-info';
            
            const exerciseName = document.createElement('div');
            exerciseName.className = 'exercise-name';
            exerciseName.textContent = exercise.name;
            
            const exerciseTime = document.createElement('div');
            exerciseTime.className = 'exercise-time';
            if (exercise.exerciseType === 'timer') {
                exerciseTime.textContent = this.timerManager.formatTime(exercise.duration);
            } else {
                exerciseTime.textContent = `${exercise.reps} reps`;
            }
            
            exerciseInfo.appendChild(exerciseName);
            exerciseInfo.appendChild(exerciseTime);
            exerciseElement.appendChild(exerciseInfo);
            
            if (exercise.description && exercise.description.trim().length > 0) {
                const descriptionElement = document.createElement('div');
                descriptionElement.className = 'exercise-description';
                descriptionElement.innerHTML = exercise.description.split('\n').map(line => `<p>${line}</p>`).join('');
                exerciseElement.appendChild(descriptionElement);
            }
            
            this.workoutList.appendChild(exerciseElement);
        });
    }

    // Placeholder methods for workout editing functionality
    editSelectedWorkout() {
        // TODO: Implement workout editing
        console.log('Edit workout functionality to be implemented');
    }

    deleteSelectedWorkout() {
        // TODO: Implement workout deletion
        console.log('Delete workout functionality to be implemented');
    }

    createNewWorkout() {
        // TODO: Implement new workout creation
        console.log('Create new workout functionality to be implemented');
    }

    saveWorkoutChanges() {
        // TODO: Implement save workout changes
        console.log('Save workout changes functionality to be implemented');
    }

    cancelWorkoutEdit() {
        // TODO: Implement cancel workout edit
        console.log('Cancel workout edit functionality to be implemented');
    }

    // Backward compatibility methods for tests
    /**
     * Format time for backward compatibility
     */
    formatTime(seconds) {
        return this.timerManager.formatTime(seconds);
    }

    /**
     * Play sound for backward compatibility
     */
    playSound(frequency, duration, type) {
        this.audioManager.playSound(frequency, duration, type);
    }

    /**
     * Play completion sound for backward compatibility
     */
    playCompletionSound() {
        this.audioManager.playWorkoutComplete();
    }

    /**
     * Initialize audio for backward compatibility
     */
    initializeAudio() {
        // Audio is already initialized in constructor
    }

    /**
     * Expose audioContext for backward compatibility
     */
    get audioContext() {
        return this.audioManager.audioContext;
    }

    /**
     * Expose timeRemaining for backward compatibility
     */
    get timeRemaining() {
        return this.timerManager.getTimeRemaining();
    }

    /**
     * Set timeRemaining for backward compatibility
     */
    set timeRemaining(value) {
        this.timerManager.timeRemaining = value;
    }
}