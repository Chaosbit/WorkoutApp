/**
 * TrainingPlanManager - Manages training plan storage and calendar functionality
 */
export class TrainingPlanManager {
    constructor(workoutLibrary) {
        this.workoutLibrary = workoutLibrary;
        this.trainingPlans = this.loadTrainingPlans();
        this.currentDate = new Date();
        this.currentMonth = this.currentDate.getMonth();
        this.currentYear = this.currentDate.getFullYear();
    }

    /**
     * Load training plans from localStorage
     * @returns {Object} Object containing training plan data keyed by date
     */
    loadTrainingPlans() {
        try {
            const stored = localStorage.getItem('trainingPlans');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.warn('Error loading training plans:', error);
            return {};
        }
    }

    /**
     * Save training plans to localStorage
     */
    saveTrainingPlans() {
        try {
            localStorage.setItem('trainingPlans', JSON.stringify(this.trainingPlans));
        } catch (error) {
            console.warn('Error saving training plans:', error);
        }
    }

    /**
     * Get the key for a specific date
     * @param {Date} date - The date
     * @returns {string} Date key in YYYY-MM-DD format
     */
    getDateKey(date) {
        if (!date || typeof date.toISOString !== 'function') {
            console.warn('Invalid date passed to getDateKey:', date);
            return new Date().toISOString().split('T')[0]; // fallback to today
        }
        return date.toISOString().split('T')[0];
    }

    /**
     * Assign a workout to a specific date
     * @param {Date} date - The date to assign workout to
     * @param {string} workoutId - The workout ID
     */
    assignWorkout(date, workoutId) {
        const dateKey = this.getDateKey(date);
        if (!this.trainingPlans[dateKey]) {
            this.trainingPlans[dateKey] = [];
        }
        
        // Check if workout is already assigned to this date
        if (!this.trainingPlans[dateKey].includes(workoutId)) {
            this.trainingPlans[dateKey].push(workoutId);
            this.saveTrainingPlans();
        }
    }

    /**
     * Remove a workout from a specific date
     * @param {Date} date - The date to remove workout from
     * @param {string} workoutId - The workout ID
     */
    removeWorkout(date, workoutId) {
        const dateKey = this.getDateKey(date);
        if (this.trainingPlans[dateKey]) {
            this.trainingPlans[dateKey] = this.trainingPlans[dateKey].filter(id => id !== workoutId);
            if (this.trainingPlans[dateKey].length === 0) {
                delete this.trainingPlans[dateKey];
            }
            this.saveTrainingPlans();
        }
    }

    /**
     * Get workouts assigned to a specific date
     * @param {string|Date} dateOrKey - The date or date key
     * @returns {Array} Array of workout IDs
     */
    getWorkoutsForDate(dateOrKey) {
        let dateKey;
        if (typeof dateOrKey === 'string') {
            dateKey = dateOrKey;
        } else {
            dateKey = this.getDateKey(dateOrKey);
        }
        return this.trainingPlans[dateKey] || [];
    }

    /**
     * Get workout objects for a specific date
     * @param {string|Date} dateOrKey - The date or date key
     * @returns {Array} Array of workout objects
     */
    getWorkoutObjectsForDate(dateOrKey) {
        const workoutIds = this.getWorkoutsForDate(dateOrKey);
        return workoutIds.map(id => this.workoutLibrary.getWorkout(id)).filter(workout => workout);
    }

    /**
     * Get all available workouts for assignment
     * @returns {Array} Array of workout objects from the library
     */
    getAvailableWorkouts() {
        return this.workoutLibrary.getWorkouts();
    }

    /**
     * Generate calendar data for the current month
     * @returns {Object} Calendar data with days and workout assignments
     */
    generateCalendarData() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const calendar = {
            year: this.currentYear,
            month: this.currentMonth,
            monthName: firstDay.toLocaleString('default', { month: 'long' }),
            days: []
        };

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendar.days.push(null);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const workouts = this.getWorkoutsForDate(date);
            
            calendar.days.push({
                date: day,
                fullDate: date,
                workouts: workouts,
                isToday: this.isToday(date)
            });
        }

        return calendar;
    }

    /**
     * Check if a date is today
     * @param {Date} date - The date to check
     * @returns {boolean} True if the date is today
     */
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    /**
     * Navigate to previous month
     */
    previousMonth() {
        if (this.currentMonth === 0) {
            this.currentMonth = 11;
            this.currentYear--;
        } else {
            this.currentMonth--;
        }
    }

    /**
     * Navigate to next month
     */
    nextMonth() {
        if (this.currentMonth === 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else {
            this.currentMonth++;
        }
    }

    /**
     * Navigate to current month
     */
    goToCurrentMonth() {
        const today = new Date();
        this.currentMonth = today.getMonth();
        this.currentYear = today.getFullYear();
    }
}