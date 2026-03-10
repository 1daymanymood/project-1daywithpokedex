import axios from "axios";
const BASE_URI = 'https://pokeapi.co/api/v2';

export const getPokeForCard = async (offset = 0, limit = 20) => {
    try {
        const res = await axios.get(`${BASE_URI}/pokemon?offset=${offset}&limit=${limit}`);
        const results = res.data.results;

        const promises = results.map(poke => axios.get(poke.url));
        const resPoke = await axios.all(promises);

        return resPoke
            .filter(res =>
                res.data.id <= 1025 &&
                res.data.sprites?.other?.['official-artwork']?.front_default)
            .map(res => ({
                id: res.data.id,
                name: res.data.name,
                image: res.data.sprites?.other?.['official-artwork']?.front_default,
                types: res.data.types,
            }))
    } catch (error) {
        console.error('❌error getPokeForCard()', error);
        return [];
    }
}

export const getPokeForSearch = async () => {
    try {
        const res = await axios.get(`${BASE_URI}/pokemon?limit=1025`);
        const results = res.data.results;
        const batchSize = 50;
        const allData = [];

        for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            const batchPromises = batch.map(poke => axios.get(poke.url));
            const batchResults = await Promise.allSettled(batchPromises);

            const filtered = batchResults
                .filter(res => res.status === 'fulfilled')
                .map(res => res.value)
                .filter(res => res.data.sprites?.other?.['official-artwork']?.front_default)
                .map(res => ({
                    id: res.data.id,
                    name: res.data.name,
                    image: res.data.sprites.other['official-artwork'].front_default,
                }));

            allData.push(...filtered);
        }

        return allData;
    } catch (error) {
        console.error('❌error getPokeForSearch()', error);
        return [];
    }
}

export const getPokeForPokedex = async (nameOrId) => {
    try {
        const res = await axios.get(`${BASE_URI}/pokemon/${nameOrId}`)
        return res.data;
    } catch (error) {
        console.error('❌error getPokeForPokedex', error);
    }
}

export const getSpeciesPoke = async (name) => {
    try {
        const res = await axios.get(`${BASE_URI}/pokemon-species/${name}`)
        return res.data;
    } catch (error) {
        console.error('❌error getSpeciesPoke()', error);
    }
}

export const getEvoPoke = async (url) => {
    try {
        const res = await axios.get(url);
        const chain = res.data.chain;

        const mapNode = async (node) => {
            const pokeData = await axios.get(`https://pokeapi.co/api/v2/pokemon/${node.species.name}`);
            return {
                name: node.species.name,
                image: pokeData.data.sprites?.other?.['official-artwork']?.front_default || '',
                evolution_details: node.evolution_details || [],
                evolves_to: await Promise.all(node.evolves_to.map(child => mapNode(child))),
            };
        };

        const evoTree = await mapNode(chain);
        return evoTree;

    } catch (error) {
        console.error('❌error getEvoPoke()', error);
        return null;
    }
};