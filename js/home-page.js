import { WorkoutLibrary } from './workout-library.js';
import { TrainingPlanManager } from './training-plan-manager.js';
import { NavigationManager } from './navigation-manager.js';
import { StatisticsManager } from './statistics-manager.js';
import { UIUtils } from './ui-utils.js';

/**
 * Home Page - Dashboard and app overview
 */
class HomePage {
    constructor() {
        this.workoutLibrary = new WorkoutLibrary();
        this.trainingPlanManager = new TrainingPlanManager(this.workoutLibrary);
        this.statisticsManager = new StatisticsManager();
        this.navigationManager = new NavigationManager();
        
        this.initializeNavigation();
        this.loadTodaysWorkouts();
        this.loadRecentActivity();
        this.bindEvents();
    }

    /**
     * Initialize navigation with new pages
     */
    initializeNavigation() {
        // Update navigation manager to handle new pages
        const navWorkoutManagement = document.getElementById('navWorkoutManagement');
        const navTrainingPlan = document.getElementById('navTrainingPlan');
        
        if (navWorkoutManagement) {
            navWorkoutManagement.addEventListener('click', () => {
                window.location.href = 'workout-management.html';
            });
        }
        
        if (navTrainingPlan) {
            navTrainingPlan.addEventListener('click', () => {
                window.location.href = 'training-plan.html';
            });
        }
    }

    /**
     * Load and display today's scheduled workouts
     */
    loadTodaysWorkouts() {
        const today = new Date();
        const todayKey = this.trainingPlanManager.getDateKey(today);
        const todaysWorkouts = this.trainingPlanManager.getWorkoutsForDate(todayKey);
        
        const todayWorkoutsList = document.getElementById('todayWorkoutsList');
        
        if (todaysWorkouts && todaysWorkouts.length > 0) {
            todayWorkoutsList.innerHTML = '';
            
            todaysWorkouts.forEach(workoutId => {
                const workout = this.workoutLibrary.getWorkout(workoutId);
                if (workout) {
                    const workoutElement = this.createTodayWorkoutElement(workout);
                    todayWorkoutsList.appendChild(workoutElement);
                }
            });
        } else {
            todayWorkoutsList.innerHTML = '<p class="md-typescale-body-large no-workouts-message">No workouts scheduled for today</p>';
        }
    }

    /**
     * Create workout element for today's list
     */
    createTodayWorkoutElement(workout) {
        const element = document.createElement('div');
        element.className = 'today-workout-item md-card md-card--outlined';
        element.innerHTML = `
            <div class="md-card__content">
                <div class="workout-info">
                    <h4 class="md-typescale-title-medium">${workout.name}</h4>
                    <div class="workout-meta">
                        <span class="md-typescale-body-small">${workout.exercises?.length || 0} exercises</span>
                        ${workout.totalTime ? `<span class="md-typescale-body-small">${workout.totalTime}</span>` : ''}
                    </div>
                </div>
                <div class="workout-actions">
                    <button class="md-button md-button--filled start-workout-btn" data-workout-id="${workout.id}">
                        <span class="material-icons md-button__icon">play_arrow</span>
                        <span class="md-button__label">Start</span>
                    </button>
                </div>
            </div>
        `;
        
        // Bind start workout event
        const startBtn = element.querySelector('.start-workout-btn');
        startBtn.addEventListener('click', () => {
            this.startWorkout(workout.id);
        });
        
        return element;
    }

    /**
     * Load recent activity
     */
    loadRecentActivity() {
        try {
            const recentStats = this.statisticsManager.getRecentWorkouts(5);
            const recentActivitySection = document.getElementById('recentActivity');
            const recentActivityList = document.getElementById('recentActivityList');
            
            if (recentStats && recentStats.length > 0) {
                recentActivitySection.style.display = 'block';
                recentActivityList.innerHTML = '';
                
                recentStats.forEach(stat => {
                    const activityElement = this.createRecentActivityElement(stat);
                    recentActivityList.appendChild(activityElement);
                });
            } else {
                recentActivitySection.style.display = 'none';
            }
        } catch (error) {
            console.warn('Error loading recent activity:', error);
            const recentActivitySection = document.getElementById('recentActivity');
            if (recentActivitySection) {
                recentActivitySection.style.display = 'none';
            }
        }
    }

