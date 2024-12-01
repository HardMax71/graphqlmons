class Navigation {
    constructor() {
        this.navItems = document.querySelectorAll('.navbar-item[data-view]');
        this.views = document.querySelectorAll('.view-content');
        this.initEvents();
        this.handleInitialRoute();
    }

    initEvents() {
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigate(item.dataset.view);
            });
        });

        window.addEventListener('popstate', () => this.handleInitialRoute());
    }

    handleInitialRoute() {
        const view = window.location.hash.slice(1) || 'pokemon';
        this.navigate(view, false);
    }

    navigate(viewId, updateHistory = true) {
        this.navItems.forEach(item => {
            item.classList.toggle('is-active', item.dataset.view === viewId);
        });

        this.views.forEach(view => {
            view.classList.toggle('is-active', view.id === viewId);
        });

        if (updateHistory) {
            window.history.pushState(null, '', `#${viewId}`);
        }
    }
}