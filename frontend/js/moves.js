// js/moves.js

// Modal Class to Handle Displaying Move Details
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

class MovesView {
    constructor() {
        this.container = document.querySelector('.moves-grid');
        this.pagination = document.querySelector('.pagination'); // Corrected selector
        this.loadingIndicator = document.querySelector('.loading'); // Loading indicator
        this.itemsPerPage = 20;
        this.currentPage = 1;
        this.totalItems = 0; // Assuming the backend does not provide total count
        this.init();
    }

    async init() {
        await this.loadMoves(1);
    }

    async loadMoves(page) {
        try {
            this.showLoading(); // Show loading indicator
            const offset = (page - 1) * this.itemsPerPage;
            const response = await api.getMoves(this.itemsPerPage, offset);
            console.log('API response:', response); // Log the response for debugging

            let moves;
            let count;

            // Adjusted to handle direct array response
            if (response && Array.isArray(response)) {
                moves = response;
                count = response.length;
            } else {
                // Unexpected response structure
                throw new Error('Invalid response structure');
            }

            this.totalItems = count;
            this.currentPage = page;
            this.renderMoves(moves);
            this.renderPagination();
        } catch (error) {
            console.error('Error loading moves:', error);
            this.container.innerHTML = '<p class="has-text-danger">Failed to load moves. Please try again later.</p>';
        } finally {
            this.hideLoading(); // Hide loading indicator
        }
    }

    renderMoves(moves) {
        // Clear existing content
        this.container.innerHTML = '';

        if (!moves || moves.length === 0) {
            this.container.innerHTML = '<p class="has-text-danger">No moves found.</p>';
            return;
        }

        // Iterate through moves and create cards
        moves.forEach(move => {
            const column = document.createElement('div');
            column.className = 'column is-3';

            const card = document.createElement('div');
            card.className = 'card move-card'; // Added 'move-card' class for custom styling
            // Set data-id attribute for move
            card.dataset.id = move.id;

            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';

            const title = document.createElement('p');
            title.className = 'title is-4';
            title.textContent = this.capitalize(move.name);

            const tagContainer = document.createElement('div');
            tagContainer.className = 'tags has-addons mb-2';

            const typeTag = document.createElement('span');
            typeTag.className = `tag type-${move.pokemon_v2_type.name}`;
            typeTag.textContent = this.capitalize(move.pokemon_v2_type.name);

            const damageClassTag = document.createElement('span');
            damageClassTag.className = 'tag is-dark';
            damageClassTag.textContent = this.capitalize(move.pokemon_v2_movedamageclass.name);

            tagContainer.appendChild(typeTag);
            tagContainer.appendChild(damageClassTag);

            const moveStats = document.createElement('div');
            moveStats.className = 'content';

            moveStats.innerHTML = `
                <p><strong>Power:</strong> ${move.power !== null ? move.power : '-'}</p>
                <p><strong>Accuracy:</strong> ${move.accuracy !== null ? move.accuracy : '-'}</p>
                <p><strong>PP:</strong> ${move.pp !== null ? move.pp : '-'}</p>
                <p><strong>Priority:</strong> ${move.priority !== null ? move.priority : '-'}</p>
            `;

            cardContent.appendChild(title);
            cardContent.appendChild(tagContainer);
            cardContent.appendChild(moveStats);

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

        this.addMoveEventListeners();
    }

    addMoveEventListeners() {
        this.container.querySelectorAll('.card').forEach(card => {
            card.querySelector('.view-details').addEventListener('click', async () => {
                const moveId = card.dataset.id;
                try {
                    const move = await api.getMoveById(moveId);
                    this.showMoveDetails(move);
                } catch (error) {
                    console.error(`Error fetching move details for ID ${moveId}:`, error);
                    modal.show('Error', '<p class="has-text-danger">Failed to load move details. Please try again later.</p>');
                }
            });
        });
    }

    renderPagination() {
        // Since backend does not provide total count, pagination is based on current response
        // If the number of items returned is less than itemsPerPage, disable 'Next'
        const hasNextPage = this.totalItems === this.itemsPerPage;

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
        if (!hasNextPage) {
            next.classList.add('is-disabled');
        }
        this.pagination.appendChild(next);

        // Pagination List
        const paginationList = document.createElement('ul');
        paginationList.className = 'pagination-list';

        // Since total pages are unknown, only show current page and adjacent pages
        const current = this.currentPage;
        const pages = [current];
        if (current > 1) pages.push(current - 1);
        if (hasNextPage) pages.push(current + 1);

        // Remove duplicates and sort
        const uniquePages = [...new Set(pages)].sort((a, b) => a - b);

        uniquePages.forEach(page => {
            const listItem = document.createElement('li');
            const pageLink = document.createElement('a');
            pageLink.className = `pagination-link ${page === this.currentPage ? 'is-current' : ''}`;
            pageLink.setAttribute('aria-label', `Page ${page}`);
            pageLink.textContent = page;

            listItem.appendChild(pageLink);
            paginationList.appendChild(listItem);
        });

        this.pagination.appendChild(paginationList);

        this.addPaginationEventListeners(hasNextPage);
    }

    addPaginationEventListeners(hasNextPage) {
        const prev = this.pagination.querySelector('.pagination-previous');
        const next = this.pagination.querySelector('.pagination-next');
        const links = this.pagination.querySelectorAll('.pagination-link');

        if (prev && !prev.classList.contains('is-disabled')) {
            prev.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.loadMoves(this.currentPage - 1);
                }
            });
        }

