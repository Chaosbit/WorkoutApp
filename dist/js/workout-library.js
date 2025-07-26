import { APP_CONFIG, APP_UTILS } from './constants.js';

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
            const stored = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.WORKOUTS);
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
            localStorage.setItem(APP_CONFIG.STORAGE_KEYS.WORKOUTS, JSON.stringify(this.workouts));
        } catch (error) {
            console.warn('Error saving workout library:', error);
            throw new Error(APP_CONFIG.ERROR_MESSAGES.WORKOUT_SAVE_FAILED);
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
        const id = APP_UTILS.generateId();
        const workout = {
            id,
            name: filename.replace('.md', ''),
            filename,
            content,
            data: workoutData,
            dateAdded: new Date().toISOString(),
            tags: [], // New: support for tagging workouts
            lastUsed: null, // New: track when workout was last used
            timesCompleted: 0 // New: track completion count
        };
        
        // Check if workout with same name already exists
        const existingIndex = this.workouts.findIndex(w => w.name === workout.name);
        if (existingIndex !== -1) {
            // Update existing workout, preserve existing tags and stats
            const existing = this.workouts[existingIndex];
            this.workouts[existingIndex] = { 
                ...existing, 
                ...workout, 
                id: existing.id,
                tags: existing.tags || [],
                lastUsed: existing.lastUsed,
                timesCompleted: existing.timesCompleted || 0
            };
            return this.workouts[existingIndex];
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
     * Get all workouts (alias for getAllWorkouts for consistency)
     * @returns {Array} Copy of all workouts
     */
    getWorkouts() {
        return this.getAllWorkouts();
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

    /**
     * Add a tag to a workout
     * @param {string} id - Workout ID
     * @param {string} tag - Tag to add
     */
    addTag(id, tag) {
        const workout = this.getWorkout(id);
        if (workout && tag.trim()) {
            const normalizedTag = tag.trim().toLowerCase();
            if (!workout.tags) workout.tags = [];
            if (!workout.tags.includes(normalizedTag)) {
                workout.tags.push(normalizedTag);
                this.saveWorkouts();
            }
        }
    }

    /**
     * Remove a tag from a workout
     * @param {string} id - Workout ID
     * @param {string} tag - Tag to remove
     */
    removeTag(id, tag) {
        const workout = this.getWorkout(id);
        if (workout && workout.tags) {
            const normalizedTag = tag.trim().toLowerCase();
            workout.tags = workout.tags.filter(t => t !== normalizedTag);
            this.saveWorkouts();
        }
    }

    /**
     * Set tags for a workout (replaces existing tags)
     * @param {string} id - Workout ID
     * @param {Array} tags - Array of tags
     */
    setTags(id, tags) {
        const workout = this.getWorkout(id);
        if (workout) {
            workout.tags = tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);
            this.saveWorkouts();
        }
    }

    /**
     * Get all unique tags across all workouts
     * @returns {Array} Array of unique tags
     */
    getAllTags() {
        const tagSet = new Set();
        this.workouts.forEach(workout => {
            if (workout.tags) {
                workout.tags.forEach(tag => tagSet.add(tag));
            }
        });
        return Array.from(tagSet).sort();
    }

    /**
     * Update workout usage statistics (call when workout is selected/completed)
     * @param {string} id - Workout ID
     * @param {boolean} completed - Whether the workout was completed
     */
    updateWorkoutStats(id, completed = false) {
        const workout = this.getWorkout(id);
        if (workout) {
            workout.lastUsed = new Date().toISOString();
            if (completed) {
                workout.timesCompleted = (workout.timesCompleted || 0) + 1;
            }
            this.saveWorkouts();
        }
    }

    /**
     * Calculate total duration of a workout in seconds
     * @param {Object} workoutData - Parsed workout data
     * @returns {number} Total duration in seconds
     */
    calculateWorkoutDuration(workoutData) {
        if (!workoutData || !workoutData.exercises) return 0;
        return workoutData.exercises.reduce((total, exercise) => {
            return total + (exercise.duration || 0);
        }, 0);
    }

    /**
     * Get filtered and sorted workouts
     * @param {Object} options - Filtering and sorting options
     * @param {Array} options.tags - Tags to filter by (OR logic)
     * @param {number} options.minDuration - Minimum duration in seconds
     * @param {number} options.maxDuration - Maximum duration in seconds
     * @param {string} options.sortBy - Sort criteria ('name', 'dateAdded', 'lastUsed', 'timesCompleted', 'duration')
     * @param {string} options.sortOrder - Sort order ('asc' or 'desc')
     * @returns {Array} Filtered and sorted workouts
     */
    getFilteredWorkouts(options = {}) {
        let workouts = [...this.workouts];

        // Apply tag filter
        if (options.tags && options.tags.length > 0) {
            workouts = workouts.filter(workout => {
                if (!workout.tags || workout.tags.length === 0) return false;
                return options.tags.some(tag => workout.tags.includes(tag.toLowerCase()));
            });
        }

        // Apply duration filter
        if (options.minDuration !== undefined || options.maxDuration !== undefined) {
            workouts = workouts.filter(workout => {
                const duration = this.calculateWorkoutDuration(workout.data);
                if (options.minDuration !== undefined && duration < options.minDuration) return false;
                if (options.maxDuration !== undefined && duration > options.maxDuration) return false;
                return true;
            });
        }

        // Apply sorting
        if (options.sortBy) {
            workouts.sort((a, b) => {
                let valueA, valueB;

                switch (options.sortBy) {
                    case 'name':
                        valueA = a.name.toLowerCase();
                        valueB = b.name.toLowerCase();
                        break;
                    case 'dateAdded':
                        valueA = new Date(a.dateAdded);
                        valueB = new Date(b.dateAdded);
                        break;
                    case 'lastUsed':
                        valueA = a.lastUsed ? new Date(a.lastUsed) : new Date(0);
                        valueB = b.lastUsed ? new Date(b.lastUsed) : new Date(0);
                        break;
                    case 'timesCompleted':
                        valueA = a.timesCompleted || 0;
                        valueB = b.timesCompleted || 0;
                        break;
                    case 'duration':
                        valueA = this.calculateWorkoutDuration(a.data);
                        valueB = this.calculateWorkoutDuration(b.data);
                        break;
                    default:
                        return 0;
                }

                if (valueA < valueB) return options.sortOrder === 'desc' ? 1 : -1;
                if (valueA > valueB) return options.sortOrder === 'desc' ? -1 : 1;
                return 0;
            });
        }

        return workouts;
    }

    /**
     * Get workout statistics summary
     * @returns {Object} Statistics about the workout library
     */
    getLibraryStats() {
        const totalWorkouts = this.workouts.length;
        const totalTags = this.getAllTags().length;
        
        let totalDuration = 0;
        let totalCompletions = 0;
        let oldestWorkout = null;
        let newestWorkout = null;

        this.workouts.forEach(workout => {
            totalDuration += this.calculateWorkoutDuration(workout.data);
            totalCompletions += workout.timesCompleted || 0;
            
            const addedDate = new Date(workout.dateAdded);
            if (!oldestWorkout || addedDate < new Date(oldestWorkout.dateAdded)) {
                oldestWorkout = workout;
            }
            if (!newestWorkout || addedDate > new Date(newestWorkout.dateAdded)) {
                newestWorkout = workout;
            }
        });

        return {
            totalWorkouts,
            totalTags,
            totalDuration,
            totalCompletions,
            averageDuration: totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0,
            oldestWorkout,
            newestWorkout
        };
    }
}