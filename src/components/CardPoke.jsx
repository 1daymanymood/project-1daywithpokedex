import React, { useEffect, useState } from 'react'

import InfiniteScroll from 'react-infinite-scroll-component';
import { Link } from 'react-router';
import { getPokeForCard } from '../services/pokeService'
import { typeColours } from '../constants/typeColor';


const CardPoke = () => {
    const [pokedex, setPokedex] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchMorePoke = async () => {
        const limit = 20;
        const offset = page * limit;

        const newData = await getPokeForCard(offset, limit);

        if (newData.length === 0) {
            setHasMore(false);
            return;
        }

        setPokedex(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNewData = newData.filter(p => !existingIds.has(p.id));
            return [...prev, ...uniqueNewData];
        });

        setPage(prev => prev + 1);
    };

    useEffect(() => {
        fetchMorePoke();
    }, [])


    return (
        <InfiniteScroll
            dataLength={pokedex.length}
            next={fetchMorePoke}
            hasMore={hasMore}
            endMessage={
                <div
                    className='btn-for-back'
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    Back To The Top
                </div>
            }
        >

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 place-items-center gap-5 p-4 font-semibold'>
                {pokedex.map((poke) => (
                    <div key={`${poke.id}-${poke.name}`} className='flex flex-col justify-between max-w-[285px] w-full h-[375px] border rounded-3xl items-center px-2 py-4 gap-2 shadow-xl bg-second' >
                        <div className='flex justify-center items-center w-18 h-8 p-1 rounded-full font-bold text-xl'>#{poke.id}</div>
                        <img loading='lazy' src={poke.image} alt={`Image ${poke.name}`} width={150} className='hover:scale-150 z-1000' />
                        <div className='text-center font-bold text-xl'>{poke.name.toUpperCase()}</div>
                        <div className='flex gap-2'>{poke.types.map(t => (
                            <div key={t.type.name} className={`type-poke ${typeColours[t.type.name]}`}
                            >
                                {t.type.name.toUpperCase()}
                            </div>
                        ))}</div>

                        <Link to={`/pokedex/${poke.name}`} className='w-full flex justify-center'>
                            <div className='border px-2 p-1.5 w-[85%] text-center rounded-4xl bg-main-btn hover:bg-second-btn active:scale-95'>View More</div>
                        </Link>

                    </div>
                ))}
            </div>

        </InfiniteScroll >
    )
}

export default CardPoke