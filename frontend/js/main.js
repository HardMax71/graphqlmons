class App {
    constructor() {
        this.navigation = new Navigation();
        this.constellation = new PokemonConstellation();
        this.abilities = new AbilitiesView();
        this.moves = new MovesView();
        this.types = new TypesView();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();

    // Burger menu functionality
    const burger = document.querySelector('.navbar-burger');
    const menu = document.querySelector('#navMenu');

    if (burger) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('is-active');
            menu.classList.toggle('is-active');
        });
    }

    // Handle active navigation item
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-item').forEach(item => {
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('is-active');
        } else {
            item.classList.remove('is-active');
        }
    });
});