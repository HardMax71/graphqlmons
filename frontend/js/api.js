// js/api.js

class PokeAPI {
    constructor(baseUrl = 'http://localhost:8000/api') {
        this.baseUrl = baseUrl;
    }

    async getPokemonList(limit = 20, offset = 0) {
        const response = await fetch(`${this.baseUrl}/pokemon/?limit=${limit}&offset=${offset}`);
        return response.json();
    }

    async getPokemonById(id) {
        const response = await fetch(`${this.baseUrl}/pokemon/${id}/`);
        return response.json();
    }

    async getDetailedPokemon(limit = 151) {
        try {
            const response = await fetch(`${this.baseUrl}/pokemon/detailed/?limit=${limit}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('Error fetching detailed Pokemon:', error);
            return [];
        }
    }

    async getAbilities(limit = 20, offset = 0) {
        const response = await fetch(`${this.baseUrl}/abilities/?limit=${limit}&offset=${offset}`);
        return response.json();
    }

    async getAbilityById(id) {
        const response = await fetch(`${this.baseUrl}/abilities/${id}/`);
        return response.json();
    }

    async getAbilityByUrl(url) {
        const response = await fetch(url);
        return response.json();
    }

    async getMoves(limit = 20, offset = 0) {
        const response = await fetch(`${this.baseUrl}/moves/?limit=${limit}&offset=${offset}`);
        return response.json();
    }

    async getMoveById(id) {
        const response = await fetch(`${this.baseUrl}/moves/${id}/`);
        return response.json();
    }

    async getTypes() {
        const response = await fetch(`${this.baseUrl}/types/`);
        return response.json();
    }

    async getTypeById(id) {
        const response = await fetch(`${this.baseUrl}/types/${id}/`);
        return response.json();
    }
}

const api = new PokeAPI();