    /**
     * Create recent activity element
     */
    createRecentActivityElement(stat) {
        const element = document.createElement('div');
        element.className = 'recent-activity-item';
        
        const date = new Date(stat.date);
        const timeAgo = this.getTimeAgo(date);
        
        element.innerHTML = `
            <div class="activity-info">
                <span class="activity-workout md-typescale-body-medium">${stat.workoutName}</span>
                <span class="activity-time md-typescale-body-small">${timeAgo}</span>
            </div>
            <div class="activity-status">
                <span class="material-icons activity-icon">${stat.completed ? 'check_circle' : 'schedule'}</span>
            </div>
        `;
        
        return element;
    }

    /**
     * Get time ago string
     */
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    /**
     * Start workout session
     */
    startWorkout(workoutId) {
        // Store the workout ID for the training page
        sessionStorage.setItem('activeWorkoutId', workoutId);
        window.location.href = 'training.html';
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Quick start buttons
        const quickCreateWorkoutBtn = document.getElementById('quickCreateWorkoutBtn');
        const quickLoadWorkoutBtn = document.getElementById('quickLoadWorkoutBtn');
        const startTrainingBtn = document.getElementById('startTrainingBtn');
        
        if (quickCreateWorkoutBtn) {
            quickCreateWorkoutBtn.addEventListener('click', () => {
                window.location.href = 'workout-management.html';
            });
        }
        
        if (quickLoadWorkoutBtn) {
            quickLoadWorkoutBtn.addEventListener('click', () => {
                // Load a sample workout for demonstration
                this.loadSampleWorkout();
            });
        }
        
        if (startTrainingBtn) {
            startTrainingBtn.addEventListener('click', () => {
                // Check if user has any workouts
                const workouts = this.workoutLibrary.getAllWorkouts();
                if (workouts.length === 0) {
                    UIUtils.showMessage('Create a workout first to start training', 'info');
                    return;
                }
                
                // If user has workouts, go to workout management to select one
                window.location.href = 'workout-management.html';
            });
        }
    }

    /**
     * Load a sample workout for demonstration
     */
    loadSampleWorkout() {
        const sampleMarkdown = `# Sample Push Day Workout

## Warm-up - 5:00
Light cardio and dynamic stretching to prepare your body.
Start with arm circles, shoulder rolls, and light jumping jacks.

## Push-ups - 0:45
Classic bodyweight exercise targeting chest, shoulders, and triceps.
Keep your body in a straight line from head to heels.
Lower your chest to just above the ground, then push back up.

Rest - 0:15

## Bench Press - 1:00
Compound movement for chest, shoulders, and triceps development.
Lie flat on the bench with feet firmly planted on the ground.

Rest - 0:30

## Shoulder Press - 0:45
Standing or seated shoulder press for deltoid development.
Keep your core engaged and press weights directly overhead.

Rest - 0:15`;

        try {
            // Create a sample workout
            const workoutData = {
                title: 'Sample Push Day Workout',
                exercises: [] // Will be parsed by WorkoutParser
            };
            
            const workout = this.workoutLibrary.addWorkout('sample-push-day.md', sampleMarkdown, workoutData);
            UIUtils.showMessage('Sample workout loaded successfully!', 'success');
            
            // Refresh today's workouts in case user wants to schedule it
            this.loadTodaysWorkouts();
            
        } catch (error) {
            console.error('Error loading sample workout:', error);
            UIUtils.showMessage('Failed to load sample workout', 'error');
        }
    }
}

// Initialize the home page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.homePage = new HomePage();
});