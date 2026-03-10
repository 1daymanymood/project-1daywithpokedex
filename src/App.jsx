import React from 'react'
import './App.css'
import { Routes, Route } from 'react-router'


import PokedexPage from './pages/PokedexPage'
import Home from './pages/Home'
import SearchPoke from './components/SearchPoke'
import HeaderLogo from './components/HeaderLogo'


const App = () => {
  return (
    <div className='w-full bg-main-bg text-text-white'>
      <div className='mx-auto max-w-[1440px] p-4'>
        <HeaderLogo />
        <SearchPoke />
      </div>

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/pokedex/:name' element={<PokedexPage />} />
      </Routes>
    </div>

  )
}

export default App