        if (next && !next.classList.contains('is-disabled')) {
            next.addEventListener('click', () => {
                if (hasNextPage) {
                    this.loadMoves(this.currentPage + 1);
                }
            });
        }

        links.forEach(link => {
            link.addEventListener('click', () => {
                const page = parseInt(link.textContent);
                if (page !== this.currentPage) {
                    this.loadMoves(page);
                }
            });
        });
    }

    showMoveDetails(move) {
        // Debugging: Log the move object
        console.log('Detailed Move Data:', move);

        // Check if necessary fields exist
        if (
            !move.effect_entries ||
            move.effect_entries.length === 0 ||
            !move.flavor_text_entries ||
            move.flavor_text_entries.length === 0
        ) {
            modal.show('Error', '<p class="has-text-danger">Incomplete move data.</p>');
            return;
        }

        const title = this.capitalize(move.name);

        // Find the effect entry with English language
        const effectEntry = move.effect_entries.find(entry => entry.language.name.toLowerCase() === 'english');
        const effect = effectEntry?.effect || 'No detailed effect available.';
        const shortEffect = effectEntry?.short_effect || 'No short description available.';

        // Find the first English flavor text
        const flavorEntry = move.flavor_text_entries.find(entry => entry.language.name.toLowerCase() === 'english');
        const flavorText = flavorEntry?.flavor_text.replace(/\n|\f/g, ' ') || 'No flavor text available.';

        // Extract target information
        const target = move.target ? this.capitalize(move.target.name.replace('-', ' ')) : 'Unknown';

        // Extract generation information
        const generation = move.generation ? this.capitalize(move.generation.name.replace('-', ' ')) : 'Unknown';

        // Extract type and damage class
        const type = move.pokemon_v2_type ? this.capitalize(move.pokemon_v2_type.name) : 'Unknown';
        const damageClass = move.pokemon_v2_movedamageclass ? this.capitalize(move.pokemon_v2_movedamageclass.name) : 'Unknown';

        const content = `
            <div class="content">
                <div class="tags has-addons mb-4">
                    <span class="tag type-${move.pokemon_v2_type.name}">${type}</span>
                    <span class="tag is-dark">${damageClass}</span>
                </div>

                <div class="columns">
                    <div class="column">
                        <p><strong>Power:</strong> ${move.power !== null ? move.power : '-'}</p>
                        <p><strong>Accuracy:</strong> ${move.accuracy !== null ? move.accuracy : '-'}</p>
                        <p><strong>PP:</strong> ${move.pp !== null ? move.pp : '-'}</p>
                        <p><strong>Priority:</strong> ${move.priority !== null ? move.priority : '-'}</p>
                        <p><strong>Generation:</strong> ${generation}</p>
                        <p><strong>Target:</strong> ${target}</p>
                    </div>
                    <div class="column">
                        <p><strong>Effect Chance:</strong> ${move.effect_chance !== null ? move.effect_chance : '-'}%</p>
                    </div>
                </div>

                <h4>Short Effect:</h4>
                <p>${shortEffect}</p>

                <h4>Full Effect:</h4>
                <p>${effect}</p>

                <h4>Flavor Text:</h4>
                <p>${flavorText}</p>
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

// Initialize the MovesView when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MovesView();
});
