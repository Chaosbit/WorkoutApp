import { WorkoutLibrary } from './workout-library.js';
import { TrainingPlanManager } from './training-plan-manager.js';
import { NavigationManager } from './navigation-manager.js';
import { UIUtils } from './ui-utils.js';

/**
 * Training Plan Page - Schedule and organize workouts
 */
class TrainingPlanPage {
    constructor() {
        this.workoutLibrary = new WorkoutLibrary();
        this.trainingPlanManager = new TrainingPlanManager(this.workoutLibrary);
        this.navigationManager = new NavigationManager();
        
        this.initializeNavigation();
        this.initializeCalendar();
        this.bindEvents();
    }

    /**
     * Initialize navigation with new pages
     */
    initializeNavigation() {
        const navHome = document.getElementById('navHome');
        const navWorkoutManagement = document.getElementById('navWorkoutManagement');
        const navStatistics = document.getElementById('navStatistics');
        
        if (navHome) {
            navHome.addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }
        
        if (navWorkoutManagement) {
            navWorkoutManagement.addEventListener('click', () => {
                window.location.href = 'workout-management.html';
            });
        }
        
        if (navStatistics) {
            navStatistics.addEventListener('click', () => {
                window.location.href = 'statistics.html';
            });
        }
    }

    /**
     * Initialize calendar display
     */
    initializeCalendar() {
        this.generateCalendar();
        this.populateWorkoutSelect();
    }

