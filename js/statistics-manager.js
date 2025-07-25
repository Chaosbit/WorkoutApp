/**
 * StatisticsManager - Manages workout statistics and session tracking
 */
export class StatisticsManager {
    constructor() {
        this.currentSession = null;
        this.stats = this.loadStats();
        this.sessions = this.loadSessions();
    }

    /**
     * Load statistics from localStorage
     * @returns {Object} Statistics object
     */
    loadStats() {
        try {
            const stored = localStorage.getItem('workoutStats');
            return stored ? JSON.parse(stored) : this.getDefaultStats();
        } catch (error) {
            console.warn('Error loading workout stats:', error);
            return this.getDefaultStats();
        }
    }

    /**
     * Load workout sessions from localStorage
     * @returns {Array} Array of workout sessions
     */
    loadSessions() {
        try {
            const stored = localStorage.getItem('workoutSessions');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Error loading workout sessions:', error);
            return [];
        }
    }

    /**
     * Get default statistics structure
     * @returns {Object} Default stats object
     */
    getDefaultStats() {
        return {
            totalWorkouts: 0,
            completedWorkouts: 0,
            totalTimeSeconds: 0,
            totalExercises: 0,
            streakDays: 0,
            lastWorkoutDate: null,
            firstWorkoutDate: null
        };
    }

    /**
     * Save statistics to localStorage
     */
    saveStats() {
        try {
            localStorage.setItem('workoutStats', JSON.stringify(this.stats));
        } catch (error) {
            console.warn('Error saving workout stats:', error);
        }
    }

    /**
     * Save sessions to localStorage
     */
    saveSessions() {
        try {
            localStorage.setItem('workoutSessions', JSON.stringify(this.sessions));
        } catch (error) {
            console.warn('Error saving workout sessions:', error);
        }
    }

    /**
     * Start a new workout session
     * @param {string} workoutId - ID of the workout
     * @param {string} workoutName - Name of the workout
     * @param {Array} exercises - Array of exercises in the workout
     */
    startSession(workoutId, workoutName, exercises) {
        const now = new Date().toISOString();
        
        this.currentSession = {
            id: `session_${Date.now()}`,
            workoutId,
            workoutName,
            startTime: now,
            endTime: null,
            status: 'in_progress',
            exercises: exercises.map(exercise => ({
                name: exercise.name,
                type: exercise.exerciseType,
                duration: exercise.duration,
                reps: exercise.reps,
                completed: false,
                startTime: null,
                endTime: null
            }))
        };

        // Update stats
        this.stats.totalWorkouts++;
        if (!this.stats.firstWorkoutDate) {
            this.stats.firstWorkoutDate = now;
        }
        this.stats.lastWorkoutDate = now;
        
        this.saveStats();
    }

    /**
     * Start tracking an exercise
     * @param {number} exerciseIndex - Index of the exercise
     */
    startExercise(exerciseIndex) {
        if (!this.currentSession || !this.currentSession.exercises[exerciseIndex]) {
            return;
        }

        const now = new Date().toISOString();
        this.currentSession.exercises[exerciseIndex].startTime = now;
    }

    /**
     * Complete an exercise
     * @param {number} exerciseIndex - Index of the exercise
     */
    completeExercise(exerciseIndex) {
        if (!this.currentSession || !this.currentSession.exercises[exerciseIndex]) {
            return;
        }

        const now = new Date().toISOString();
        const exercise = this.currentSession.exercises[exerciseIndex];
        
        exercise.completed = true;
        exercise.endTime = now;

        // Update stats
        this.stats.totalExercises++;
        
        this.saveStats();
    }

    /**
     * Complete the current workout session
     */
    completeSession() {
        if (!this.currentSession) {
            return;
        }

        const now = new Date().toISOString();
        this.currentSession.endTime = now;
        this.currentSession.status = 'completed';

        // Calculate session duration
        const startTime = new Date(this.currentSession.startTime);
        const endTime = new Date(now);
        const durationSeconds = Math.floor((endTime - startTime) / 1000);

        // Update stats
        this.stats.completedWorkouts++;
        this.stats.totalTimeSeconds += durationSeconds;
        this.updateStreak();

        // Save session
        this.sessions.unshift(this.currentSession); // Add to beginning for recent-first order
        
        // Keep only last 100 sessions to prevent storage bloat
        if (this.sessions.length > 100) {
            this.sessions = this.sessions.slice(0, 100);
        }

        this.saveSessions();
        this.saveStats();
        
        this.currentSession = null;
    }

    /**
     * Abandon the current workout session
     */
    abandonSession() {
        if (!this.currentSession) {
            return;
        }

        const now = new Date().toISOString();
        this.currentSession.endTime = now;
        this.currentSession.status = 'abandoned';

        // Save session (for tracking purposes)
        this.sessions.unshift(this.currentSession);
        
        // Keep only last 100 sessions
        if (this.sessions.length > 100) {
            this.sessions = this.sessions.slice(0, 100);
        }

        this.saveSessions();
        this.currentSession = null;
    }

    /**
     * Update workout streak based on recent activity
     */
    updateStreak() {
        if (this.sessions.length === 0) {
            this.stats.streakDays = 1;
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streak = 0;
        let currentDate = new Date(today);
        
        // Check each day backwards to count consecutive workout days
        for (let i = 0; i < 365; i++) { // Max 365 days
            const dayStart = new Date(currentDate);
            const dayEnd = new Date(currentDate);
            dayEnd.setHours(23, 59, 59, 999);
            
            const hasWorkoutThisDay = this.sessions.some(session => {
                if (session.status !== 'completed') return false;
                const sessionDate = new Date(session.startTime);
                return sessionDate >= dayStart && sessionDate <= dayEnd;
            });
            
            if (hasWorkoutThisDay) {
                streak++;
            } else if (i > 0) { // Don't break on first day (today) if no workout yet
                break;
            }
            
            currentDate.setDate(currentDate.getDate() - 1);
        }
        
        this.stats.streakDays = streak;
    }

    /**
     * Get current statistics
     * @returns {Object} Current statistics
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Get recent workout sessions
     * @param {number} limit - Number of sessions to return (default: 10)
     * @returns {Array} Recent workout sessions
     */
    getRecentSessions(limit = 10) {
        return this.sessions.slice(0, limit);
    }

    /**
     * Get formatted total workout time
     * @returns {string} Formatted time string (e.g., "2h 30m")
     */
    getFormattedTotalTime() {
        const hours = Math.floor(this.stats.totalTimeSeconds / 3600);
        const minutes = Math.floor((this.stats.totalTimeSeconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    /**
     * Get formatted session duration
     * @param {Object} session - Session object
     * @returns {string} Formatted duration string
     */
    getSessionDuration(session) {
        if (!session.endTime) {
            return 'In progress';
        }
        
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        const durationMs = end - start;
        const minutes = Math.floor(durationMs / 60000);
        
        return `${minutes}m`;
    }

    /**
     * Clear all statistics and sessions (for testing/reset)
     */
    clearAllData() {
        this.stats = this.getDefaultStats();
        this.sessions = [];
        this.currentSession = null;
        
        localStorage.removeItem('workoutStats');
        localStorage.removeItem('workoutSessions');
    }
}