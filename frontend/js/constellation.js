// js/constellation.js
class PokemonConstellation {
    constructor() {
        this.container = document.querySelector('.constellation-container');
        this.nodes = new Map();
        this.lines = new Set();
        this.typeGroups = new Map();
        this.init();
    }

    async init() {
        try {
            await this.loadPokemonData();
            this.createNodes();
            this.createLines();
            this.addEventListeners();
            this.removeLoadingMessage();

            // Add window resize handler
            window.addEventListener('resize', () => {
                this.handleResize();
            });
        } catch (error) {
            console.error('Failed to initialize constellation:', error);
            this.removeLoadingMessage(); // Ensure loading message is removed even on error
        }
    }

    async loadPokemonData() {
        try {
            const pokemon = await api.getDetailedPokemon(100); // Limit to 100 Pokemon
            pokemon.forEach(p => {
                const type = p.pokemon_v2_pokemontypes[0]?.pokemon_v2_type?.name || 'unknown';
                if (!this.typeGroups.has(type)) {
                    this.typeGroups.set(type, []);
                }
                this.typeGroups.get(type).push(p);
            });
            console.log(`Loaded ${pokemon.length} Pokémon across ${this.typeGroups.size} types.`);
        } catch (error) {
            console.error('Error loading Pokemon data:', error);
            throw error; // Re-throw to be caught in init
        }
    }

    createNodes() {
        const centerX = this.container.clientWidth / 2;
        const centerY = this.container.clientHeight / 2;
        const radius = Math.min(centerX, centerY) * 0.6;

        Array.from(this.typeGroups.entries()).forEach(([type, pokemon], typeIndex) => {
            const groupAngle = (2 * Math.PI * typeIndex) / this.typeGroups.size;
            const groupX = centerX + radius * Math.cos(groupAngle);
            const groupY = centerY + radius * Math.sin(groupAngle);

            // Position Pokémon within group
            pokemon.forEach((p, index) => {
                const angle = (2 * Math.PI * index) / pokemon.length;
                const nodeRadius = radius * 0.2;
                const x = groupX + nodeRadius * Math.cos(angle);
                const y = groupY + nodeRadius * Math.sin(angle);

                const node = document.createElement('div');
                node.className = 'node';
                node.dataset.id = p.id;
                node.style.left = `${x - 24}px`; // Half of node width
                node.style.top = `${y - 24}px`; // Half of node height
                node.innerHTML = `
                    <div class="node-content">
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png" 
                             alt="${p.name}"
                             title="${p.name}">
                        <div class="node-name">${p.name}</div>
                    </div>
                `;
                this.container.appendChild(node);
                this.nodes.set(p.id, node);
            });
        });

        console.log(`Created ${this.nodes.size} Pokémon nodes.`);
    }

    createLines() {
        // Remove existing lines
        this.lines.forEach(line => line.element.remove());
        this.lines.clear();

        this.nodes.forEach((node, id) => {
            const closestNodes = this.findClosestNodes(node, 2);
            closestNodes.forEach(target => {
                if (!this.hasLine(node, target)) {
                    this.createLine(node, target);
                }
            });
        });

        console.log(`Created ${this.lines.size} connection lines.`);
    }

    findClosestNodes(node, count) {
        const rect = node.getBoundingClientRect();
        const nodeX = rect.left + rect.width / 2;
        const nodeY = rect.top + rect.height / 2;

        return Array.from(this.nodes.values())
            .filter(n => n !== node)
            .map(n => {
                const r = n.getBoundingClientRect();
                const x = r.left + r.width / 2;
                const y = r.top + r.height / 2;
                const distance = Math.hypot(x - nodeX, y - nodeY);
                return { node: n, distance };
            })
            .sort((a, b) => a.distance - b.distance)
            .slice(0, count)
            .map(n => n.node);
    }

    hasLine(node1, node2) {
        return Array.from(this.lines).some(line => {
            return (line.node1 === node1 && line.node2 === node2) ||
                   (line.node1 === node2 && line.node2 === node1);
        });
    }

    createLine(node1, node2) {
        const rect1 = node1.getBoundingClientRect();
        const rect2 = node2.getBoundingClientRect();

        const x1 = rect1.left + rect1.width / 2;
        const y1 = rect1.top + rect1.height / 2;
        const x2 = rect2.left + rect2.width / 2;
        const y2 = rect2.top + rect2.height / 2;

        const length = Math.hypot(x2 - x1, y2 - y1);
        const angle = Math.atan2(y2 - y1, x2 - x1);

        const line = document.createElement('div');
        line.className = 'node-line';
        line.style.width = `${length}px`;
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.transform = `rotate(${angle}rad)`;

        this.container.appendChild(line);
        this.lines.add({ element: line, node1, node2 });
    }

    addEventListeners() {
        this.nodes.forEach((node, id) => {
            node.addEventListener('click', async () => {
                const pokemon = await api.getPokemonById(id);
                this.showPokemonDetails(pokemon);
            });
        });
    }

    showPokemonDetails(pokemon) {
        const modal = document.getElementById('modal');
        const title = modal.querySelector('.modal-card-title');
        const content = modal.querySelector('.modal-card-body');

        title.textContent = pokemon.name.toUpperCase();
        content.innerHTML = `
    <div class="columns">
        <div class="column is-one-third">
            <figure class="image is-square">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png" 
                     alt="${pokemon.name}">
            </figure>
        </div>
        <div class="column">
            <div class="content">
                <p><strong>Height:</strong> ${pokemon.height / 10} m</p>
                <p><strong>Weight:</strong> ${pokemon.weight / 10} kg</p>
                <h4><strong>Stats:</strong></h4>
                ${pokemon.stats.map(s => `
                    <div class="field">
                        <label class="label">${s.stat.name}</label>
                        <div class="stat-container">
                            <progress class="progress is-info" 
                                      value="${s.base_stat}" 
                                      max="255"></progress>
                            <span class="stat-number">${s.base_stat}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
`;


        modal.classList.add('is-active');
        document.documentElement.classList.add('is-clipped');

        modal.querySelector('.delete').onclick = () => this.hideModal();
        modal.querySelector('.modal-background').onclick = () => this.hideModal();
    }

    hideModal() {
        const modal = document.getElementById('modal');
        modal.classList.remove('is-active');
        document.documentElement.classList.remove('is-clipped');
    }

    removeLoadingMessage() {
        const loadingDiv = this.container.querySelector('.loading');
        if (loadingDiv) {
            loadingDiv.remove();
            console.log('Removed loading message.');
        }
    }

    handleResize() {
        // Clear existing nodes and lines
        this.nodes.forEach(node => node.remove());
        this.nodes.clear();

        this.lines.forEach(line => line.element.remove());
        this.lines.clear();

        // Recreate nodes and lines
        this.createNodes();
        this.createLines();
        this.addEventListeners();

        console.log('Recreated nodes and lines on resize.');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PokemonConstellation();
});
