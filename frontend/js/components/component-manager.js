/**
 * Component Manager
 * Handles integration between web components and application functionality
 */
export class ComponentManager {
    constructor() {
        this.navigationMenu = null;
        this.pageHeader = null;
        this.initialize();
    }

    initialize() {
        // Wait for components to be defined and DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupComponents());
        } else {
            this.setupComponents();
        }
    }

    setupComponents() {
        // Get component references
        this.navigationMenu = document.querySelector('navigation-menu');
        this.pageHeader = document.querySelector('page-header');

        this.bindEvents();
        this.setupKeyboardNavigation();
    }

    bindEvents() {
        // Handle menu toggle from page header
        if (this.pageHeader) {
            this.pageHeader.addEventListener('menu-toggle', () => {
                if (this.navigationMenu) {
                    this.navigationMenu.toggleDrawer();
                }
            });

            this.pageHeader.addEventListener('back-clicked', () => {
                this.handleBackNavigation();
            });
        }

        // Handle sync and settings requests from navigation menu
        if (this.navigationMenu) {
            this.navigationMenu.addEventListener('sync-requested', () => {
                this.handleSyncRequest();
            });

            this.navigationMenu.addEventListener('settings-requested', () => {
                this.handleSettingsRequest();
            });
        }
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.navigationMenu) {
                this.navigationMenu.closeDrawer();
            }
        });
    }

    handleBackNavigation() {
        // Default back navigation - go to previous page or home
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = 'index.html';
        }
    }

    handleSyncRequest() {
        // Show sync dialog if it exists on the page
        const syncDialog = document.getElementById('syncDialog');
        if (syncDialog) {
            syncDialog.style.display = 'block';
        }
        
        // Close navigation menu
        if (this.navigationMenu) {
            this.navigationMenu.closeDrawer();
        }
    }

    handleSettingsRequest() {
        // Handle settings - could show a settings dialog or navigate to settings page
        console.log('Settings requested - implement settings functionality');
        
        // Close navigation menu
        if (this.navigationMenu) {
            this.navigationMenu.closeDrawer();
        }
    }

    // Utility method to close navigation from external code
    closeNavigation() {
        if (this.navigationMenu) {
            this.navigationMenu.closeDrawer();
        }
    }

    // Utility method to open navigation from external code
    openNavigation() {
        if (this.navigationMenu) {
            this.navigationMenu.openDrawer();
        }
    }

    // Check if navigation is open
    isNavigationOpen() {
        if (this.navigationMenu) {
            const drawer = this.navigationMenu.querySelector('#navigationDrawer');
            return drawer && drawer.classList.contains('open');
        }
        return false;
    }
}