import { StatisticsManager } from './statistics-manager.js';

/**
 * Statistics Page Controller
 * Manages the statistics page UI and navigation
 */
class StatisticsPage {
    constructor() {
        this.statisticsManager = new StatisticsManager();
        
        // Initialize DOM elements
        this.initializeElements();
        this.bindEvents();
        this.initializeNavigation();
        this.updateStatisticsDisplay();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        // Statistics elements
        this.totalWorkoutsEl = document.getElementById('totalWorkouts');
        this.completedWorkoutsEl = document.getElementById('completedWorkouts');
        this.totalTimeEl = document.getElementById('totalTime');
        this.streakDaysEl = document.getElementById('streakDays');
        this.journalList = document.getElementById('journalList');
        
        // Navigation elements
        this.menuButton = document.getElementById('menuButton');
        this.navigationDrawer = document.getElementById('navigationDrawer');
        this.navigationScrim = document.getElementById('navigationScrim');
        this.navHome = document.getElementById('navHome');
        this.navStatistics = document.getElementById('navStatistics');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation events
        this.menuButton.addEventListener('click', () => this.toggleNavigation());
        this.navigationScrim.addEventListener('click', () => this.closeNavigation());
        this.navHome.addEventListener('click', () => this.navigateToHome());
        this.navStatistics.addEventListener('click', () => this.closeNavigation());
        
        // Close navigation on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isNavigationOpen()) {
                this.closeNavigation();
            }
        });
    }

    /**
     * Initialize navigation state
     */
    initializeNavigation() {
        // Set current page as active
        this.navStatistics.classList.add('active');
        this.navHome.classList.remove('active');
    }

    /**
     * Toggle navigation drawer
     */
    toggleNavigation() {
        if (this.isNavigationOpen()) {
            this.closeNavigation();
        } else {
            this.openNavigation();
        }
    }

    /**
     * Open navigation drawer
     */
    openNavigation() {
        this.navigationDrawer.classList.add('open');
        this.navigationScrim.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close navigation drawer
     */
    closeNavigation() {
        this.navigationDrawer.classList.remove('open');
        this.navigationScrim.classList.remove('visible');
        document.body.style.overflow = '';
    }

    /**
     * Check if navigation is open
     */
    isNavigationOpen() {
        return this.navigationDrawer.classList.contains('open');
    }

    /**
     * Navigate to home page
     */
    navigateToHome() {
        window.location.href = 'index.html';
    }

    /**
     * Update the statistics display
     */
    updateStatisticsDisplay() {
        const stats = this.statisticsManager.getStats();
        const recentSessions = this.statisticsManager.getRecentSessions(10);
        
        // Update stats overview
        this.totalWorkoutsEl.textContent = stats.totalWorkouts;
        this.completedWorkoutsEl.textContent = stats.completedWorkouts;
        this.totalTimeEl.textContent = this.statisticsManager.getFormattedTotalTime();
        this.streakDaysEl.textContent = stats.streakDays;
        
        // Update journal list
        this.updateJournalDisplay(recentSessions);
    }

    /**
     * Update the workout journal display
     * @param {Array} sessions - Array of recent workout sessions
     */
    updateJournalDisplay(sessions) {
        if (sessions.length === 0) {
            this.journalList.innerHTML = '<p class="no-data">No workout sessions yet. Start your first workout to see your progress!</p>';
            return;
        }

        this.journalList.innerHTML = '';
        
        sessions.forEach(session => {
            const journalItem = document.createElement('div');
            journalItem.className = `journal-item ${session.status}`;
            
            const sessionDate = new Date(session.startTime);
            const dateStr = sessionDate.toLocaleDateString();
            const timeStr = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const completedExercises = session.exercises.filter(e => e.completed).length;
            const totalExercises = session.exercises.length;
            
            journalItem.innerHTML = `
                <div class="journal-main">
                    <div class="journal-workout-name">${session.workoutName}</div>
                    <div class="journal-details">
                        <span>📅 ${dateStr}</span>
                        <span>🕐 ${timeStr}</span>
                        <span>⏱️ ${this.statisticsManager.getSessionDuration(session)}</span>
                        <span>✅ ${completedExercises}/${totalExercises} exercises</span>
                    </div>
                </div>
                <div class="journal-status ${session.status}">
                    ${session.status === 'completed' ? '✓ Completed' : '✗ Abandoned'}
                </div>
            `;
            
            this.journalList.appendChild(journalItem);
        });
    }
}

/**
 * Initialize the statistics page when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    new StatisticsPage();
});