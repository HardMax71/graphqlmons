// js/abilities.js

// Modal Class to Handle Displaying Ability Details
class Modal {
    constructor() {
        this.modal = document.getElementById('modal');
        this.title = this.modal.querySelector('.modal-card-title');
        this.content = this.modal.querySelector('.modal-card-body');
        this.closeButton = this.modal.querySelector('.delete');
        this.background = this.modal.querySelector('.modal-background');

        // Event Listeners for Closing the Modal
        this.closeButton.addEventListener('click', () => this.hide());
        this.background.addEventListener('click', () => this.hide());
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hide();
            }
        });
    }

    show(title, content) {
        this.title.textContent = title;
        this.content.innerHTML = content;
        this.modal.classList.add('is-active');
        document.documentElement.classList.add('is-clipped');
    }

    hide() {
        this.modal.classList.remove('is-active');
        document.documentElement.classList.remove('is-clipped');
    }
}

const modal = new Modal();

class AbilitiesView {
    constructor() {
        this.container = document.querySelector('.abilities-grid');
        this.pagination = document.querySelector('.pagination'); // Corrected selector
        this.loadingIndicator = document.querySelector('.loading'); // Loading indicator
        this.itemsPerPage = 20;
        this.currentPage = 1;
        this.totalItems = 0;
        this.init();
    }

    async init() {
        await this.loadAbilities(1);
    }

    async loadAbilities(page) {
        try {
            this.showLoading(); // Show loading indicator
            const offset = (page - 1) * this.itemsPerPage;
            const response = await api.getAbilities(this.itemsPerPage, offset);
            console.log('API response:', response); // Log the response for debugging

            let abilities;
            let count;

            // Adjusted to handle direct array response
            if (response && Array.isArray(response)) {
                abilities = response;
                count = response.length;
            } else {
                // Unexpected response structure
                throw new Error('Invalid response structure');
            }

            this.totalItems = count;
            this.currentPage = page;
            this.renderAbilities(abilities);
            this.renderPagination();
        } catch (error) {
            console.error('Error loading abilities:', error);
            this.container.innerHTML = '<p class="has-text-danger">Failed to load abilities. Please try again later.</p>';
        } finally {
            this.hideLoading(); // Hide loading indicator
        }
    }

    renderAbilities(abilities) {
        // Clear existing content
        this.container.innerHTML = '';

        if (!abilities || abilities.length === 0) {
            this.container.innerHTML = '<p class="has-text-danger">No abilities found.</p>';
            return;
        }

        // Iterate through abilities and create cards
        abilities.forEach(ability => {
            const column = document.createElement('div');
            column.className = 'column is-3';

            const card = document.createElement('div');
            card.className = 'card';
            // Construct the detail URL using ability ID
            card.dataset.url = `http://localhost:8000/api/abilities/${ability.id}`;

            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';

            const title = document.createElement('p');
            title.className = 'title is-4';
            title.textContent = this.capitalize(ability.name);

            const subtitle = document.createElement('p');
            subtitle.className = 'subtitle is-6';
            subtitle.textContent = 'Loading description...';

            cardContent.appendChild(title);
            cardContent.appendChild(subtitle);

            const cardFooter = document.createElement('footer');
            cardFooter.className = 'card-footer';

            const viewDetails = document.createElement('a');
            viewDetails.className = 'card-footer-item view-details';
            viewDetails.textContent = 'View Details';

            cardFooter.appendChild(viewDetails);

            card.appendChild(cardContent);
            card.appendChild(cardFooter);

            column.appendChild(card);
            this.container.appendChild(column);
        });

        this.addAbilityEventListeners();
        this.fetchAbilityDescriptions(abilities);
    }

    addAbilityEventListeners() {
        this.container.querySelectorAll('.card').forEach(card => {
            card.querySelector('.view-details').addEventListener('click', async () => {
                const abilityUrl = card.dataset.url;
                try {
                    const ability = await api.getAbilityByUrl(abilityUrl);
                    this.showAbilityDetails(ability);
                } catch (error) {
                    console.error(`Error fetching ability details for ${abilityUrl}:`, error);
                    modal.show('Error', '<p class="has-text-danger">Failed to load ability details. Please try again later.</p>');
                }
            });
        });
    }

