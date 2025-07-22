class WorkoutParser {
    static parseMarkdown(content) {
        const lines = content.split('\n').map(line => line.trim()).filter(line => line);
        const workout = {
            title: '',
            exercises: []
        };
        
        let currentSection = null;
        
        for (const line of lines) {
            if (line.startsWith('# ')) {
                workout.title = line.substring(2).trim();
            } else if (line.startsWith('## ') || line.startsWith('### ')) {
                const exerciseLine = line.replace(/^#{2,3}\s+/, '');
                const match = exerciseLine.match(/^(.+?)\s*-\s*(\d+):(\d+)$/);
                
                if (match) {
                    const [, name, minutes, seconds] = match;
                    const duration = parseInt(minutes) * 60 + parseInt(seconds);
                    workout.exercises.push({
                        name: name.trim(),
                        duration: duration,
                        type: 'exercise'
                    });
                } else {
                    workout.exercises.push({
                        name: exerciseLine,
                        duration: 60,
                        type: 'exercise'
                    });
                }
            } else if (line.toLowerCase().includes('rest') && line.includes('-')) {
                const match = line.match(/rest\s*-\s*(\d+):(\d+)/i);
                if (match) {
                    const [, minutes, seconds] = match;
                    const duration = parseInt(minutes) * 60 + parseInt(seconds);
                    workout.exercises.push({
                        name: 'Rest',
                        duration: duration,
                        type: 'rest'
                    });
                }
            }
        }
        
        return workout;
    }
}

class WorkoutTimer {
    constructor() {
        this.workout = null;
        this.currentExerciseIndex = 0;
        this.timeRemaining = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.intervalId = null;
        this.audioContext = null;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeAudio();
    }
    
    initializeElements() {
        this.fileInput = document.getElementById('workoutFile');
        this.workoutDisplay = document.getElementById('workoutDisplay');
        this.workoutTitle = document.getElementById('workoutTitle');
        this.currentExercise = document.getElementById('currentExercise');
        this.timerDisplay = document.getElementById('timerDisplay');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.workoutList = document.getElementById('workoutList');
        
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.resetBtn = document.getElementById('resetBtn');
    }
    
    bindEvents() {
        this.fileInput.addEventListener('change', (e) => this.loadWorkoutFile(e));
        this.startBtn.addEventListener('click', () => this.startWorkout());
        this.pauseBtn.addEventListener('click', () => this.pauseWorkout());
        this.skipBtn.addEventListener('click', () => this.skipExercise());
        this.resetBtn.addEventListener('click', () => this.resetWorkout());
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
            this.workout = WorkoutParser.parseMarkdown(content);
            this.displayWorkout();
        } catch (error) {
            alert('Error reading workout file: ' + error.message);
        }
    }
    
    displayWorkout() {
        if (!this.workout) return;
        
        this.workoutTitle.textContent = this.workout.title || 'Workout';
        this.workoutDisplay.style.display = 'block';
        
        this.renderWorkoutList();
        this.resetWorkout();
    }
    
    renderWorkoutList() {
        this.workoutList.innerHTML = '';
        
        this.workout.exercises.forEach((exercise, index) => {
            const item = document.createElement('div');
            item.className = 'exercise-item pending';
            item.innerHTML = `
                <span class="exercise-name">${exercise.name}</span>
                <span class="exercise-duration">${this.formatTime(exercise.duration)}</span>
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
        
        if (this.timeRemaining === 0) {
            this.loadCurrentExercise();
        }
        
        this.startTimer();
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
        
        const exercise = this.workout.exercises[this.currentExerciseIndex];
        this.timeRemaining = exercise.duration;
        this.currentExercise.textContent = exercise.name;
        this.updateDisplay();
        this.updateProgress();
        this.updateWorkoutList();
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
        this.playSound(600, 300);
        this.currentExerciseIndex++;
        
        if (this.currentExerciseIndex >= this.workout.exercises.length) {
            this.completeWorkout();
        } else {
            this.loadCurrentExercise();
            if (this.isRunning) {
                this.startTimer();
            }
        }
    }
    
    completeWorkout() {
        this.stopTimer();
        this.isRunning = false;
        this.isPaused = false;
        this.currentExercise.textContent = 'Workout Complete! 🎉';
        this.timerDisplay.textContent = '00:00';
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
        this.startBtn.disabled = this.isRunning;
        this.pauseBtn.disabled = !this.isRunning;
        this.skipBtn.disabled = !this.isRunning && !this.isPaused;
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WorkoutTimer();
});