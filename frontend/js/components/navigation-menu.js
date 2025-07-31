class NavigationMenu extends HTMLElement {
    constructor() {
        super();
        this.activeItem = null;
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
        this.updateActiveState();
    }

    render() {
        this.innerHTML = `
            <!-- Navigation Scrim -->
            <div class="md-scrim" id="navigationScrim"></div>
            
            <!-- Navigation Drawer using Material Web Menu -->
            <nav class="md-navigation-drawer" id="navigationDrawer">
                <div class="md-navigation-drawer__header">
                    <h2 class="md-navigation-drawer__title">
                        <md-icon>fitness_center</md-icon>
                        Workout Timer
                    </h2>
                </div>
                
                <md-menu id="navigationMenu" class="navigation-menu" stay-open-on-outside-click stay-open-on-focusout>
                    <md-menu-item id="navHome" data-page="index.html">
                        <md-icon slot="start">home</md-icon>
                        <div slot="headline">Home</div>
                    </md-menu-item>
                    
                    <md-menu-item id="navWorkoutManagement" data-page="workout-management.html">
                        <md-icon slot="start">edit</md-icon>
                        <div slot="headline">Workout Management</div>
                    </md-menu-item>
                    
                    <md-menu-item id="navTrainingPlan" data-page="training-plan.html">
                        <md-icon slot="start">calendar_month</md-icon>
                        <div slot="headline">Training Plan</div>
                    </md-menu-item>
                    
                    <md-menu-item id="navTraining" data-page="training.html">
                        <md-icon slot="start">fitness_center</md-icon>
                        <div slot="headline">Training</div>
                    </md-menu-item>
                    
                    <md-menu-item id="navStatistics" data-page="statistics.html">
                        <md-icon slot="start">analytics</md-icon>
                        <div slot="headline">Statistics</div>
                    </md-menu-item>
                    
                    <md-divider></md-divider>
                    
                    <md-menu-item id="navSync">
                        <md-icon slot="start">sync</md-icon>
                        <div slot="headline">Sync</div>
                    </md-menu-item>
                    
                    <md-menu-item id="navSettings">
                        <md-icon slot="start">settings</md-icon>
                        <div slot="headline">Settings</div>
                    </md-menu-item>
                </md-menu>
            </nav>
        `;
    }

    attachEventListeners() {
        // Handle navigation menu items with data-page attribute
        const navigationItems = this.querySelectorAll('md-menu-item[data-page]');
        navigationItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const page = item.getAttribute('data-page');
                if (page) {
                    window.location.href = page;
                }
            });
        });

        // Handle sync and settings separately
        const syncButton = this.querySelector('#navSync');
        if (syncButton) {
            syncButton.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('sync-requested', { bubbles: true }));
                this.closeDrawer();
            });
        }

        const settingsButton = this.querySelector('#navSettings');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('settings-requested', { bubbles: true }));
                this.closeDrawer();
            });
        }

        // Handle scrim clicks to close drawer
        const scrim = this.querySelector('#navigationScrim');
        if (scrim) {
            scrim.addEventListener('click', () => {
                this.closeDrawer();
            });
        }

        // Handle menu behavior
        const menu = this.querySelector('#navigationMenu');
        if (menu) {
            // Always keep the menu open when drawer is open
            menu.open = true;
        }
    }

    updateActiveState() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const items = this.querySelectorAll('md-menu-item[data-page]');
        
        items.forEach(item => {
            // Remove active class/attribute
            item.removeAttribute('selected');
            const itemPage = item.getAttribute('data-page');
            if (itemPage === currentPage || (currentPage === '' && itemPage === 'index.html')) {
                // Add selected attribute for Material Web menu items
                item.setAttribute('selected', '');
                this.activeItem = item;
            }
        });
    }

    openDrawer() {
        const drawer = this.querySelector('#navigationDrawer');
        const scrim = this.querySelector('#navigationScrim');
        const menu = this.querySelector('#navigationMenu');
        
        if (drawer && scrim) {
            drawer.classList.add('open');
            scrim.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }
        
        // Ensure menu is open when drawer opens
        if (menu) {
            menu.open = true;
        }
    }

    closeDrawer() {
        const drawer = this.querySelector('#navigationDrawer');
        const scrim = this.querySelector('#navigationScrim');
        const menu = this.querySelector('#navigationMenu');
        
        if (drawer && scrim) {
            drawer.classList.remove('open');
            scrim.classList.remove('visible');
            document.body.style.overflow = '';
        }
        
        // Keep menu open even when drawer closes (for next time)
        if (menu) {
            menu.open = false;
        }
    }

    toggleDrawer() {
        const drawer = this.querySelector('#navigationDrawer');
        if (drawer) {
            if (drawer.classList.contains('open')) {
                this.closeDrawer();
            } else {
                this.openDrawer();
            }
        }
    }
}

customElements.define('navigation-menu', NavigationMenu);