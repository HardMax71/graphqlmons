// js/types.js

// Modal Class to Handle Displaying Type Details
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

class TypesView {
    constructor() {
        this.container = document.querySelector('.types-grid');
        this.pagination = document.querySelector('.pagination'); // Corrected selector
        this.loadingIndicator = document.querySelector('.loading'); // Loading indicator
        this.itemsPerPage = 20;
        this.currentPage = 1;
        this.totalItems = 0; // Assuming the backend does not provide total count
        this.init();
    }

    async init() {
        await this.loadTypes(1);
    }

    async loadTypes(page) {
        try {
            this.showLoading(); // Show loading indicator
            const response = await api.getTypes(); // Fetch all types without limit and offset
            console.log('API response:', response); // Log the response for debugging

            let types;

            // Validate response structure
            if (response && Array.isArray(response)) {
                types = response;
            } else {
                throw new Error('Invalid response structure');
            }

            // Fetch detailed data for all types in parallel
            const detailedTypesPromises = types.map(type => api.getTypeById(type.id));

            const detailedTypes = await Promise.all(detailedTypesPromises);
            console.log('Detailed Types:', detailedTypes); // For debugging

            // Combine the basic type data with detailed type data
            const combinedTypes = types.map(type => {
                const detailed = detailedTypes.find(d => d.id === type.id);
                return {
                    id: type.id,
                    name: type.name,
                    damage_relations: type.damage_relations, // From GET /
                    // From GET /{type_id}, likely 'damage_relations', 'pokemon', 'moves'
                    // Adjust property access based on actual response structure
                    pokemon: this.extractPokemon(detailed),
                    moves: this.extractMoves(detailed)
                };
            });

            this.totalItems = combinedTypes.length;
            this.currentPage = page;
            this.renderTypes(combinedTypes);
            this.renderPagination();
        } catch (error) {
            console.error('Error loading types:', error);
            this.container.innerHTML = '<p class="has-text-danger">Failed to load types. Please try again later.</p>';
        } finally {
            this.hideLoading(); // Hide loading indicator
        }
    }

    // Helper method to extract Pokémon names
    extractPokemon(detailed) {
        if (
            detailed &&
            detailed.pokemon &&
            Array.isArray(detailed.pokemon)
        ) {
            // Assuming each p has p.pokemon.name
            return detailed.pokemon.map(p => {
                if (p.pokemon && typeof p.pokemon.name === 'string') {
                    return p.pokemon.name;
                }
                return 'Unknown';
            });
        }
        return [];
    }

    // Helper method to extract Move names
    extractMoves(detailed) {
        if (
            detailed &&
            detailed.moves &&
            Array.isArray(detailed.moves)
        ) {
            // Assuming each m has m.move.name
            return detailed.moves.map(m => {
                if (m.move && typeof m.move.name === 'string') {
                    return m.move.name;
                }
                return 'Unknown';
            });
        }
        return [];
    }

    renderTypes(types) {
        // Clear existing content
        this.container.innerHTML = '';

        if (!types || types.length === 0) {
            this.container.innerHTML = '<p class="has-text-danger">No types found.</p>';
            return;
        }

        // Calculate pagination bounds
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedTypes = types.slice(startIndex, endIndex);

        paginatedTypes.forEach(type => {
            const column = document.createElement('div');
            column.className = 'column is-3';

            const card = document.createElement('div');
            card.className = 'card type-card'; // Added 'type-card' class for custom styling
            // Set data-id attribute for type
            card.dataset.id = type.id;

            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';

            const title = document.createElement('p');
            title.className = 'title is-4';
            title.textContent = this.capitalize(type.name);

            const tagContainer = document.createElement('div');
            tagContainer.className = 'tags has-addons mb-2';

            const typeTag = document.createElement('span');
            typeTag.className = `tag type-${type.name}`;
            typeTag.textContent = this.capitalize(type.name);

            tagContainer.appendChild(typeTag);

            // Safely access pokemon and moves counts
            const pokemonCount = Array.isArray(type.pokemon) ? type.pokemon.length : 0;
            const movesCount = Array.isArray(type.moves) ? type.moves.length : 0;

            const typeStats = document.createElement('div');
            typeStats.className = 'content';

            typeStats.innerHTML = `
                <p><strong>Pokémon Count:</strong> ${pokemonCount}</p>
                <p><strong>Moves Count:</strong> ${movesCount}</p>
            `;

            cardContent.appendChild(title);
            cardContent.appendChild(tagContainer);
            cardContent.appendChild(typeStats);

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

            // Animate card appearance
            setTimeout(() => {
                card.classList.add('visible');
            }, 100); // Slight delay for animation effect
        });

        this.addTypeEventListeners();
    }

    addTypeEventListeners() {
        this.container.querySelectorAll('.card').forEach(card => {
            card.querySelector('.view-details').addEventListener('click', async () => {
                const typeId = card.dataset.id;
                try {
                    const type = await api.getTypeById(typeId);
                    this.showTypeDetails(type);
                } catch (error) {
                    console.error(`Error fetching type details for ID ${typeId}:`, error);
                    modal.show('Error', '<p class="has-text-danger">Failed to load type details. Please try again later.</p>');
                }
            });
        });
    }

