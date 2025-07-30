import { WorkoutApp } from './workout-app.js';
import { WorkoutLibrary } from './workout-library.js';
import { NavigationManager } from './navigation-manager.js';
import { UIUtils } from './ui-utils.js';

// Import web components
import './components/workout-manager.js';

/**
 * Workout Management Page - Create, edit, and organize workouts
 */
class WorkoutManagementPage {
    constructor() {
        this.workoutLibrary = new WorkoutLibrary();
        this.navigationManager = new NavigationManager();
        
        this.initializeNavigation();
        this.initializeWorkoutManager();
        this.bindEvents();
    }

    /**
     * Initialize navigation with new pages
     */
    initializeNavigation() {
        const navHome = document.getElementById('navHome');
        const navTrainingPlan = document.getElementById('navTrainingPlan');
        const navStatistics = document.getElementById('navStatistics');
        
        if (navHome) {
            navHome.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
        
        if (navTrainingPlan) {
            navTrainingPlan.addEventListener('click', () => {
                window.location.href = 'training-plan.html';
            });
        }
        
        if (navStatistics) {
            navStatistics.addEventListener('click', () => {
                window.location.href = 'statistics.html';
            });
        }
    }

    /**
     * Initialize the workout manager component
     */
    initializeWorkoutManager() {
        const workoutManager = document.getElementById('workoutManager');
        if (workoutManager && workoutManager.setLibrary) {
            workoutManager.setLibrary(this.workoutLibrary);
        }
    }

    /**
     * Bind event listeners 
     */
    bindEvents() {
        // File input for importing workouts
        const workoutFileInput = document.getElementById('workoutFile');
        if (workoutFileInput) {
            workoutFileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // New workout button
        const newWorkoutBtn = document.getElementById('newWorkoutBtn');
        if (newWorkoutBtn) {
            newWorkoutBtn.addEventListener('click', () => this.createNewWorkout());
        }

        // Editor buttons
        const saveWorkoutBtn = document.getElementById('saveWorkoutBtn');
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        
        if (saveWorkoutBtn) {
            saveWorkoutBtn.addEventListener('click', () => this.saveWorkout());
        }
        
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => this.cancelEdit());
        }

        // Listen for workout selection from workout manager component
        document.addEventListener('workout-selected', (e) => {
            this.handleWorkoutSelected(e.detail);
        });

        // Listen for start training requests
        document.addEventListener('start-training', (e) => {
            this.startTraining(e.detail.workoutId);
        });
    }

    /**
     * Handle file upload
     */
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                this.loadWorkoutFromContent(file.name, content);
            } catch (error) {
                console.error('Error reading file:', error);
                UIUtils.showMessage('Error reading workout file', 'error');
            }
        };
        reader.readAsText(file);
    }

    /**
     * Load workout from content
     */
    loadWorkoutFromContent(filename, content) {
        try {
            // Parse the workout content (this would use WorkoutParser)
            const workoutData = {
                title: filename.replace('.md', ''),
                exercises: [] // Would be populated by WorkoutParser
            };
            
            const workout = this.workoutLibrary.addWorkout(filename, content, workoutData);
            UIUtils.showMessage(`Workout "${workout.name}" imported successfully!`, 'success');
            
            // Refresh the workout manager
            this.initializeWorkoutManager();
            
        } catch (error) {
            console.error('Error importing workout:', error);
            UIUtils.showMessage('Failed to import workout', 'error');
        }
    }

    /**
     * Create new workout
     */
    createNewWorkout() {
        this.showWorkoutEditor();
        this.clearEditor();
        
        // Set focus to workout name input
        const workoutNameInput = document.getElementById('workoutNameInput');
        if (workoutNameInput) {
            workoutNameInput.focus();
        }
    }

    /**
     * Show workout editor
     */
    showWorkoutEditor() {
        const editor = document.getElementById('workoutEditor');
        if (editor) {
            editor.style.display = 'block';
            editor.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Hide workout editor
     */
    hideWorkoutEditor() {
        const editor = document.getElementById('workoutEditor');
        if (editor) {
            editor.style.display = 'none';
        }
    }

    /**
     * Clear editor fields
     */
    clearEditor() {
        const workoutNameInput = document.getElementById('workoutNameInput');
        const workoutMarkdownEditor = document.getElementById('workoutMarkdownEditor');
        const workoutTagsEditor = document.getElementById('workoutTagsEditor');
        
        if (workoutNameInput) workoutNameInput.value = '';
        if (workoutMarkdownEditor) workoutMarkdownEditor.value = '';
        if (workoutTagsEditor) workoutTagsEditor.innerHTML = '';
        
        this.currentEditingWorkout = null;
    }

    /**
     * Handle workout selection from workout manager
     */
    handleWorkoutSelected(workout) {
        if (workout) {
            this.editWorkout(workout);
        }
    }

    /**
     * Edit existing workout
     */
    editWorkout(workout) {
        this.currentEditingWorkout = workout;
        this.showWorkoutEditor();
        
        // Populate editor fields
        const workoutNameInput = document.getElementById('workoutNameInput');
        const workoutMarkdownEditor = document.getElementById('workoutMarkdownEditor');
        
        if (workoutNameInput) workoutNameInput.value = workout.name || '';
        if (workoutMarkdownEditor) workoutMarkdownEditor.value = workout.content || '';
        
        // TODO: Populate tags if available
    }

    /**
     * Save workout
     */
    saveWorkout() {
        const workoutNameInput = document.getElementById('workoutNameInput');
        const workoutMarkdownEditor = document.getElementById('workoutMarkdownEditor');
        
        const name = workoutNameInput?.value?.trim();
        const content = workoutMarkdownEditor?.value?.trim();
        
        // Validate input
        if (!name) {
            UIUtils.showMessage('Please enter a workout name', 'error');
            return;
        }
        
        if (!content) {
            UIUtils.showMessage('Please enter workout content', 'error');
            return;
        }
        
        try {
            if (this.currentEditingWorkout) {
                // Update existing workout
                this.workoutLibrary.updateWorkout(this.currentEditingWorkout.id, {
                    name,
                    content
                });
                UIUtils.showMessage(`Workout "${name}" updated successfully!`, 'success');
            } else {
                // Create new workout
                const workoutData = {
                    title: name,
                    exercises: [] // Would be populated by WorkoutParser
                };
                
                this.workoutLibrary.addWorkout(`${name}.md`, content, workoutData);
                UIUtils.showMessage(`Workout "${name}" created successfully!`, 'success');
            }
            
            this.hideWorkoutEditor();
            this.initializeWorkoutManager();
            
        } catch (error) {
            console.error('Error saving workout:', error);
            UIUtils.showMessage('Failed to save workout', 'error');
        }
    }

    /**
     * Cancel editing
     */
    cancelEdit() {
        this.hideWorkoutEditor();
    }

    /**
     * Start training with selected workout
     */
    startTraining(workoutId) {
        sessionStorage.setItem('activeWorkoutId', workoutId);
        window.location.href = 'training.html';
    }
}

// Initialize the workout management page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.workoutManagementPage = new WorkoutManagementPage();
});