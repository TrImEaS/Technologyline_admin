import Login from './Components/Login'
import Home from './Pages/Home.jsx'
import Nav from './Components/Nav.jsx'
import { useState, useEffect } from 'react'
import { useLocation } from "react-router-dom"


export default function App() {
  const [login, setLogin] = useState(false)
  const [user, setUser] = useState('')


  return (
    login === false 
    ?
      <Login loginSetter={setLogin} userSetter={setUser}/>
    :
      <main className='relative flex flex-col items-center bg-[#fafafa] w-screen min-h-screen h-full font-body gap-10'>
        <ScrollToTopOnLocationChange />
        <Nav user={user}/>
        <Home/>
        <div id='background' className='absolute h-screen w-screen'></div>
      </main>
  )
}

function ScrollToTopOnLocationChange() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  return null
}
