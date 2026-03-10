import React, { useEffect, useState } from 'react'
import { getPokeForSearch } from '../services/pokeService';
import { Link } from 'react-router';


const SearchPoke = () => {
    const [searchText, setSearchText] = useState('');
    const [delayText, setDelayText] = useState(searchText);
    const [allPoke, setAllPoke] = useState([]);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const fetchAllPoke = async () => {
            const allPokemon = await getPokeForSearch();
            setAllPoke(allPokemon);
        };
        fetchAllPoke();
    }, []);

    const handleInputChange = (e) => {
        setSearchText(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsActive(false);
            e.target.blur();
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            setDelayText(searchText.toLowerCase().trim());
        }, 200)
        return () => {
            clearTimeout(delay);
        }
    }, [searchText]);

    const filteredPoke = allPoke.filter(poke =>
        poke.name.toLowerCase().includes(delayText)
    );

    return (
        <div className="w-full flex justify-center">
            <div className="relative w-[50%]">
                <input
                    type="text"
                    placeholder="Search Pokémon"
                    className="w-full p-2 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 text-text-black"
                    onChange={handleInputChange}
                    onFocus={() => setIsActive(true)}
                    onBlur={() => setTimeout(() => setIsActive(false), 150)} 
                    onKeyDown={handleKeyDown}
                    value={searchText}
                />

                {isActive && searchText && filteredPoke.length > 0 && (
                    <ul className="absolute text-text-black w-full max-h-[350px] mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 z-10000">
                        {filteredPoke.map((poke) => (
                            <li
                                key={poke.id}
                                onClick={() => {
                                    setIsActive(false);
                                    setSearchText('');
                                }}
                            >
                                <Link to={`/pokedex/${poke.name}`}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center transition"
                                >
                                    <div className="font-semibold">#{poke.id}</div>
                                    <div className="flex items-center flex-row gap-2">
                                        <div className="font-semibold">{poke.name.toUpperCase()}</div>
                                        <img src={poke.image} alt={poke.name} width={40} />
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div >
    );
};

export default SearchPoke
