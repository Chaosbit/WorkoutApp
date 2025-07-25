import { WorkoutApp } from './workout-app.js';
import { WorkoutParser } from './workout-parser.js';
import { WorkoutLibrary } from './workout-library.js';
import { AudioManager } from './audio-manager.js';
import { TimerManager } from './timer-manager.js';
import { StatisticsManager } from './statistics-manager.js';
import { ScreenWakeManager } from './screen-wake-manager.js';
import { NavigationManager } from './navigation-manager.js';

/**
 * Application initialization
 * Initialize the WorkoutApp when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the main application
    window.workoutApp = new WorkoutApp();
    window.app = window.workoutApp; // Make app globally accessible for onclick handlers
    
    // Initialize navigation
    window.navigationManager = new NavigationManager();
    
    // Expose classes globally for backward compatibility with tests
    window.WorkoutApp = WorkoutApp;
    window.WorkoutParser = WorkoutParser;
    window.WorkoutLibrary = WorkoutLibrary;
    window.AudioManager = AudioManager;
    window.TimerManager = TimerManager;
    window.StatisticsManager = StatisticsManager;
    window.ScreenWakeManager = ScreenWakeManager;
    window.NavigationManager = NavigationManager;
    
    // For backward compatibility, create a WorkoutTimer class that delegates to WorkoutApp
    window.WorkoutTimer = class WorkoutTimer {
        constructor() {
            // Return the existing workout app instance
            return window.workoutApp;
        }
    };
});