    renderPagination() {
        // Calculate total pages based on totalItems and itemsPerPage
        const totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        const currentPage = this.currentPage;

        // Clear existing pagination
        this.pagination.innerHTML = '';

        // Previous Button
        const prev = document.createElement('a');
        prev.className = 'pagination-previous';
        prev.textContent = 'Previous';
        if (currentPage === 1) {
            prev.classList.add('is-disabled');
        }
        this.pagination.appendChild(prev);

        // Next Button
        const next = document.createElement('a');
        next.className = 'pagination-next';
        next.textContent = 'Next';
        if (currentPage === totalPages || totalPages === 0) {
            next.classList.add('is-disabled');
        }
        this.pagination.appendChild(next);

        // Pagination List
        const paginationList = document.createElement('ul');
        paginationList.className = 'pagination-list';

        // Generate page links
        for (let page = 1; page <= totalPages; page++) {
            const listItem = document.createElement('li');
            const pageLink = document.createElement('a');
            pageLink.className = `pagination-link ${page === currentPage ? 'is-current' : ''}`;
            pageLink.setAttribute('aria-label', `Page ${page}`);
            pageLink.textContent = page;

            listItem.appendChild(pageLink);
            paginationList.appendChild(listItem);
        }

        this.pagination.appendChild(paginationList);

        this.addPaginationEventListeners(totalPages);
    }

    addPaginationEventListeners(totalPages) {
        const prev = this.pagination.querySelector('.pagination-previous');
        const next = this.pagination.querySelector('.pagination-next');
        const links = this.pagination.querySelectorAll('.pagination-link');

        if (prev && !prev.classList.contains('is-disabled')) {
            prev.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.loadTypes(this.currentPage - 1);
                }
            });
        }

        if (next && !next.classList.contains('is-disabled')) {
            next.addEventListener('click', () => {
                if (this.currentPage < totalPages) {
                    this.loadTypes(this.currentPage + 1);
                }
            });
        }

        links.forEach(link => {
            link.addEventListener('click', () => {
                const page = parseInt(link.textContent);
                if (page !== this.currentPage) {
                    this.loadTypes(page);
                }
            });
        });
    }

    showTypeDetails(type) {
        // Debugging: Log the type object
        console.log('Detailed Type Data:', type);

        // Check if necessary fields exist
        if (
            !type.damage_relations ||
            (
                !type.damage_relations.double_damage_to.length &&
                !type.damage_relations.half_damage_to.length &&
                !type.damage_relations.no_damage_to.length &&
                !type.damage_relations.double_damage_from.length &&
                !type.damage_relations.half_damage_from.length &&
                !type.damage_relations.no_damage_from.length
            )
        ) {
            modal.show('Error', '<p class="has-text-danger">Incomplete type data.</p>');
            return;
        }

        const title = `${this.capitalize(type.name)} Type`;

        // Safely access pokemon and moves
        const pokemonList = Array.isArray(type.pokemon) ? type.pokemon : [];
        const movesList = Array.isArray(type.moves) ? type.moves : [];

        const content = `
            <div class="content">
                <div class="columns">
                    <div class="column">
                        <h4>Super Effective Against:</h4>
                        <div class="tags">
                            ${type.damage_relations.double_damage_to.map(t => `
                                <span class="tag type-${t.name}">${this.capitalize(t.name)}</span>
                            `).join('')}
                            ${type.damage_relations.double_damage_to.length === 0 ? '<span class="tag">None</span>' : ''}
                        </div>

                        <h4>Not Very Effective Against:</h4>
                        <div class="tags">
                            ${type.damage_relations.half_damage_to.map(t => `
                                <span class="tag type-${t.name}">${this.capitalize(t.name)}</span>
                            `).join('')}
                            ${type.damage_relations.half_damage_to.length === 0 ? '<span class="tag">None</span>' : ''}
                        </div>

                        <h4>No Effect Against:</h4>
                        <div class="tags">
                            ${type.damage_relations.no_damage_to.map(t => `
                                <span class="tag type-${t.name}">${this.capitalize(t.name)}</span>
                            `).join('')}
                            ${type.damage_relations.no_damage_to.length === 0 ? '<span class="tag">None</span>' : ''}
                        </div>
                    </div>
                    <div class="column">
                        <h4>Weak To:</h4>
                        <div class="tags">
                            ${type.damage_relations.double_damage_from.map(t => `
                                <span class="tag type-${t.name}">${this.capitalize(t.name)}</span>
                            `).join('')}
                            ${type.damage_relations.double_damage_from.length === 0 ? '<span class="tag">None</span>' : ''}
                        </div>

                        <h4>Resistant To:</h4>
                        <div class="tags">
                            ${type.damage_relations.half_damage_from.map(t => `
                                <span class="tag type-${t.name}">${this.capitalize(t.name)}</span>
                            `).join('')}
                            ${type.damage_relations.half_damage_from.length === 0 ? '<span class="tag">None</span>' : ''}
                        </div>

                        <h4>Immune To:</h4>
                        <div class="tags">
                            ${type.damage_relations.no_damage_from.map(t => `
                                <span class="tag type-${t.name}">${this.capitalize(t.name)}</span>
                            `).join('')}
                            ${type.damage_relations.no_damage_from.length === 0 ? '<span class="tag">None</span>' : ''}
                        </div>
                    </div>
                </div>

                <h4>Pokémon of this Type:</h4>
                <div class="tags">
                    ${pokemonList.slice(0, 20).map(p => `
                        <span class="tag">${this.capitalize(p)}</span>
                    `).join('')}
                    ${pokemonList.length > 20 ? `<span class="tag">+${pokemonList.length - 20} more</span>` : ''}
                </div>

                <h4>Moves of this Type:</h4>
                <div class="tags">
                    ${movesList.slice(0, 20).map(m => `
                        <span class="tag">${this.capitalize(m)}</span>
                    `).join('')}
                    ${movesList.length > 20 ? `<span class="tag">+${movesList.length - 20} more</span>` : ''}
                </div>
            </div>
        `;

        modal.show(title, content);
    }

    capitalize(str) {
        if (typeof str !== 'string') return '';
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

// Initialize the TypesView when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TypesView();
});
