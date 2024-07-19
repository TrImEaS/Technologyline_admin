import { useState, useEffect } from 'react'
import { Route, Routes ,useLocation } from "react-router-dom"
import Login from './Components/Login'
import Home from './Pages/Home.jsx'
import ArticleEditor from './Pages/ArticleEditor.jsx'
import Nav from './Components/Nav.jsx'
import Products from './Pages/Products.jsx'
import Error from './Pages/Error.jsx'

export default function App() {
  const [login, setLogin] = useState(false)
  const [user, setUser] = useState('')

  return (
    login === false 
    ? <Login loginSetter={setLogin} userSetter={setUser}/> :
    <main className='relative flex flex-col items-center bg-[#111] min-w-screen min-h-screen h-full font-body'>
      <ScrollToTopOnLocationChange />
      <Nav user={user}/>
      <Routes>
        <Route path="/admin/page/" element={<Home/>}/>
        <Route path="/admin/page/products" element={<ArticleEditor/>}/>
        <Route path="/admin/page/products/:product" element={<Products/>}/>
        <Route path="*" element={<Error/>}/>
      </Routes>
      {/* <div className='absolute background min-h-screen h-full w-full'></div> */}
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
