import { useEffect, useState, useRef } from "react"
import ProductCard from "../Components/ProductCard"

export default function ArticleEditor() {
  const [products, setProducts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [startIndex, setStartIndex] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [filter, setFilter] = useState(false)
  
  const inputRef = useRef(null)
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
    return <div className="z-10 text-3xl min-h-screen text-white py-[150px]">Loading...</div>
  }
  
  const filteredProducts = products.filter((product) => 
    (product.name && product.name.toLowerCase().includes(keyword.toLowerCase())) ||
    (product.sku && product.sku.toLowerCase().includes(keyword.toLowerCase())) ||
    (product.sub_category && product.sub_category.toLowerCase().includes(keyword.toLowerCase()))
  );

  const getFilteredProducts = () => {
    if (!filter) {
      return filteredProducts;
    } 
    return filteredProducts.filter(product => product.status === true);
  }

  const displayedProducts = getFilteredProducts().slice(startIndex, startIndex + 10);

  return (
    <section className="flex flex-col justify-center items-center h-full min-h-[500px] w-3/4 z-10 py-5">
      <article className="flex w-full flex-col gap-10 items-center">
        <div className='flex gap-5 justify-center items-center'>
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

          <div className='flex gap-x-2 items-center justify-center'>
            <span 
              className={`${!filter ? 'text-black' : 'text-gray-300 border-gray-50'} font-bold bg-[#fafafa] rounded-lg flex items-center text-sm justify-center w-full h-14 cursor-pointer hover:outline-dashed hover:text-black hover:border-black duration-100 border-2 border-black`}
              onClick={() => 
              {
                setFilter(false)
                setStartIndex(0)
              }}>
              Todo
            </span>

            <span>|</span>

            <span 
              className={`${filter ? 'text-black' : 'text-gray-300 border-gray-50'} font-bold bg-[#fafafa] rounded-lg flex items-center text-sm justify-center w-full h-14 cursor-pointer hover:outline-dashed hover:text-black hover:border-black duration-100 border-2 border-black`}
              onClick={() => 
              {
                setFilter(true)
                setStartIndex(0)
              }}>
              Solo con stock
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full min-h-[400px]">
          {displayedProducts.map(product => (
            <ProductCard key={product.id} product={product}/>
          ))}
        </div>

        <div className="flex justify-around w-full px-20">
          <section className="flex justify-center items-center">
            <button 
              className="text-4xl disabled:opacity-40 disabled:cursor-default"
              onClick={() => 
              {
                setStartIndex(0)
                window.scrollTo(0, 0)
              }} 
              disabled={startIndex === 0}>
              ⏪
            </button>
            <button 
              className="text-4xl disabled:opacity-40 disabled:cursor-default"
              onClick={() => 
              {
                setStartIndex(startIndex - 10)
                window.scrollTo(0, 0)
              }} 
              disabled={startIndex === 0}>
              ⬅️
            </button>
          </section>

          <section className="flex gap-x-5 justify-center items-center">
            <span 
              className={`${startIndex === 0 ? 'w-1' : 'bg-gray-300'} border w-10 h-10 flex items-center justify-center cursor-pointer`}
              onClick={() => 
              {
                setStartIndex(0)
                window.scrollTo(0, 0)
              }}>
              {parseInt((startIndex/10) + 1) === 1 ? '' : 1}
            </span>

            <span className='bg-gray-400 border w-10 h-10 flex items-center justify-center'
            >
              { parseInt((startIndex/10) + 1) }
            </span>

            <span 
              className={`${(startIndex/10) + 1 === ((Math.max(0, getFilteredProducts().length - 10))/10) + 1 ? 'w-1' : 'bg-gray-300'} border w-10 h-10 flex items-center justify-center cursor-pointer`}
              onClick={() => 
              {
                setStartIndex(Math.max(0, getFilteredProducts().length - 10))
                window.scrollTo(0, 0)
              }}>
              {(startIndex/10) + 1 === ((Math.max(0, getFilteredProducts().length - 10))/10 + 1) ? '' : parseInt((Math.max(0, getFilteredProducts().length - 10))/10 + 1)}
            </span>
          </section>

          <section className="flex justify-center items-center">
            <button 
              className="text-4xl disabled:opacity-40 disabled:cursor-default"
              onClick={() => 
              {
                setStartIndex(Math.max(0, startIndex + 10))
                window.scrollTo(0, 0)
              }} 
              disabled={startIndex + 10 >= getFilteredProducts().length}>
              ➡️
            </button>  

            <button 
              className="text-4xl disabled:opacity-40 disabled:cursor-default"
              onClick={() => 
              {
                setStartIndex(Math.max(0, getFilteredProducts().length - 10))
                window.scrollTo(0, 0)
              }} 
              disabled={startIndex + 10 >= getFilteredProducts().length}>
              ⏩
            </button>
          </section>
        </div>
      </article>
      
    </section>
  )
}