import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from "react"
import ProductCard from "../Components/ProductCard"

export default function ArticleEditor() {
  const [products, setProducts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [startIndex, setStartIndex] = useState(0)
  const [keyword, setKeyword] = useState('')
  
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const handleChange = (e) => setKeyword(e.target.value)

  useEffect(() => {
    (async function () {
      try {
        const response = await fetch('https://technologyline.com.ar/api/products?all=true');
        if (!response.ok) { throw new Error('Error al obtener productos') }
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } 
      catch (err) {
        console.log(err)
      }
    })()
  }, [])

  if(loading) {
    return <div className="z-10 text-3xl">Loading...</div>
  }
  
  const filteredProducts = products.filter((product) =>
    (product.name && product.name.toLowerCase().includes(keyword.toLowerCase())) ||
    (product.sku && product.sku.toLowerCase().includes(keyword.toLowerCase())) ||
    (product.sub_category && product.sub_category.toLowerCase().includes(keyword.toLowerCase())))

  return (
    <section className="flex flex-col justify-center items-center h-full min-h-[500px] w-3/4 z-10 pb-10">
      <article className="flex w-full flex-col gap-10 items-center">
        <div ref={inputRef} className='flex border bg-gray-100 rounded-full flex-col w-[500px] text-black gap-2 justify-center items-center px-2 z-[9999]'>
          <div className='flex w-full gap-2 mr-2 justify-center items-center px-2 bg-gray-100 rounded-full'>
            <input 
              type="text" 
              className='w-full placeholder:text-gray-500 rounded-full bg-gray-100 outline-none px-3 py-1'
              placeholder='Buscar por nombre, sub-categoria o sku'
              value={keyword}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full min-h-[400px]">
          {!keyword 
          ?
            products.slice(startIndex, startIndex + 10).map(product => (
              <ProductCard key={product.id} product={product}/>
            ))
          :
            filteredProducts.slice(startIndex, startIndex + 10).map(product => (
              <ProductCard key={product.id} product={product}/>
            ))
          }
        </div>

        <div className="flex justify-around w-full px-20">
          <button 
            className="text-4xl disabled:opacity-40 disabled:cursor-default"
            onClick={() => {
              setStartIndex(startIndex - 10)
              window.scrollTo(0, 0)
            }} 
            disabled={startIndex === 0}>
            ⬅️
          </button>
          <button 
            className="text-4xl disabled:opacity-40 disabled:cursor-default"
            onClick={() => {
              setStartIndex(Math.max(0, startIndex + 10))
              window.scrollTo(0, 0)
            }} 
            disabled={startIndex + 10 >= filteredProducts.length}>
            ➡️
          </button>
        </div>
      </article>
      
    </section>
  )
}