import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router';
import { getPokeForPokedex, getSpeciesPoke, getEvoPoke } from '../services/pokeService';

import { typeColours } from '../constants/typeColor';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import LoadingAnimation from '../components/LoadingAnimation';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PokedexPage = () => {
    const { name } = useParams();
    const [pokemon, setPokemon] = useState(null);
    const [species, setSpecies] = useState(null);
    const [evo, setEvo] = useState(null);

    useEffect(() => {
        const fetchPokeInfo = async () => {
            try {
                const dataPoke = await getPokeForPokedex(name);
                setPokemon(dataPoke);

                const speciesData = await getSpeciesPoke(name);
                setSpecies(speciesData);

                const evoData = await getEvoPoke(speciesData.evolution_chain.url);
                setEvo(evoData)

            } catch (err) {
                console.error("Error fetching poke:", err);
            }
        };

        fetchPokeInfo();
    }, [name]);

    if (!pokemon || !evo) return <LoadingAnimation size={20} />;


    const flavorText = species?.flavor_text_entries?.find(
        entry => entry.language.name === 'en' && entry.version.name === 'shield'
    )?.flavor_text
        ? species.flavor_text_entries.find(
            entry => entry.language.name === 'en' && entry.version.name === 'shield'
        )?.flavor_text.replace(/\n|\f/g, ' ')
        : species?.flavor_text_entries?.find(entry => entry.language.name === 'en')?.flavor_text.replace(/\n|\f/g, ' ');

    const statsData = {
        labels: pokemon.stats.map(stat => {
            switch (stat.stat.name) {
                case 'hp': return 'HP';
                case 'attack': return 'ATK';
                case 'defense': return 'DEF';
                case 'special-attack': return 'SP.ATK';
                case 'special-defense': return 'SP.DEF';
                case 'speed': return 'SPD';
                default: return stat.stat.name.toUpperCase();
            }
        }),
        datasets: [
            {
                label: 'Base Stats',
                data: pokemon.stats.map(stat => stat.base_stat),
                backgroundColor: pokemon.stats.map(stat => {
                    switch (stat.stat.name) {
                        case 'hp': return '#22c55e';
                        case 'attack': return '#ef4444';
                        case 'defense': return '#3b82f6';
                        case 'special-attack': return '#facc15';
                        case 'special-defense': return '#a855f7';
                        case 'speed': return '#ec4899';
                        default: return '#9ca3af';
                    }
                }),
            },
        ],
    };

    const statsOptions = {
        indexAxis: 'y',
        responsive: true,
        plugins: { legend: { display: false }, title: { display: false } },
        scales: {
            x: { suggestedMin: 0, suggestedMax: 150, grid: { drawTicks: false, drawBorder: false, display: false }, ticks: { stepSize: 20, color: '#000' } },
            y: { grid: { drawTicks: false, drawBorder: false, display: false }, ticks: { color: '#000', font: { size: 14 } } },
        },
    };

    const evoTree = (details) => {
        if (!details || details.length === 0) return '';

        const d = details[0];
        let cond = [];

        switch (d.trigger?.name) {
            case 'level-up':
                if (d.min_level) cond.push(`Level ${d.min_level}`);
                if (d.min_happiness) cond.push(`Happiness ${d.min_happiness}`);
                if (d.min_beauty) cond.push(`Beauty ${d.min_beauty}`);
                if (d.time_of_day && d.time_of_day !== '') cond.push(d.time_of_day);
                if (d.location) cond.push(d.location.name);
                break;
            case 'use-item':
                if (d.item) cond.push(d.item.name.replace('-', ' '));
                break;
            case 'trade':
                cond.push('Trade');
                break;
            default:
                if (d.trigger?.name) cond.push(d.trigger.name);
        }

        return cond.join(' / ');
    };

    const renderEvo = (node) => {
        //Eevee
        if (node.name === 'eevee' && node.evolves_to?.length) {
            return (
                <div className="flex flex-row flex-wrap items-start gap-6 justify-center w-full">
                    <div className="flex flex-col items-center m-2">
                        <Link to={`/pokedex/${node.name}`} className="flex flex-col items-center m-2">
                            <img src={node.image} alt={node.name} className="w-20 h-20 object-contain mb-1" />
                            <div className="font-bold">{node.name?.toUpperCase()}</div>
                        </Link>
                        {node.evolution_details?.length > 0 && (
                            <div className="text-sm text-gray-600 text-center">
                                {evoTree(node.evolution_details)}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {node.evolves_to.map(child => (
                            <div key={child.name} className="flex flex-col items-center m-2">
                                <Link to={`/pokedex/${child.name}`} className="flex flex-col items-center m-2">
                                    <img src={child.image} alt={child.name} className="w-20 h-20 object-contain mb-1" />
                                    <div className="font-bold">{child.name?.toUpperCase()}</div>
                                </Link>
                                {child.evolution_details?.length > 0 && (
                                    <div className="text-sm text-gray-600 text-center">
                                        {evoTree(child.evolution_details)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        //normal pokemon
        return (
            <div key={node.name} className="flex flex-row items-start gap-4">
                <div className="flex flex-col items-center m-2">
                    <Link to={`/pokedex/${node.name}`} className="flex flex-col items-center m-2">
                        <img src={node.image} alt={node.name} className="w-20 h-20 object-contain mb-1" />
                        <div className="font-bold">{node.name?.toUpperCase()}</div>
                    </Link>
                    {node.evolution_details?.length > 0 && (
                        <div className="text-sm text-gray-600 text-center">
                            {evoTree(node.evolution_details)}
                        </div>
                    )}
                </div>
                {node.evolves_to && node.evolves_to.length > 0 && (
                    <div className="flex flex-row flex-wrap justify-start items-start gap-4">
                        {node.evolves_to.map(child => renderEvo(child))}
                    </div>
                )}
            </div>
        );
    };



    return (
        <div className='sm:p-4 flex flex-col lg:flex-row justify-between text-text-black font-semibold'>
            <div className='flex-1 flex items-center justify-center'>
                <img src={pokemon.sprites?.other?.['official-artwork']?.front_default} alt={pokemon.name} className='w-[50%] h-auto object-contain' />
            </div>

            <div className='flex-1 p-4'>
                <div className='font-extrabold text-4xl'>#{pokemon.id} {pokemon.name.toUpperCase()}</div>
                <div className='font-bold mt-4 flex flex-row gap-2'>
                    <div className='font-bold'>Height: {pokemon.height / 10} m.</div>
                    <div className='font-bold'>Weight: {pokemon.weight / 10} kg.</div>
                </div>
                <div className='flex flex-row gap-2 mt-4 items-center'>
                    <div className='text-xl font-bold'>Types :</div>
                    {pokemon.types.map((t, idx) => (
                        <div key={idx} className={`type-poke text-text-white ${typeColours[t.type.name]}`}>
                            {t.type.name.toUpperCase()}
                        </div>
                    ))}
                </div>

                <div className='mt-4'>
                    <div className='text-xl font-bold'>Flavor</div>
                    <div>{flavorText}</div>
                </div>

                <div className='w-[75%] h-100 mx-auto flex justify-center flex-col items-center mt-4'>
                    <div className='text-xl font-bold'>Pokemon Base Stats</div>
                    <Bar data={statsData} options={statsOptions} />
                </div>

                <div className='mt-6'>
                    <h2 className='text-xl font-bold mb-2'>Evolution Chain</h2>
                    <div className='flex flex-row flex-wrap justify-center items-start gap-6'>
                        {renderEvo(evo)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PokedexPage;
