import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './page/LoginPage';
import SignUpPage from './page/SignUpPage';
import HomePage from './page/HomePage';

const App = () => {

  let authUser = null;

  return (
    <div className='flex flex-col items-center justify-center'>
      <Routes>

        <Route path='/login' element={ !authUser ? <LoginPage /> : <Navigate to={"/"} /> } />
        <Route path='/signup' element={ !authUser ? <SignUpPage /> : <Navigate to={"/"} /> } />
        <Route path='/' element={ authUser ? <HomePage /> : <Navigate to={"/login"} />} />

      </Routes>
    </div>
  )
}

export default App
