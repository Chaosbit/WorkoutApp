import { WorkoutParser } from './workout-parser.js';
import { WorkoutLibrary } from './workout-library.js';
import { AudioManager } from './audio-manager.js';
import { TimerManager } from './timer-manager.js';
import { StatisticsManager } from './statistics-manager.js';
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
        this.statisticsManager = new StatisticsManager();

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
        this.checkForSharedWorkout(); // Check URL for shared workout
        this.updateStatisticsDisplay(); // Initialize statistics display

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
        this.shareWorkoutBtn = document.getElementById('shareWorkoutBtn');
        
        // Statistics elements
        this.statisticsSection = document.getElementById('statisticsSection');
        this.totalWorkoutsEl = document.getElementById('totalWorkouts');
        this.completedWorkoutsEl = document.getElementById('completedWorkouts');
        this.totalTimeEl = document.getElementById('totalTime');
        this.streakDaysEl = document.getElementById('streakDays');
        this.journalList = document.getElementById('journalList');
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
        this.shareWorkoutBtn.addEventListener('click', () => this.shareWorkout());
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
            
            // Update button states
            this.updateDeleteButtonState();
            
            // Don't show alert in test environment
            if (!window.Cypress) {
                alert('Workout loaded and saved successfully!');
            }
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
        
        // Start tracking workout session
        this.statisticsManager.startSession(
            this.currentWorkoutId || 'anonymous',
            this.workout.title || 'Workout',
            this.workout.exercises
        );
        
        const currentExercise = this.workout.exercises[this.currentExerciseIndex];
        if (currentExercise && currentExercise.exerciseType === 'timer') {
            this.timerManager.setExercise(currentExercise);
            this.timerManager.start();
        }
        
        // Track exercise start
        this.statisticsManager.startExercise(this.currentExerciseIndex);
        
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
        
        // Complete current exercise in statistics
        this.statisticsManager.completeExercise(this.currentExerciseIndex);
        
        this.currentExerciseIndex++;
        
        if (this.currentExerciseIndex >= this.workout.exercises.length) {
            this.completeWorkout();
        } else {
            this.loadCurrentExercise();
            
            // Track new exercise start
            this.statisticsManager.startExercise(this.currentExerciseIndex);
            
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
        
        // Complete the workout session
        this.statisticsManager.completeSession();
        this.updateStatisticsDisplay();
        
        this.currentExercise.textContent = 'Workout Complete! 🎉';
        this.timerDisplay.textContent = '00:00';
        this.timerDisplay.style.display = 'block';
        this.repsDisplay.style.display = 'none';
        this.repCompletion.style.display = 'none';
        this.progressFill.style.width = '100%';
        this.updateControls();
        this.updateWorkoutList();
        
        this.audioManager.playWorkoutComplete();
        
        // Don't show alert in test environment
        if (!window.Cypress) {
            setTimeout(() => {
                alert('Workout completed! Great job! 💪');
            }, 500);
        }
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
        
        // If there was an active session, abandon it
        if (this.isRunning || this.isPaused) {
            this.statisticsManager.abandonSession();
        }
        
        this.isRunning = false;
        this.isPaused = false;
        this.currentExerciseIndex = 0;
        
        if (this.workout && this.workout.exercises.length > 0) {
            this.loadCurrentExercise();
        } else {
            // Only set to 00:00 if no workout is loaded
            this.timerDisplay.textContent = '00:00';
            this.timerDisplay.style.display = 'block';
        }
        
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
            exerciseElement.className = 'exercise-item';
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

    // Workout editing functionality
    editSelectedWorkout() {
        if (!this.currentWorkoutId) return;
        
        const savedWorkout = this.library.getWorkout(this.currentWorkoutId);
        if (!savedWorkout) return;
        
        // Populate the editor with current workout data
        this.workoutNameInput.value = savedWorkout.name;
        this.workoutMarkdownEditor.value = savedWorkout.content || '';
        
        // Show the editor and hide the workout display
        this.workoutEditor.style.display = 'block';
        this.workoutDisplay.style.display = 'none';
    }

    deleteSelectedWorkout() {
        if (!this.currentWorkoutId) return;
        
        const savedWorkout = this.library.getWorkout(this.currentWorkoutId);
        if (!savedWorkout) return;
        
        const shouldDelete = window.Cypress ? true : confirm(`Are you sure you want to delete "${savedWorkout.name}"?`);
        if (shouldDelete) {
            this.library.deleteWorkout(this.currentWorkoutId);
            
            // Clear current workout if it was deleted
            this.currentWorkoutId = null;
            this.workout = null;
            this.workoutDisplay.style.display = 'none';
            
            // Show sample format again
            const sampleFormat = document.querySelector('.sample-format');
            if (sampleFormat) {
                sampleFormat.style.display = 'block';
            }
            
            this.loadWorkoutSelector();
        }
    }

    createNewWorkout() {
        // Remember current workout selection so we can restore it if cancelled
        this.previousWorkoutId = this.currentWorkoutId;
        
        // Create a new workout template
        const defaultTemplate = `# New Workout

## Warm-up - 5:00
Light cardio and dynamic stretching to prepare your body.

## Exercise 1 - 0:45
Description of your first exercise.

Rest - 0:15

## Exercise 2 - 1:00
Description of your second exercise.

Rest - 0:30`;

        // Clear current workout selection
        this.currentWorkoutId = null;
        this.workoutSelect.value = '';
        this.updateDeleteButtonState();
        
        // Populate the editor with template
        this.workoutNameInput.value = '';
        this.workoutMarkdownEditor.value = defaultTemplate;
        
        // Show the editor and hide the workout display
        this.workoutEditor.style.display = 'block';
        this.workoutDisplay.style.display = 'none';
        
        // Focus on the name input for better UX
        this.workoutNameInput.focus();
    }

    saveWorkoutChanges() {
        const newName = this.workoutNameInput.value.trim();
        const newContent = this.workoutMarkdownEditor.value.trim();
        
        if (!newName || !newContent) {
            alert('Please provide both a workout name and content.');
            return;
        }
        
        try {
            // Parse the new content to validate it
            const newWorkoutData = WorkoutParser.parseMarkdown(newContent);
            
            if (!newWorkoutData.exercises || newWorkoutData.exercises.length === 0) {
                alert('Please provide valid workout content with at least one exercise.');
                return;
            }
            
            // Check if this is editing an existing workout or creating a new one
            if (this.currentWorkoutId) {
                // Editing existing workout
                const savedWorkout = this.library.getWorkout(this.currentWorkoutId);
                if (savedWorkout) {
                    // Remember current exercise position before updating
                    const wasRunning = this.isRunning;
                    const wasPaused = this.isPaused;
                    const currentIndex = this.currentExerciseIndex;
                    const currentTime = this.timerManager.getTimeRemaining();
                    
                    savedWorkout.name = newName;
                    savedWorkout.content = newContent;
                    savedWorkout.data = newWorkoutData;
                    this.library.saveWorkouts();
                    
                    // Update current workout
                    this.workout = newWorkoutData;
                    
                    // Preserve exercise position if still valid
                    if (currentIndex < newWorkoutData.exercises.length) {
                        this.currentExerciseIndex = currentIndex;
                        // If we were in the middle of an exercise, reload it with the new data
                        this.loadCurrentExercise();
                        // If the exercise duration changed and we had more time remaining than the new duration,
                        // adjust the remaining time
                        const newDuration = this.workout.exercises[currentIndex].duration;
                        if (newDuration && currentTime > newDuration) {
                            this.timerManager.timeRemaining = newDuration;
                        } else {
                            this.timerManager.timeRemaining = currentTime;
                        }
                        this.updateTimerDisplay();
                        this.updateProgressBar();
                    } else {
                        // If current exercise index is out of bounds, reset to beginning
                        this.resetWorkout();
                    }
                    
                    // Restore running state if it was active
                    if (wasRunning) {
                        this.isRunning = true;
                        this.isPaused = false;
                        this.timerManager.start();
                    } else if (wasPaused) {
                        this.isPaused = true;
                        this.isRunning = false;
                    }
                    
                    this.updateControls();
                    this.displayWorkout();
                    
                    // Hide editor and refresh workout selector
                    this.cancelWorkoutEdit();
                    this.loadWorkoutSelector();
                    
                    // Reselect the updated workout in the dropdown
                    this.workoutSelect.value = this.currentWorkoutId;
                    
                    // Update button states
                    this.updateDeleteButtonState();
                    
                    alert('Workout updated successfully!');
                }
            } else {
                // Creating new workout
                const filename = newName.endsWith('.md') ? newName : newName + '.md';
                const savedWorkout = this.library.addWorkout(filename, newContent, newWorkoutData);
                this.currentWorkoutId = savedWorkout.id;
                
                // Set as current workout
                this.workout = newWorkoutData;
                this.displayWorkout();
                
                // Hide editor and refresh workout selector
                this.cancelWorkoutEdit();
                this.loadWorkoutSelector();
                
                // Select the new workout in the dropdown
                this.workoutSelect.value = this.currentWorkoutId;
                
                // Update button states
                this.updateDeleteButtonState();
                
                // Clear previous workout memory since we successfully created a new one
                this.previousWorkoutId = null;
                
                alert('New workout created successfully!');
            }
        } catch (error) {
            console.error('Error parsing workout:', error);
            alert('Error parsing workout content. Please check your markdown format.');
        }
    }

    cancelWorkoutEdit() {
        this.workoutEditor.style.display = 'none';
        
        // If we were creating a new workout (no currentWorkoutId) and had a previous selection, restore it
        if (!this.currentWorkoutId && this.previousWorkoutId) {
            this.currentWorkoutId = this.previousWorkoutId;
            this.workoutSelect.value = this.previousWorkoutId;
            
            const savedWorkout = this.library.getWorkout(this.previousWorkoutId);
            if (savedWorkout) {
                this.workout = savedWorkout.data;
                this.displayWorkout();
            }
            
            this.updateDeleteButtonState();
            this.previousWorkoutId = null;
        } else if (this.workout) {
            this.workoutDisplay.style.display = 'block';
        }
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
     * Set audioContext for backward compatibility (for tests)
     */
    set audioContext(value) {
        this.audioManager.audioContext = value;
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

    // Workout sharing functionality
    checkForSharedWorkout() {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedWorkout = urlParams.get('workout');
        
        if (sharedWorkout) {
            try {
                const workoutContent = this.decodeWorkout(sharedWorkout);
                const workoutData = WorkoutParser.parseMarkdown(workoutContent);
                
                // Automatically save the shared workout to the library
                let workoutName = workoutData.title || 'Shared Workout';
                const existingNames = this.library.getAllWorkouts().map(w => w.name);
                let counter = 1;
                let finalName = workoutName;
                
                // Ensure unique name
                while (existingNames.includes(finalName)) {
                    finalName = `${workoutName} (${counter})`;
                    counter++;
                }
                
                // Save to library
                const savedWorkout = this.library.addWorkout(`${finalName}.md`, workoutContent, workoutData);
                this.currentWorkoutId = savedWorkout.id;
                this.workout = workoutData;
                
                // Update UI to reflect it's now a saved workout
                this.loadWorkoutSelector();
                this.workoutSelect.value = this.currentWorkoutId;
                this.displayWorkout();
                
                // Show a message that the workout was automatically saved
                this.showSharedWorkoutMessage();
                
                // Update button states
                this.updateDeleteButtonState();
                
                // Clear the URL parameter for cleaner sharing
                const newUrl = window.location.pathname;
                window.history.replaceState({}, document.title, newUrl);
                
            } catch (error) {
                console.error('Error loading shared workout:', error);
                alert('Error loading shared workout. The link may be invalid or corrupted.');
            }
        }
    }
    
    encodeWorkout(workoutContent) {
        // Compress and encode the workout content for URL sharing
        return btoa(encodeURIComponent(workoutContent));
    }
    
    decodeWorkout(encodedWorkout) {
        // Decode and decompress the workout content from URL
        return decodeURIComponent(atob(encodedWorkout));
    }
    
    generateShareLink() {
        if (!this.workout) return null;
        
        // Get the current workout content
        let workoutContent = '';
        
        if (this.currentWorkoutId) {
            // If it's a saved workout, get the original content
            const savedWorkout = this.library.getWorkout(this.currentWorkoutId);
            if (savedWorkout && savedWorkout.content) {
                workoutContent = savedWorkout.content;
            }
        }
        
        // If we don't have content, reconstruct it from the workout data
        if (!workoutContent) {
            workoutContent = this.reconstructMarkdownFromWorkout(this.workout);
        }
        
        const encodedWorkout = this.encodeWorkout(workoutContent);
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?workout=${encodedWorkout}`;
    }
    
    reconstructMarkdownFromWorkout(workout) {
        // Reconstruct markdown content from workout data
        let content = `# ${workout.title || 'Shared Workout'}\n\n`;
        
        workout.exercises.forEach(exercise => {
            if (exercise.exerciseType === 'reps') {
                content += `## ${exercise.name} - ${exercise.reps} reps\n`;
            } else {
                const minutes = Math.floor(exercise.duration / 60);
                const seconds = exercise.duration % 60;
                const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                content += `## ${exercise.name} - ${timeStr}\n`;
            }
            
            if (exercise.description) {
                content += `${exercise.description}\n\n`;
            } else {
                content += '\n';
            }
        });
        
        return content.trim();
    }
    
    showSharedWorkoutMessage() {
        // Create a temporary message to show the workout was loaded from a shared link
        const message = document.createElement('div');
        message.className = 'shared-workout-message';
        message.innerHTML = `
            <div class="message-content">
                <span>💾 Workout loaded and saved from shared link!</span>
                <button onclick="this.parentElement.parentElement.remove()" class="close-btn">&times;</button>
            </div>
        `;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-size: 14px;
            max-width: 300px;
        `;
        
        const messageContent = message.querySelector('.message-content');
        messageContent.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        `;
        
        const closeBtn = message.querySelector('.close-btn');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            margin: 0;
        `;
        
        document.body.appendChild(message);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (message.parentElement) {
                message.remove();
            }
        }, 5000);
    }
    
    shareWorkout() {
        const shareLink = this.generateShareLink();
        if (!shareLink) {
            alert('No workout loaded to share.');
            return;
        }
        
        // Try to use the modern Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: this.workout.title || 'Shared Workout',
                text: 'Check out this workout!',
                url: shareLink
            }).catch(err => {
                console.log('Error sharing:', err);
                this.copyToClipboard(shareLink);
            });
        } else {
            // Fallback to copying to clipboard
            this.copyToClipboard(shareLink);
        }
    }
    
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showShareSuccessMessage();
            }).catch(() => {
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }
    
    fallbackCopyToClipboard(text) {
        // Create a temporary textarea element
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showShareSuccessMessage();
        } catch (err) {
            console.error('Fallback copy failed:', err);
            this.showShareErrorMessage(text);
        }
        
        document.body.removeChild(textArea);
    }
    
    showShareSuccessMessage() {
        // Create success message
        const message = document.createElement('div');
        message.className = 'share-success-message';
        message.innerHTML = `
            <div class="message-content">
                <span>✅ Workout link copied to clipboard!</span>
                <button onclick="this.parentElement.parentElement.remove()" class="close-btn">&times;</button>
            </div>
        `;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-size: 14px;
            max-width: 300px;
        `;
        
        const messageContent = message.querySelector('.message-content');
        messageContent.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        `;
        
        const closeBtn = message.querySelector('.close-btn');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            margin: 0;
        `;
        
        document.body.appendChild(message);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (message.parentElement) {
                message.remove();
            }
        }, 3000);
    }
    
    showShareErrorMessage(shareLink) {
        // Create error message with manual copy option
        const message = document.createElement('div');
        message.className = 'share-error-message';
        message.innerHTML = `
            <div class="message-content">
                <div>
                    <p style="margin: 0 0 8px 0;">❌ Could not copy automatically. Please copy this link manually:</p>
                    <input type="text" value="${shareLink}" style="width: 100%; padding: 4px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px;" readonly onclick="this.select()">
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="close-btn" style="align-self: flex-start;">&times;</button>
            </div>
        `;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-size: 14px;
            max-width: 400px;
        `;
        
        const messageContent = message.querySelector('.message-content');
        messageContent.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
        `;
        
        const closeBtn = message.querySelector('.close-btn');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            margin: 0;
        `;
        
        document.body.appendChild(message);
        
        // Auto-remove after 10 seconds (longer for manual copy)
        setTimeout(() => {
            if (message.parentElement) {
                message.remove();
            }
        }, 10000);
    }

    /**
     * Update the statistics display
     */
    updateStatisticsDisplay() {
        const stats = this.statisticsManager.getStats();
        const recentSessions = this.statisticsManager.getRecentSessions(10);
        
        // Update stats overview
        this.totalWorkoutsEl.textContent = stats.totalWorkouts;
        this.completedWorkoutsEl.textContent = stats.completedWorkouts;
        this.totalTimeEl.textContent = this.statisticsManager.getFormattedTotalTime();
        this.streakDaysEl.textContent = stats.streakDays;
        
        // Update journal list
        this.updateJournalDisplay(recentSessions);
    }

    /**
     * Update the workout journal display
     * @param {Array} sessions - Array of recent workout sessions
     */
    updateJournalDisplay(sessions) {
        if (sessions.length === 0) {
            this.journalList.innerHTML = '<p class="no-data">No workout sessions yet. Start your first workout to see your progress!</p>';
            return;
        }

        this.journalList.innerHTML = '';
        
        sessions.forEach(session => {
            const journalItem = document.createElement('div');
            journalItem.className = `journal-item ${session.status}`;
            
            const sessionDate = new Date(session.startTime);
            const dateStr = sessionDate.toLocaleDateString();
            const timeStr = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const completedExercises = session.exercises.filter(e => e.completed).length;
            const totalExercises = session.exercises.length;
            
            journalItem.innerHTML = `
                <div class="journal-main">
                    <div class="journal-workout-name">${session.workoutName}</div>
                    <div class="journal-details">
                        <span>📅 ${dateStr}</span>
                        <span>🕐 ${timeStr}</span>
                        <span>⏱️ ${this.statisticsManager.getSessionDuration(session)}</span>
                        <span>✅ ${completedExercises}/${totalExercises} exercises</span>
                    </div>
                </div>
                <div class="journal-status ${session.status}">
                    ${session.status === 'completed' ? '✓ Completed' : '✗ Abandoned'}
                </div>
            `;
            
            this.journalList.appendChild(journalItem);
        });
    }
}