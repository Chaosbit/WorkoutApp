/**
 * Application Constants - Centralized configuration values
 */
export const APP_CONFIG = {
    // Timer settings
    TIMER_UPDATE_INTERVAL: 100, // milliseconds
    DEFAULT_EXERCISE_DURATION: 30, // seconds
    DEFAULT_REST_DURATION: 15, // seconds
    
    // Audio settings
    AUDIO_FREQUENCIES: {
        EXERCISE_COMPLETE: 800, // Hz
        WORKOUT_COMPLETE: [523, 659, 784], // C5, E5, G5
        REST_START: 400 // Hz
    },
    AUDIO_DURATION: 200, // milliseconds
    
    // UI settings
    MESSAGE_DURATION: 3000, // milliseconds
    DEBOUNCE_DELAY: 300, // milliseconds
    THROTTLE_LIMIT: 100, // milliseconds
    
    // Storage keys
    STORAGE_KEYS: {
        WORKOUTS: 'workoutLibrary',
        STATISTICS: 'workoutStats',
        SESSIONS: 'workoutSessions',
        TRAINING_PLAN: 'trainingPlan',
        USER_PREFERENCES: 'userPreferences'
    },
    
    // Validation rules
    VALIDATION: {
        MIN_WORKOUT_NAME_LENGTH: 3,
        MAX_WORKOUT_NAME_LENGTH: 100,
        MIN_EXERCISE_DURATION: 5, // seconds
        MAX_EXERCISE_DURATION: 3600, // 1 hour
        MAX_SETS: 50
    },
    
    // Exercise types
    EXERCISE_TYPES: {
        TIMER: 'timer',
        REPS: 'reps',
        REST: 'rest'
    },
    
    // Regex patterns for markdown parsing
    REGEX_PATTERNS: {
        TITLE: /^#\s+(.+)$/,
        EXERCISE_HEADER: /^#{2,3}\s+(.+)$/,
        TIME_FORMAT: /(\d+):(\d{2})$/,
        REPS_FORMAT: /(\d+)\s+reps?$/i,
        SETS_FORMAT: /^(.+?)\s*-\s*(\d+)\s+sets?\s*x\s*(\d+):(\d+)\s*\/\s*(\d+):(\d+)$/,
        EXERCISE_TIME: /^(.+?)\s*-\s*(\d+):(\d+)$/,
        EXERCISE_REPS: /^(.+?)\s*-\s*(\d+)\s+reps?$/i
    },
    
    // Message types
    MESSAGE_TYPES: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    },
    
    // Calendar settings
    CALENDAR: {
        MONTHS: [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ],
        DAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        MAX_DISPLAYED_WORKOUTS: 3
    },
    
    // Error messages
    ERROR_MESSAGES: {
        WORKOUT_LOAD_FAILED: 'Failed to load workout file. Please check the file format.',
        WORKOUT_PARSE_FAILED: 'Error parsing workout content. Please check your markdown format.',
        WORKOUT_SAVE_FAILED: 'Failed to save workout. Please try again.',
        WORKOUT_DELETE_FAILED: 'Failed to delete workout. Please try again.',
        AUDIO_INIT_FAILED: 'Failed to initialize audio. Sound notifications may not work.',
        WAKE_LOCK_FAILED: 'Screen wake lock not available on this device.',
        INVALID_WORKOUT_NAME: 'Please provide a valid workout name (3-100 characters).',
        INVALID_WORKOUT_CONTENT: 'Please provide valid workout content with at least one exercise.',
        NO_WORKOUT_TO_PRINT: 'No workout loaded to print.',
        NO_WORKOUT_TO_SHARE: 'No workout loaded to share.',
        SHARE_FAILED: 'Failed to share workout. Please try again.',
        POPUP_BLOCKED: 'Please allow pop-ups to use this feature.'
    },
    
    // Success messages
    SUCCESS_MESSAGES: {
        WORKOUT_LOADED: 'Workout loaded successfully!',
        WORKOUT_SAVED: 'Workout saved successfully!',
        WORKOUT_UPDATED: 'Workout updated successfully!',
        WORKOUT_CREATED: 'New workout created successfully!',
        WORKOUT_DELETED: 'Workout deleted successfully!',
        WORKOUT_COMPLETED: 'Workout completed! Great job! 💪',
        WORKOUT_SHARED: 'Workout link copied to clipboard!',
        WORKOUT_FROM_SHARE: 'Workout loaded and saved from shared link!'
    },
    
    // Performance settings
    PERFORMANCE: {
        MAX_CONCURRENT_SOUNDS: 3,
        TIMER_PRECISION: 1000, // 1 second precision for display
        DOM_UPDATE_BATCH_SIZE: 10,
        STORAGE_CLEANUP_INTERVAL: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    }
};

/**
 * Application utility functions
 */
export const APP_UTILS = {
    /**
     * Format time in MM:SS format
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    /**
     * Parse time string to seconds
     * @param {string} timeStr - Time string in MM:SS format
     * @returns {number} Time in seconds
     */
    parseTime(timeStr) {
        const match = timeStr.match(APP_CONFIG.REGEX_PATTERNS.TIME_FORMAT);
        if (!match) return 0;
        return parseInt(match[1]) * 60 + parseInt(match[2]);
    },
    
    /**
     * Generate unique ID
     * @returns {string} Unique identifier
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    /**
     * Sanitize HTML content
     * @param {string} html - HTML string to sanitize
     * @returns {string} Sanitized HTML
     */
    sanitizeHtml(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },
    
    /**
     * Check if device is mobile
     * @returns {boolean} True if mobile device
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    /**
     * Get current timestamp
     * @returns {number} Current timestamp
     */
    now() {
        return Date.now();
    },
    
    /**
     * Deep clone an object
     * @param {*} obj - Object to clone
     * @returns {*} Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }
};