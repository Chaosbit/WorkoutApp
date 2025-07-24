/**
 * WorkoutLibrary - Manages storage and retrieval of workout data in localStorage
 */
export class WorkoutLibrary {
    constructor() {
        this.workouts = this.loadWorkouts();
    }

    /**
     * Load workouts from localStorage
     * @returns {Array} Array of saved workouts
     */
    loadWorkouts() {
        try {
            const stored = localStorage.getItem('workoutLibrary');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('Error loading workout library:', error);
            return [];
        }
    }

    /**
     * Save workouts to localStorage
     */
    saveWorkouts() {
        try {
            localStorage.setItem('workoutLibrary', JSON.stringify(this.workouts));
        } catch (error) {
            console.warn('Error saving workout library:', error);
        }
    }

    /**
     * Add or update a workout in the library
     * @param {string} filename - Filename of the workout
     * @param {string} content - Raw markdown content
     * @param {Object} workoutData - Parsed workout data
     * @returns {Object} The added/updated workout
     */
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

    /**
     * Get a workout by ID
     * @param {string} id - Workout ID
     * @returns {Object|undefined} The workout or undefined if not found
     */
    getWorkout(id) {
        return this.workouts.find(w => w.id === id);
    }

    /**
     * Get all workouts
     * @returns {Array} Copy of all workouts
     */
    getAllWorkouts() {
        return [...this.workouts];
    }

    /**
     * Delete a workout by ID
     * @param {string} id - Workout ID to delete
     */
    deleteWorkout(id) {
        this.workouts = this.workouts.filter(w => w.id !== id);
        this.saveWorkouts();
    }

    /**
     * Rename a workout
     * @param {string} id - Workout ID
     * @param {string} newName - New name for the workout
     */
    renameWorkout(id, newName) {
        const workout = this.getWorkout(id);
        if (workout) {
            workout.name = newName;
            this.saveWorkouts();
        }
    }
}