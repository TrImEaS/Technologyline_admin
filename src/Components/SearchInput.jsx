import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

const API_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_URL_PROD : import.meta.env.VITE_API_URL_DEV;

export default function SearchInput() {
  const [keyword, setKeyword] = useState('')
  const [searchMenu, setSearchMenu] = useState(false)
  
  const inputRef = useRef(null)
  const navigate = useNavigate()
  
  const handleChange = (e) => setKeyword(e.target.value)
  
  const handleSubmit = (e) => {
    e.preventDefault()
    navigate(`/search/?search=${keyword}`)
    setKeyword('')
  }

  const handleFocusMenu = () => setSearchMenu(true)

  const handleClickOutside = (e) => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      setSearchMenu(false)
    }
  }

  useEffect(() => {
    setSearchMenu(false)
  }, [location.search, navigate])

  useEffect(() =>{
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  },[])

  return(
    <form 
      className='flex relative border bg-gray-100 rounded-full flex-col w-full text-black gap-2 justify-center items-center px-2 z-[9999]'
      onSubmit={handleSubmit}
      ref={inputRef}>
      <div className='flex w-full gap-2 mr-2 justify-center items-center px-2 bg-gray-100 rounded-full'>
        <input 
          type="text" 
          className='w-full placeholder:text-gray-500 rounded-full bg-gray-100 outline-none px-3 py-1'
          placeholder='Buscar'
          value={keyword}
          onChange={handleChange}
          onFocus={handleFocusMenu}/>
      </div>
      {searchMenu !== false && keyword !== '' && <SearchResults keyword={keyword} />}
    </form>
  )
}

function SearchResults({ keyword }) {
  const [products, setProducts] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    (async function () {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        if (!response.ok) {
          throw new Error('Error al obtener productos');
        }
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } 
      catch (err) {
        console.log(err)
      }
    })()
  }, [])

  if(loading){
    return(
      <section className='flex flex-col absolute top-10 gap-2 w-full max-h-[500px] bg-white border-2 rounded-lg z-[9999] overflow-y-auto p-3 h-[500px]'>
        <div>Loading...</div>
      </section>
    )
  }

  const maxNameLength = 50
  const formattedPrice = (price) => parseFloat(price).toLocaleString(undefined)

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(keyword.toLowerCase()) ||
    product.sub_category.toLowerCase().includes(keyword.toLowerCase())
  )
  return (
    <section className={`flex flex-col absolute top-10 gap-2 w-full max-h-[500px] bg-white border-2 rounded-lg z-[9999] overflow-y-auto p-3 ${filteredProducts.length === 0 ? 'h-14' : 'h-[500px]'}`}>
    {filteredProducts.length === 0 
    ? (
      <div>
        <p className='font-bold text-lg'>
          No se encontraron resultados...
        </p>
      </div>
    ) 
    : (
      filteredProducts.map((product) => (
        <NavLink 
          to={`/products/?product=${product.sku}`}
          key={product.id} 
          className="flex box-border items-center justify-between bg-white p-1 hover:border-[#333] duration-500 border-2 rounded-xl hover:cursor-pointer z-[99999] w-full min-h-[150px] max-h-[150px] drop-shadow-lg">
          <header className="w-[50%] h-full box-border">
            <img 
              src={product.img_url} 
              loading="eager"
              alt={product.name}
              onError={(e) => e.target.src = 'page-icon.jpeg'}
              className="w-full h-full object-contain" 
            />
          </header>

          <article className="w-[50%] h-full box-border flex flex-col justify-between">
            <p className='text-sm'>
              {product.name.length > maxNameLength ? `${product.name.substring(0, maxNameLength)}...`: product.name}
            </p>
            <p className="font-bold">${formattedPrice(product.price)}</p>
          </article>
        </NavLink>
      ))
    )}
    </section>
  )
}