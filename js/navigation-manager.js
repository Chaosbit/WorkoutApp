/**
 * Navigation Manager
 * Handles navigation drawer behavior and page navigation
 */
export class NavigationManager {
    constructor() {
        this.initializeElements();
        this.bindEvents();
    }

    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.menuButton = document.getElementById('menuButton');
        this.navigationDrawer = document.getElementById('navigationDrawer');
        this.navigationScrim = document.getElementById('navigationScrim');
        this.navHome = document.getElementById('navHome');
        this.navWorkoutManagement = document.getElementById('navWorkoutManagement');
        this.navTrainingPlan = document.getElementById('navTrainingPlan');
        this.navTraining = document.getElementById('navTraining');
        this.navStatistics = document.getElementById('navStatistics');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        if (!this.menuButton) return; // Navigation not available on this page
        
        this.menuButton.addEventListener('click', () => this.toggleNavigation());
        this.navigationScrim.addEventListener('click', () => this.closeNavigation());
        
        if (this.navHome) {
            this.navHome.addEventListener('click', () => this.navigateToHome());
        }
        
        if (this.navWorkoutManagement) {
            this.navWorkoutManagement.addEventListener('click', () => this.navigateToWorkoutManagement());
        }
        
        if (this.navTrainingPlan) {
            this.navTrainingPlan.addEventListener('click', () => this.navigateToTrainingPlan());
        }
        
        if (this.navTraining) {
            this.navTraining.addEventListener('click', () => this.navigateToTraining());
        }
        
        if (this.navStatistics) {
            this.navStatistics.addEventListener('click', () => this.navigateToStatistics());
        }
        
        // Close navigation on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isNavigationOpen()) {
                this.closeNavigation();
            }
        });
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
        const currentPath = window.location.pathname;
        if (currentPath.includes('index.html') || currentPath === '/') {
            this.closeNavigation();
        } else {
            window.location.href = 'index.html';
        }
    }

    /**
     * Navigate to workout management page
     */
    navigateToWorkoutManagement() {
        const currentPath = window.location.pathname;
        if (currentPath.includes('workout-management.html')) {
            this.closeNavigation();
        } else {
            window.location.href = 'workout-management.html';
        }
    }

    /**
     * Navigate to training plan page
     */
    navigateToTrainingPlan() {
        const currentPath = window.location.pathname;
        if (currentPath.includes('training-plan.html')) {
            this.closeNavigation();
        } else {
            window.location.href = 'training-plan.html';
        }
    }

    /**
     * Navigate to training page
     */
    navigateToTraining() {
        const currentPath = window.location.pathname;
        if (currentPath.includes('training.html')) {
            this.closeNavigation();
        } else {
            window.location.href = 'training.html';
        }
    }

    /**
     * Navigate to statistics page
     */
    navigateToStatistics() {
        const currentPath = window.location.pathname;
        if (currentPath.includes('statistics.html')) {
            this.closeNavigation();
        } else {
            window.location.href = 'statistics.html';
        }
    }
}