class WorkoutParser {
    static parseMarkdown(content) {
        const lines = content.split('\n').map(line => line.trim());
        const workout = {
            title: '',
            exercises: []
        };
        
        let currentExercise = null;
        let descriptionLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (!line) continue;
            
            if (line.startsWith('# ')) {
                workout.title = line.substring(2).trim();
            } else if (line.startsWith('## ') || line.startsWith('### ')) {
                if (currentExercise && descriptionLines.length > 0) {
                    currentExercise.description = descriptionLines.join('\n').trim();
                    descriptionLines = [];
                }
                
                const exerciseLine = line.replace(/^#{2,3}\s+/, '');
                
                // Check for sets syntax: "Exercise Name - 3 sets x 0:30 / 0:15"
                const setsMatch = exerciseLine.match(/^(.+?)\s*-\s*(\d+)\s+sets?\s*x\s*(\d+):(\d+)\s*\/\s*(\d+):(\d+)$/);
                if (setsMatch) {
                    const [, name, sets, exMinutes, exSeconds, restMinutes, restSeconds] = setsMatch;
                    const exerciseDuration = parseInt(exMinutes) * 60 + parseInt(exSeconds);
                    const restDuration = parseInt(restMinutes) * 60 + parseInt(restSeconds);
                    const numSets = parseInt(sets);
                    
                    // Add each set as separate exercises
                    for (let setNum = 1; setNum <= numSets; setNum++) {
                        currentExercise = {
                            name: `${name.trim()} (Set ${setNum}/${numSets})`,
                            duration: exerciseDuration,
                            exerciseType: 'timer',
                            type: 'exercise',
                            description: '',
                            setInfo: {
                                exerciseName: name.trim(),
                                setNumber: setNum,
                                totalSets: numSets,
                                isSet: true
                            }
                        };
                        workout.exercises.push(currentExercise);
                        
                        // Add rest between sets (except after the last set)
                        if (setNum < numSets) {
                            const restExercise = {
                                name: 'Rest between sets',
                                duration: restDuration,
                                exerciseType: 'timer',
                                type: 'rest',
                                description: 'Rest before the next set',
                                setInfo: {
                                    exerciseName: name.trim(),
                                    setNumber: setNum,
                                    totalSets: numSets,
                                    isRest: true
                                }
                            };
                            workout.exercises.push(restExercise);
                        }
                    }
                    continue;
                }
                
                // Check for regular time syntax: "Exercise Name - 1:30"
                const timeMatch = exerciseLine.match(/^(.+?)\s*-\s*(\d+):(\d+)$/);
                // Check for rep syntax: "Exercise Name - 10 reps"
                const repMatch = exerciseLine.match(/^(.+?)\s*-\s*(\d+)\s+reps?$/i);
                if (timeMatch) {
                    const [, name, minutes, seconds] = timeMatch;
                    const duration = parseInt(minutes) * 60 + parseInt(seconds);
                    currentExercise = {
                        name: name.trim(),
                        duration: duration,
                        exerciseType: 'timer',
                        type: 'exercise',
                        description: ''
                    };
                    workout.exercises.push(currentExercise);
                } else if (repMatch) {
                    const [, name, reps] = repMatch;
                    currentExercise = {
                        name: name.trim(),
                        reps: parseInt(reps),
                        exerciseType: 'reps',
                        type: 'exercise',
                        completed: false,
                        description: ''
                    };
                    workout.exercises.push(currentExercise);
                } else {
                    // For validation purposes, exercises should have explicit time formats
                    // If no time format is found, this could be an error
                    throw new Error(`Exercise "${exerciseLine}" is missing time format (e.g., "- 1:30")`);
                }
            } else if (line.toLowerCase().startsWith('rest') && line.includes('-')) {
                if (currentExercise && descriptionLines.length > 0) {
                    currentExercise.description = descriptionLines.join('\n').trim();
                    descriptionLines = [];
                }
                
                const match = line.match(/rest\s*-\s*(\d+):(\d+)/i);
                if (match) {
                    const [, minutes, seconds] = match;
                    const duration = parseInt(minutes) * 60 + parseInt(seconds);
                    currentExercise = {
                        name: 'Rest',
                        duration: duration,
                        exerciseType: 'timer',
                        type: 'rest',
                        description: 'Take a break and prepare for the next exercise'
                    };
                    workout.exercises.push(currentExercise);
                }
            } else if (currentExercise && line && !line.startsWith('#')) {
                descriptionLines.push(line);
            }
        }
        
        if (currentExercise && descriptionLines.length > 0) {
            currentExercise.description = descriptionLines.join('\n').trim();
        }
        
        return workout;
    }
}