    async fetchAbilityDescriptions(abilities) {
        abilities.forEach(async (ability) => {
            try {
                const abilityUrl = `http://localhost:8000/api/abilities/${ability.id}`;
                const abilityData = await api.getAbilityByUrl(abilityUrl);
                // Access the correct fields based on backend response
                const shortEffect = abilityData.effects?.[0]?.short_effect || 'No description available.';
                const card = this.container.querySelector(`.card[data-url="${abilityUrl}"]`);
                if (card) {
                    card.querySelector('.subtitle').textContent = shortEffect;
                }
            } catch (error) {
                console.error(`Error fetching description for ${ability.name}:`, error);
                const card = this.container.querySelector(`.card[data-url="${abilityUrl}"]`);
                if (card) {
                    card.querySelector('.subtitle').textContent = 'No description available.';
                }
            }
        });
    }

    renderPagination() {
        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        if (totalPages <= 1) {
            this.pagination.innerHTML = ''; // No pagination needed
            return;
        }

        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

        // Clear existing pagination
        this.pagination.innerHTML = '';

        // Previous Button
        const prev = document.createElement('a');
        prev.className = 'pagination-previous';
        prev.textContent = 'Previous';
        if (this.currentPage === 1) {
            prev.classList.add('is-disabled');
        }
        this.pagination.appendChild(prev);

        // Next Button
        const next = document.createElement('a');
        next.className = 'pagination-next';
        next.textContent = 'Next';
        if (this.currentPage === totalPages) {
            next.classList.add('is-disabled');
        }
        this.pagination.appendChild(next);

        // Pagination List
        const paginationList = document.createElement('ul');
        paginationList.className = 'pagination-list';

        pages.forEach(page => {
            const listItem = document.createElement('li');
            const pageLink = document.createElement('a');
            pageLink.className = `pagination-link ${page === this.currentPage ? 'is-current' : ''}`;
            pageLink.setAttribute('aria-label', `Page ${page}`);
            pageLink.textContent = page;

            listItem.appendChild(pageLink);
            paginationList.appendChild(listItem);
        });

        this.pagination.appendChild(paginationList);

        this.addPaginationEventListeners();
    }

    addPaginationEventListeners() {
        const prev = this.pagination.querySelector('.pagination-previous');
        const next = this.pagination.querySelector('.pagination-next');
        const links = this.pagination.querySelectorAll('.pagination-link');

        if (prev && !prev.classList.contains('is-disabled')) {
            prev.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.loadAbilities(this.currentPage - 1);
                }
            });
        }

        if (next && !next.classList.contains('is-disabled')) {
            next.addEventListener('click', () => {
                const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
                if (this.currentPage < totalPages) {
                    this.loadAbilities(this.currentPage + 1);
                }
            });
        }

        links.forEach(link => {
            link.addEventListener('click', () => {
                const page = parseInt(link.textContent);
                if (page !== this.currentPage) {
                    this.loadAbilities(page);
                }
            });
        });
    }

    showAbilityDetails(ability) {
        // Debugging: Log the ability object
        console.log('Detailed Ability Data:', ability);

        // Check if necessary fields exist
        if (
            !ability.effect_entries ||
            ability.effect_entries.length === 0 ||
            !ability.pokemon
        ) {
            modal.show('Error', '<p class="has-text-danger">Incomplete ability data.</p>');
            return;
        }

        const title = this.capitalize(ability.name);

        // Find the effect entry with English language
        const effectEntry = ability.effect_entries.find(entry => entry.language.name.toLowerCase() === 'english');
        const effect = effectEntry?.effect || 'No detailed effect available.';
        const shortEffect = effectEntry?.short_effect || 'No short description available.';

        // Extract Pokémon that have this ability
        const pokemonWithAbility = ability.pokemon.map(p => `
            <span class="tag is-info">${this.capitalize(p.pokemon.name)}</span>
        `).join(' ') || 'No Pokémon found.';

        // Since 'pokemon_v2_abilityversiongroupdetails' is not present, omit 'Available in Game Versions'
        // Alternatively, use flavor_text_entries to extract version information if desired

        const content = `
            <div class="content">
                <h4 class="title is-4">Short Effect</h4>
                <p>${shortEffect}</p>
                <h4 class="title is-4">Full Effect</h4>
                <p>${effect}</p>
                <h4 class="title is-4">Pokémon with this Ability:</h4>
                <div class="tags">
                    ${pokemonWithAbility}
                </div>
            </div>
        `;

        modal.show(title.toUpperCase(), content);
    }

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
        }
    }

    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }
}

// Initialize the AbilitiesView when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AbilitiesView();
});
