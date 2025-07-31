class PageHeader extends HTMLElement {
    constructor() {
        super();
    }

    static get observedAttributes() {
        return ['title', 'icon', 'home-link', 'show-back'];
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.isConnected) {
            this.render();
        }
    }

    render() {
        const title = this.getAttribute('title') || 'Workout Timer';
        const icon = this.getAttribute('icon') || 'fitness_center';
        const homeLink = this.getAttribute('home-link') || 'index.html';
        const showBack = this.hasAttribute('show-back');

        const leftButton = showBack 
            ? `<button class="md-icon-button--back" id="backButton">
                <span class="material-icons">arrow_back</span>
               </button>`
            : `<button class="md-icon-button--menu" id="menuButton">
                <span class="material-icons">menu</span>
               </button>`;

        this.innerHTML = `
            <header class="md-top-app-bar">
                <div class="md-top-app-bar__content">
                    ${leftButton}
                    <a href="${homeLink}" class="md-top-app-bar__title-link">
                        <span class="material-icons md-top-app-bar__leading-icon">${icon}</span>
                        <span class="md-top-app-bar__title">${title}</span>
                    </a>
                </div>
            </header>
        `;
    }

    attachEventListeners() {
        const menuButton = this.querySelector('#menuButton');
        if (menuButton) {
            menuButton.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('menu-toggle', { bubbles: true }));
            });
        }

        const backButton = this.querySelector('#backButton');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('back-clicked', { bubbles: true }));
            });
        }
    }

    setTitle(title) {
        this.setAttribute('title', title);
    }

    setIcon(icon) {
        this.setAttribute('icon', icon);
    }

    setHomeLink(link) {
        this.setAttribute('home-link', link);
    }
}

customElements.define('page-header', PageHeader);