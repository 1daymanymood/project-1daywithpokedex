import React from 'react'
import pokeball from '../assets/Pokeball-PNG-Image.png';
const LoadingAnimation = ({ size = 16 }) => {
    return (
        <div className='flex justify-center items-center min-h-screen'>
            <img
                src={pokeball}
                alt="Loading..."
                className={`w-${size} h-${size} animate-spin`}
            />
        </div>
    )
}

export default LoadingAnimation