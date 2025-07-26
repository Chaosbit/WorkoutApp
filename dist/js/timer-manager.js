import { APP_CONFIG, APP_UTILS } from './constants.js';

/**
 * TimerManager - Handles countdown timer functionality for exercises
 */
export class TimerManager {
    constructor() {
        this.timeRemaining = 0;
        this.isRunning = false;
        this.intervalId = null;
        this.currentExercise = null;
        this.onTick = null;
        this.onComplete = null;
        this.lastSecondUpdate = 0; // Track when we last decremented a full second
    }

    /**
     * Set the current exercise for timing
     * @param {Object} exercise - Exercise object with duration
     */
    setExercise(exercise) {
        this.currentExercise = exercise;
        this.timeRemaining = exercise.duration || 0;
    }

    /**
     * Set callback for timer tick events
     * @param {Function} callback - Called every second with timeRemaining
     */
    setOnTick(callback) {
        this.onTick = callback;
    }

    /**
     * Set callback for timer completion
     * @param {Function} callback - Called when timer reaches zero
     */
    setOnComplete(callback) {
        this.onComplete = callback;
    }

    /**
     * Start the countdown timer
     */
    start() {
        this.stop(); // Clear any existing timer
        this.isRunning = true;
        this.lastSecondUpdate = Date.now();
        
        // Use configured interval for smooth progress bar updates
        this.intervalId = setInterval(() => {
            const now = APP_UTILS.now();
            const timeSinceLastSecond = now - this.lastSecondUpdate;
            
            // Decrement a full second if 1000ms or more have passed
            if (timeSinceLastSecond >= APP_CONFIG.PERFORMANCE.TIMER_PRECISION) {
                this.timeRemaining--;
                this.lastSecondUpdate = now;
                
                // Check if timer completed
                if (this.timeRemaining <= 0) {
                    this.complete();
                    return;
                }
            }
            
            // Call tick callback if provided (this will update UI including progress bar)
            if (this.onTick) {
                this.onTick(this.timeRemaining);
            }
        }, APP_CONFIG.TIMER_UPDATE_INTERVAL); // Update frequency from config
    }

    /**
     * Stop the timer
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
    }

    /**
     * Pause the timer (maintains running state for resume)
     */
    pause() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        // Keep isRunning true for resume functionality
    }

    /**
     * Resume the timer if it was running
     */
    resume() {
        if (this.isRunning && !this.intervalId) {
            this.start();
        }
    }

    /**
     * Reset timer to initial state
     */
    reset() {
        this.stop();
        if (this.currentExercise) {
            this.timeRemaining = this.currentExercise.duration || 0;
        }
        this.lastSecondUpdate = 0;
    }

    /**
     * Handle timer completion
     * @private
     */
    complete() {
        this.stop();
        if (this.onComplete) {
            this.onComplete();
        }
    }

    /**
     * Format time in MM:SS format using utility
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    formatTime(seconds) {
        return APP_UTILS.formatTime(seconds);
    }

    /**
     * Get current time remaining
     * @returns {number} Seconds remaining
     */
    getTimeRemaining() {
        return this.timeRemaining;
    }

    /**
     * Get formatted time remaining
     * @returns {string} Formatted time string
     */
    getFormattedTime() {
        return this.formatTime(this.timeRemaining);
    }

    /**
     * Calculate progress percentage
     * @returns {number} Progress as percentage (0-100)
     */
    getProgress() {
        if (!this.currentExercise || !this.currentExercise.duration) {
            return 0;
        }
        
        // Calculate sub-second progress for smoother animation
        const now = Date.now();
        const timeSinceLastSecond = this.isRunning ? (now - this.lastSecondUpdate) / 1000 : 0;
        const preciseTimeRemaining = Math.max(0, this.timeRemaining - timeSinceLastSecond);
        const elapsed = this.currentExercise.duration - preciseTimeRemaining;
        
        return Math.max(0, Math.min(100, (elapsed / this.currentExercise.duration) * 100));
    }
}