    /**
     * Generate calendar for current month
     */
    generateCalendar() {
        const calendarDays = document.getElementById('calendarDays');
        const currentMonthYear = document.getElementById('currentMonthYear');
        
        if (!calendarDays || !currentMonthYear) return;
        
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        // Update month/year display
        currentMonthYear.textContent = `${monthNames[this.trainingPlanManager.currentMonth]} ${this.trainingPlanManager.currentYear}`;
        
        // Clear previous calendar
        calendarDays.innerHTML = '';
        
        // Get first day of month and number of days
        const firstDay = new Date(this.trainingPlanManager.currentYear, this.trainingPlanManager.currentMonth, 1);
        const lastDay = new Date(this.trainingPlanManager.currentYear, this.trainingPlanManager.currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startingDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarDays.appendChild(emptyDay);
        }
        
        // Add days of the month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = this.createCalendarDay(day, today);
            calendarDays.appendChild(dayElement);
        }
    }

    /**
     * Create a calendar day element
     */
    createCalendarDay(day, today) {
        const dayElement = document.createElement('div');
        const currentDate = new Date(this.trainingPlanManager.currentYear, this.trainingPlanManager.currentMonth, day);
        const dateKey = this.trainingPlanManager.getDateKey(currentDate);
        
        dayElement.className = 'calendar-day';
        
        // Check if this is today
        if (currentDate.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Check for assigned workouts
        const assignedWorkouts = this.trainingPlanManager.getWorkoutsForDate(dateKey);
        const hasWorkouts = assignedWorkouts && assignedWorkouts.length > 0;
        
        dayElement.innerHTML = `
            <div class="day-number">${day}</div>
            ${hasWorkouts ? `<div class="workout-indicator">${assignedWorkouts.length}</div>` : ''}
        `;
        
        if (hasWorkouts) {
            dayElement.classList.add('has-workouts');
        }
        
        // Add click handler
        dayElement.addEventListener('click', () => {
            this.selectDate(currentDate);
        });
        
        return dayElement;
    }

    /**
     * Select a date for workout assignment
     */
    selectDate(date) {
        this.selectedDate = date;
        const dateKey = this.trainingPlanManager.getDateKey(date);
        
        // Update modal
        const selectedDateText = document.getElementById('selectedDateText');
        const modal = document.getElementById('workoutAssignmentModal');
        const assignedWorkoutsList = document.getElementById('assignedWorkoutsList');
        
        if (selectedDateText) {
            selectedDateText.textContent = `Selected: ${date.toLocaleDateString()}`;
        }
        
        // Show assigned workouts
        this.displayAssignedWorkouts(dateKey);
        
        // Show modal
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    /**
     * Display assigned workouts for selected date
     */
    displayAssignedWorkouts(dateKey) {
        const assignedWorkoutsList = document.getElementById('assignedWorkoutsList');
        if (!assignedWorkoutsList) return;
        
        const assignedWorkouts = this.trainingPlanManager.getWorkoutsForDate(dateKey);
        
        if (!assignedWorkouts || assignedWorkouts.length === 0) {
            assignedWorkoutsList.innerHTML = '<p class="md-typescale-body-medium">No workouts assigned</p>';
            return;
        }
        
        assignedWorkoutsList.innerHTML = '';
        assignedWorkouts.forEach(workoutId => {
            const workout = this.workoutLibrary.getWorkout(workoutId);
            if (workout) {
                const workoutElement = this.createAssignedWorkoutElement(workout, dateKey);
                assignedWorkoutsList.appendChild(workoutElement);
            }
        });
    }

    /**
     * Create assigned workout element
     */
    createAssignedWorkoutElement(workout, dateKey) {
        const element = document.createElement('div');
        element.className = 'assigned-workout-item md-card md-card--outlined';
        element.innerHTML = `
            <div class="md-card__content">
                <div class="workout-info">
                    <span class="md-typescale-body-medium">${workout.name}</span>
                </div>
                <div class="workout-actions">
                    <button class="md-button md-button--text remove-workout-btn" data-workout-id="${workout.id}">
                        <span class="material-icons md-button__icon">remove</span>
                        <span class="md-button__label">Remove</span>
                    </button>
                </div>
            </div>
        `;
        
        // Bind remove button
        const removeBtn = element.querySelector('.remove-workout-btn');
        removeBtn.addEventListener('click', () => {
            this.removeWorkoutFromDate(dateKey, workout.id);
        });
        
        return element;
    }

    /**
     * Populate workout selection dropdown
     */
    populateWorkoutSelect() {
        const workoutSelect = document.getElementById('workoutAssignmentSelect');
        if (!workoutSelect) return;
        
        // Clear existing options except first
        while (workoutSelect.children.length > 1) {
            workoutSelect.removeChild(workoutSelect.lastChild);
        }
        
        // Add workouts
        const workouts = this.workoutLibrary.getAllWorkouts();
        workouts.forEach(workout => {
            const option = document.createElement('option');
            option.value = workout.id;
            option.textContent = workout.name;
            workoutSelect.appendChild(option);
        });
        
        // Update assign button state
        this.updateAssignButtonState();
    }

    /**
     * Update assign button state
     */
    updateAssignButtonState() {
        const workoutSelect = document.getElementById('workoutAssignmentSelect');
        const assignBtn = document.getElementById('assignWorkoutBtn');
        
        if (assignBtn && workoutSelect) {
            assignBtn.disabled = !workoutSelect.value;
        }
    }

    /**
     * Assign workout to selected date
     */
    assignWorkout() {
        const workoutSelect = document.getElementById('workoutAssignmentSelect');
        if (!workoutSelect || !workoutSelect.value || !this.selectedDate) return;
        
        const workoutId = workoutSelect.value;
        const dateKey = this.trainingPlanManager.getDateKey(this.selectedDate);
        
        try {
            this.trainingPlanManager.assignWorkout(this.selectedDate, workoutId);
            
            // Refresh displays
            this.generateCalendar();
            this.displayAssignedWorkouts(dateKey);
            
            // Reset selection
            workoutSelect.value = '';
            this.updateAssignButtonState();
            
            UIUtils.showMessage('Workout assigned successfully!', 'success');
            
        } catch (error) {
            console.error('Error assigning workout:', error);
            UIUtils.showMessage('Failed to assign workout', 'error');
        }
    }

    /**
     * Remove workout from date
     */
    removeWorkoutFromDate(dateKey, workoutId) {
        try {
            const date = new Date(dateKey);
            this.trainingPlanManager.removeWorkout(date, workoutId);
            
            // Refresh displays
            this.generateCalendar();
            this.displayAssignedWorkouts(dateKey);
            
            UIUtils.showMessage('Workout removed successfully!', 'success');
            
        } catch (error) {
            console.error('Error removing workout:', error);
            UIUtils.showMessage('Failed to remove workout', 'error');
        }
    }

    /**
     * Navigate to previous month
     */
    previousMonth() {
        if (this.trainingPlanManager.currentMonth === 0) {
            this.trainingPlanManager.currentMonth = 11;
            this.trainingPlanManager.currentYear--;
        } else {
            this.trainingPlanManager.currentMonth--;
        }
        this.generateCalendar();
    }

    /**
     * Navigate to next month
     */
    nextMonth() {
        if (this.trainingPlanManager.currentMonth === 11) {
            this.trainingPlanManager.currentMonth = 0;
            this.trainingPlanManager.currentYear++;
        } else {
            this.trainingPlanManager.currentMonth++;
        }
        this.generateCalendar();
    }

    /**
     * Navigate to current month
     */
    goToToday() {
        const today = new Date();
        this.trainingPlanManager.currentMonth = today.getMonth();
        this.trainingPlanManager.currentYear = today.getFullYear();
        this.generateCalendar();
    }

    /**
     * Close modal
     */
    closeModal() {
        const modal = document.getElementById('workoutAssignmentModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.selectedDate = null;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Calendar navigation
        const prevMonthBtn = document.getElementById('prevMonthBtn');
        const nextMonthBtn = document.getElementById('nextMonthBtn');
        const todayBtn = document.getElementById('todayBtn');
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => this.previousMonth());
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => this.nextMonth());
        }
        
        if (todayBtn) {
            todayBtn.addEventListener('click', () => this.goToToday());
        }
        
        // Modal controls
        const assignWorkoutBtn = document.getElementById('assignWorkoutBtn');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const workoutAssignmentSelect = document.getElementById('workoutAssignmentSelect');
        
        if (assignWorkoutBtn) {
            assignWorkoutBtn.addEventListener('click', () => this.assignWorkout());
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (workoutAssignmentSelect) {
            workoutAssignmentSelect.addEventListener('change', () => this.updateAssignButtonState());
        }
        
        // Quick actions
        const addTodayWorkoutBtn = document.getElementById('addTodayWorkoutBtn');
        const viewWeekBtn = document.getElementById('viewWeekBtn');
        const manageTemplatesBtn = document.getElementById('manageTemplatesBtn');
        
        if (addTodayWorkoutBtn) {
            addTodayWorkoutBtn.addEventListener('click', () => {
                this.selectDate(new Date());
            });
        }
        
        if (viewWeekBtn) {
            viewWeekBtn.addEventListener('click', () => {
                // TODO: Implement week view
                UIUtils.showMessage('Week view coming soon!', 'info');
            });
        }
        
        if (manageTemplatesBtn) {
            manageTemplatesBtn.addEventListener('click', () => {
                window.location.href = 'workout-management.html';
            });
        }
        
        // Close modal on backdrop click
        const modal = document.getElementById('workoutAssignmentModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }
}

// Initialize the training plan page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.trainingPlanPage = new TrainingPlanPage();
});