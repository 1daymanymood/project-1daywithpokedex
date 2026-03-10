import React from 'react'
import pokeball from '../assets/Pokeball-PNG-image.png'
import { Link } from 'react-router'

const HeaderLogo = () => {
    return (
        <div className='mb-5 '>
            <Link to={"/"} className='flex flex-col justify-center items-center '>
                <img src={pokeball} alt="" width={100} />
                <h1 className='text-text-black font-extrabold'>1Day with Pokémon</h1>
            </Link>
        </div>
    )
}

export default HeaderLogo