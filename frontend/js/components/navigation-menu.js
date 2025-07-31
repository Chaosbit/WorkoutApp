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
            
            <!-- Navigation Drawer -->
            <nav class="md-navigation-drawer" id="navigationDrawer">
                <div class="md-navigation-drawer__header">
                    <h2 class="md-navigation-drawer__title">
                        <span class="material-icons">fitness_center</span>
                        Workout Timer
                    </h2>
                </div>
                <ul class="md-navigation-drawer__list">
                    <li>
                        <button class="md-navigation-drawer__item" id="navHome" data-page="index.html">
                            <span class="material-icons md-navigation-drawer__item-icon">home</span>
                            <span class="md-navigation-drawer__item-text">Home</span>
                        </button>
                    </li>
                    <li>
                        <button class="md-navigation-drawer__item" id="navWorkoutManagement" data-page="workout-management.html">
                            <span class="material-icons md-navigation-drawer__item-icon">edit</span>
                            <span class="md-navigation-drawer__item-text">Workout Management</span>
                        </button>
                    </li>
                    <li>
                        <button class="md-navigation-drawer__item" id="navTrainingPlan" data-page="training-plan.html">
                            <span class="material-icons md-navigation-drawer__item-icon">calendar_month</span>
                            <span class="md-navigation-drawer__item-text">Training Plan</span>
                        </button>
                    </li>
                    <li>
                        <button class="md-navigation-drawer__item" id="navTraining" data-page="training.html">
                            <span class="material-icons md-navigation-drawer__item-icon">fitness_center</span>
                            <span class="md-navigation-drawer__item-text">Training</span>
                        </button>
                    </li>
                    <li>
                        <button class="md-navigation-drawer__item" id="navStatistics" data-page="statistics.html">
                            <span class="material-icons md-navigation-drawer__item-icon">analytics</span>
                            <span class="md-navigation-drawer__item-text">Statistics</span>
                        </button>
                    </li>
                    <li>
                        <button class="md-navigation-drawer__item" id="navSync">
                            <span class="material-icons md-navigation-drawer__item-icon">sync</span>
                            <span class="md-navigation-drawer__item-text">Sync</span>
                        </button>
                    </li>
                    <li>
                        <button class="md-navigation-drawer__item" id="navSettings">
                            <span class="material-icons md-navigation-drawer__item-icon">settings</span>
                            <span class="md-navigation-drawer__item-text">Settings</span>
                        </button>
                    </li>
                </ul>
            </nav>
        `;
    }

    attachEventListeners() {
        const navigationItems = this.querySelectorAll('.md-navigation-drawer__item[data-page]');
        navigationItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const page = item.getAttribute('data-page');
                if (page) {
                    window.location.href = page;
                }
            });
        });

        const syncButton = this.querySelector('#navSync');
        if (syncButton) {
            syncButton.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('sync-requested', { bubbles: true }));
            });
        }

        const settingsButton = this.querySelector('#navSettings');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('settings-requested', { bubbles: true }));
            });
        }

        const scrim = this.querySelector('#navigationScrim');
        if (scrim) {
            scrim.addEventListener('click', () => {
                this.closeDrawer();
            });
        }
    }

    updateActiveState() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const items = this.querySelectorAll('.md-navigation-drawer__item');
        
        items.forEach(item => {
            item.classList.remove('active');
            const itemPage = item.getAttribute('data-page');
            if (itemPage === currentPage || (currentPage === '' && itemPage === 'index.html')) {
                item.classList.add('active');
                this.activeItem = item;
            }
        });
    }

    openDrawer() {
        const drawer = this.querySelector('#navigationDrawer');
        const scrim = this.querySelector('#navigationScrim');
        if (drawer && scrim) {
            drawer.classList.add('open');
            scrim.classList.add('visible');
        }
    }

    closeDrawer() {
        const drawer = this.querySelector('#navigationDrawer');
        const scrim = this.querySelector('#navigationScrim');
        if (drawer && scrim) {
            drawer.classList.remove('open');
            scrim.classList.remove('visible');
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