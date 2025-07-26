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
        this.navAIChat = document.getElementById('navAIChat');
        this.navStatistics = document.getElementById('navStatistics');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        if (!this.menuButton) return; // Navigation not available on this page
        
        this.menuButton.addEventListener('click', () => this.toggleNavigation());
        this.navigationScrim.addEventListener('click', () => this.closeNavigation());
        this.navHome.addEventListener('click', () => this.navigateToHome());
        if (this.navAIChat) {
            this.navAIChat.addEventListener('click', () => this.navigateToAIChat());
        }
        this.navStatistics.addEventListener('click', () => this.navigateToStatistics());
        
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
        if (window.location.pathname.includes('statistics.html')) {
            window.location.href = 'index.html';
        } else {
            this.closeNavigation();
        }
    }

    /**
     * Navigate to statistics page
     */
    navigateToStatistics() {
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            window.location.href = 'statistics.html';
        } else {
            this.closeNavigation();
        }
    }

    /**
     * Navigate to AI Chat (trigger tab switch on home page)
     */
    navigateToAIChat() {
        if (window.location.pathname.includes('statistics.html')) {
            window.location.href = 'index.html#ai-chat';
        } else {
            // Trigger AI Chat tab on home page
            const aiChatTab = document.getElementById('aiChatTab');
            if (aiChatTab) {
                aiChatTab.click();
            }
            this.closeNavigation();
        }
    }
}