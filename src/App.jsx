import { useState, useEffect } from 'react'
import { Route, Routes ,useLocation } from "react-router-dom"
import Login from './Components/Login'
import Home from './Pages/Home.jsx'
import ArticleEditor from './Pages/ArticleEditor.jsx'
import Nav from './Components/Nav.jsx'
import Products from './Pages/Products.jsx'
import Error from './Pages/Error.jsx'
import Queries from './Pages/Queries.jsx'
// import Test from './Components/Test.jsx'
import Banners from './Pages/Banners.jsx'

export default function App() {
  const [login, setLogin] = useState(false)
  const [user, setUser] = useState('')

  return (
    login === false 
    ? <Login loginSetter={setLogin} userSetter={setUser}/> :
    <main className='relative flex flex-col items-center bg-gradient-to-br from-[#ffb400] to-[#8b2323] min-w-screen min-h-screen h-full font-body'>
      <ScrollToTopOnLocationChange />
      <Nav user={user}/>
      <Routes>
        <Route path="/admin/page/" element={<Home/>}/>
        <Route path="/admin/page/article_editor" element={<ArticleEditor/>}/>
        <Route path="/admin/page/products" element={<Products/>}/>
        <Route path='/admin/page/queries' element={<Queries/>}/>
        <Route path='/admin/page/banners' element={<Banners/>}/>
        {/* <Route path='/admin/page/test' element={<Test/>}/> */}
        <Route path="/admin/page/error" element={<Error/>}/>
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