class WorkoutLibrary {
    constructor() {
        this.workouts = this.loadWorkouts();
    }

    loadWorkouts() {
        try {
            const stored = localStorage.getItem('workoutLibrary');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Error loading workout library:', error);
            return [];
        }
    }

    saveWorkouts() {
        try {
            localStorage.setItem('workoutLibrary', JSON.stringify(this.workouts));
        } catch (error) {
            console.warn('Error saving workout library:', error);
        }
    }

    addWorkout(filename, content, workoutData) {
        const id = Date.now().toString();
        const workout = {
            id,
            name: filename.replace('.md', ''),
            filename,
            content,
            data: workoutData,
            dateAdded: new Date().toISOString()
        };
        
        // Check if workout with same name already exists
        const existingIndex = this.workouts.findIndex(w => w.name === workout.name);
        if (existingIndex !== -1) {
            // Update existing workout
            this.workouts[existingIndex] = { ...this.workouts[existingIndex], ...workout, id: this.workouts[existingIndex].id };
        } else {
            // Add new workout
            this.workouts.push(workout);
        }
        
        this.saveWorkouts();
        return workout;
    }

    getWorkout(id) {
        return this.workouts.find(w => w.id === id);
    }

    getAllWorkouts() {
        return [...this.workouts];
    }

    deleteWorkout(id) {
        this.workouts = this.workouts.filter(w => w.id !== id);
        this.saveWorkouts();
    }

    renameWorkout(id, newName) {
        const workout = this.getWorkout(id);
        if (workout) {
            workout.name = newName;
            this.saveWorkouts();
        }
    }
}

class WorkoutTimer {
    constructor() {
        this.workout = null;
        this.currentWorkoutId = null;
        this.currentExerciseIndex = 0;
        this.timeRemaining = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.intervalId = null;
        this.audioContext = null;
        this.library = new WorkoutLibrary();
        this.isAdvancing = false; // Flag to prevent double advancement
        this.lastCompletionTime = 0; // Timestamp for double-click prevention
        
        this.initializeElements();
        this.bindEvents();
        this.initializeAudio();
        this.loadWorkoutSelector();
    }
    
    initializeElements() {
        this.fileInput = document.getElementById('workoutFile');
        this.workoutDisplay = document.getElementById('workoutDisplay');
        this.workoutTitle = document.getElementById('workoutTitle');
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
        
        // New workout button
        this.newWorkoutBtn = document.getElementById('newWorkoutBtn');
        
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.resetBtn = document.getElementById('resetBtn');
    }
    
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
    
    initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported');
        }
    }
    
    playSound(frequency = 800, duration = 500, type = 'sine') {
        if (!this.audioContext) return;
        
        try {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.warn('Error playing sound:', error);
        }
    }
    
    async loadWorkoutFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const content = await file.text();
            const workoutData = WorkoutParser.parseMarkdown(content);
            
            // Add to library
            const savedWorkout = this.library.addWorkout(file.name, content, workoutData);
            this.currentWorkoutId = savedWorkout.id;
            
            // Set as current workout
            this.workout = workoutData;
            this.displayWorkout();
            this.loadWorkoutSelector();
            
            // Clear file input
            event.target.value = '';
        } catch (error) {
            alert('Error reading workout file: ' + error.message);
        }
    }

    loadWorkoutSelector() {
        const workouts = this.library.getAllWorkouts();
        
        // Clear existing options (except placeholder)
        this.workoutSelect.innerHTML = '<option value="">Choose a saved workout...</option>';
        
        // Add workout options
        workouts.forEach(workout => {
            const option = document.createElement('option');
            option.value = workout.id;
            option.textContent = workout.name;
            if (workout.id === this.currentWorkoutId) {
                option.selected = true;
            }
            this.workoutSelect.appendChild(option);
        });
        
        // Show/hide library section
        if (workouts.length > 0) {
            this.workoutLibrarySection.style.display = 'block';
        } else {
            this.workoutLibrarySection.style.display = 'none';
        }
        
        // Update delete button state
        this.updateDeleteButtonState();
    }

    selectWorkout(event) {
        const workoutId = event.target.value;
        
        if (!workoutId) {
            this.currentWorkoutId = null;
            this.workout = null;
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

    deleteSelectedWorkout() {
        if (!this.currentWorkoutId) return;
        
        const savedWorkout = this.library.getWorkout(this.currentWorkoutId);
        if (!savedWorkout) return;
        
        if (confirm(`Are you sure you want to delete "${savedWorkout.name}"?`)) {
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

    updateDeleteButtonState() {
        this.deleteWorkoutBtn.disabled = !this.currentWorkoutId;
        this.editWorkoutBtn.disabled = !this.currentWorkoutId;
    }
    
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
                    const currentTime = this.timeRemaining;
                    
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
                        if (this.timeRemaining < currentTime) {
                            this.timeRemaining = Math.min(currentTime, this.workout.exercises[currentIndex].duration);
                        } else {
                            this.timeRemaining = currentTime;
                        }
                        this.updateDisplay();
                        this.updateProgressBar();
                    } else {
                        // If current exercise index is out of bounds, reset to beginning
                        this.resetWorkout();
                    }
                    
                    // Restore running state if it was active
                    if (wasRunning) {
                        this.isRunning = true;
                        this.isPaused = false;
                        this.startTimer();
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
    
    displayWorkout() {
        if (!this.workout) return;
        
        this.workoutTitle.textContent = this.workout.title || 'Workout';
        this.workoutDisplay.style.display = 'block';
        
        // Hide the sample format when a workout is loaded
        const sampleFormat = document.querySelector('.sample-format');
        if (sampleFormat) {
            sampleFormat.style.display = 'none';
        }
        
        this.renderWorkoutList();
        this.resetWorkout();
    }
    
    renderWorkoutList() {
        this.workoutList.innerHTML = '';
        
        this.workout.exercises.forEach((exercise, index) => {
            const item = document.createElement('div');
            item.className = 'exercise-item pending';
            
            const hasDescription = exercise.description && exercise.description.trim().length > 0;
            const isRepBased = exercise.exerciseType === 'reps';
            const displayDuration = isRepBased ? `${exercise.reps} reps` : this.formatTime(exercise.duration);
            
            item.innerHTML = `
                <div class="exercise-header" ${hasDescription ? `onclick="this.parentElement.classList.toggle('expanded')"` : ''}>
                    <span class="exercise-name">${exercise.name}</span>
                    <div class="exercise-meta">
                        <span class="exercise-duration ${isRepBased ? 'reps-based' : ''}">${displayDuration}</span>
                        ${hasDescription ? '<span class="expand-icon">▼</span>' : ''}
                    </div>
                </div>
                ${hasDescription ? `
                    <div class="exercise-description">
                        ${exercise.description.split('\n').map(line => `<p>${line}</p>`).join('')}
                    </div>
                ` : ''}
            `;
            
            this.workoutList.appendChild(item);
        });
    }
    
    updateWorkoutList() {
        const items = this.workoutList.querySelectorAll('.exercise-item');
        items.forEach((item, index) => {
            item.className = 'exercise-item';
            if (index < this.currentExerciseIndex) {
                item.classList.add('completed');
            } else if (index === this.currentExerciseIndex) {
                item.classList.add('current');
            } else {
                item.classList.add('pending');
            }
        });
    }
    
    startWorkout() {
        if (!this.workout || this.workout.exercises.length === 0) {
            alert('Please load a workout file first');
            return;
        }
        
        this.isRunning = true;
        this.isPaused = false;
        this.updateControls();
        
        if (this.timeRemaining === 0 && this.currentExerciseIndex < this.workout.exercises.length) {
            this.loadCurrentExercise();
        }
        
        const currentExercise = this.workout.exercises[this.currentExerciseIndex];
        if (currentExercise && currentExercise.exerciseType === 'timer') {
            this.startTimer();
        }
    }
    
    pauseWorkout() {
        this.isPaused = true;
        this.isRunning = false;
        this.stopTimer();
        this.updateControls();
    }
    
    skipExercise() {
        this.nextExercise();
    }
    
    completeRepExercise() {
        // Add protection against rapid successive calls
        if (this.isAdvancing) return;
        
        const exercise = this.workout.exercises[this.currentExerciseIndex];
        
        // Prevent double completion - only allow if exercise is not completed yet
        if (exercise && exercise.exerciseType === 'reps' && this.isRunning && !exercise.completed) {
            exercise.completed = true;
            this.nextExercise();
        }
    }
    
    resetWorkout() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentExerciseIndex = 0;
        this.timeRemaining = 0;
        this.stopTimer();
        
        if (this.workout && this.workout.exercises.length > 0) {
            this.loadCurrentExercise();
        }
        
        this.updateControls();
        this.updateWorkoutList();
    }
    
    loadCurrentExercise() {
        if (!this.workout || this.currentExerciseIndex >= this.workout.exercises.length) {
            this.completeWorkout();
            return;
        }
        
        // Stop any existing timer to prevent it from interfering with rep-based exercises
        this.stopTimer();
        
        const exercise = this.workout.exercises[this.currentExerciseIndex];
        this.currentExercise.textContent = exercise.name;
        
        if (exercise.exerciseType === 'reps') {
            // Rep-based exercise
            this.timeRemaining = 0;
            this.timerDisplay.style.display = 'none';
            this.repsDisplay.style.display = 'block';
            this.repCompletion.style.display = 'block';
            this.repsCount.textContent = exercise.reps;
            
            // Reset completion state
            exercise.completed = false;
            
            // Set progress bar to 0 for rep exercises
            this.progressFill.style.width = '0%';
        } else {
            // Timer-based exercise
            this.timeRemaining = exercise.duration;
            this.timerDisplay.style.display = 'block';
            this.repsDisplay.style.display = 'none';
            this.repCompletion.style.display = 'none';
            
            // Reset progress bar for timer exercises
            this.progressFill.style.width = '0%';
        }
        
        if (exercise.description && exercise.description.trim().length > 0) {
            this.descriptionContent.innerHTML = exercise.description.split('\n').map(line => `<p>${line}</p>`).join('');
            this.currentDescription.style.display = 'block';
            this.currentDescription.classList.remove('expanded');
        } else {
            this.currentDescription.style.display = 'none';
        }
        
        this.updateDisplay();
        this.updateProgress();
        this.updateWorkoutList();
        this.updateControls();
    }
    
    startTimer() {
        this.stopTimer();
        this.intervalId = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            this.updateProgressBar();
            
            if (this.timeRemaining <= 0) {
                this.nextExercise();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    nextExercise() {
        if (this.isAdvancing) return; // Prevent rapid succession calls
        this.isAdvancing = true;
        
        this.stopTimer(); // Always stop timer first
        this.playSound(600, 300);
        this.currentExerciseIndex++;
        
        if (this.currentExerciseIndex >= this.workout.exercises.length) {
            this.completeWorkout();
        } else {
            this.loadCurrentExercise();
            if (this.isRunning) {
                const currentExercise = this.workout.exercises[this.currentExerciseIndex];
                if (currentExercise && currentExercise.exerciseType === 'timer') {
                    this.startTimer();
                }
            }
        }
        
        // Reset the flag after a very short delay to prevent rapid successive calls
        setTimeout(() => {
            this.isAdvancing = false;
        }, 10);
    }
    
    completeWorkout() {
        this.stopTimer();
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
        
        this.playCompletionSound();
        
        setTimeout(() => {
            alert('Workout completed! Great job! 💪');
        }, 500);
    }
    
    playCompletionSound() {
        setTimeout(() => this.playSound(523, 200), 0);
        setTimeout(() => this.playSound(659, 200), 200); 
        setTimeout(() => this.playSound(784, 400), 400);
    }
    
    updateDisplay() {
        this.timerDisplay.textContent = this.formatTime(this.timeRemaining);
        this.updateProgress();
    }
    
    updateProgress() {
        if (this.workout && this.workout.exercises.length > 0) {
            this.progressText.textContent = `Exercise ${this.currentExerciseIndex + 1} of ${this.workout.exercises.length}`;
        }
    }
    
    updateProgressBar() {
        if (!this.workout || this.currentExerciseIndex >= this.workout.exercises.length) return;
        
        const exercise = this.workout.exercises[this.currentExerciseIndex];
        const progress = ((exercise.duration - this.timeRemaining) / exercise.duration) * 100;
        this.progressFill.style.width = `${Math.max(0, Math.min(100, progress))}%`;
    }
    
    updateControls() {
        const currentExercise = this.workout && this.currentExerciseIndex < this.workout.exercises.length 
            ? this.workout.exercises[this.currentExerciseIndex] 
            : null;
        const isRepBased = currentExercise && currentExercise.exerciseType === 'reps';
        
        this.startBtn.disabled = this.isRunning;
        this.pauseBtn.disabled = !this.isRunning || isRepBased;
        this.skipBtn.disabled = !this.isRunning && !this.isPaused;
        
        // For rep-based exercises, enable skip when workout is running
        if (isRepBased && this.isRunning) {
            this.skipBtn.disabled = false;
        }
        
        // Enable complete rep button for rep exercises when not completed
        if (this.completeRepBtn) {
            if (isRepBased) {
                this.completeRepBtn.disabled = (currentExercise && currentExercise.completed);
            } else {
                // For timer exercises, button should not be visible anyway
                this.completeRepBtn.disabled = true;
            }
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

window.WorkoutTimer = WorkoutTimer;

document.addEventListener('DOMContentLoaded', () => {
    new WorkoutTimer();
});