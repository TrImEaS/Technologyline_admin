import { useState, useEffect } from "react"

export default function Home() {
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [totalViews, setTotalViews] = useState(0)
  const [totalQueries, setTotalQueries] = useState(0)
  const [startIndex, setStartIndex] = useState(0)

  const getData = () => {
    // fetch('http://localhost:8080/api/products?all=true')
    fetch('https://technologyline.com.ar/api/products?all=true')
    .then(response => response.json())
    .then(data => {
      const products = data.filter(product => product.total_views > 0)
      const totalQueries = data.map(product => product.total_views)
      products.sort((a,b) => b.total_views - a.total_views)
      setTopProducts(products)
      setTotalQueries(totalQueries.reduce((total, actual) => total + actual, 0))
    })
    .catch(e =>{
      console.error('Error loading products: ', e)
    })

    // fetch('http://localhost:8080/api/clients')
    fetch('https://technologyline.com.ar/api/clients')
    .then(response => response.json())
    .then(data => {
      setClients(data)
    })
    .catch(e =>{
      console.error('Error loading client data: ', e)
    })

    // fetch('http://localhost:8080/api/clients/getViews')
    fetch('https://technologyline.com.ar/api/clients/getViews')
    .then(response => response.json())
    .then(data => {
      setTotalViews(data.views)
    })
    .catch(e =>{
      console.error('Error loading page views: ', e)
    })

    setLoading(false)
  } 

  useEffect(() => {
    getData()
    
    const interval = setInterval(() => {
      getData()
    }, 5 * 60 * 1000) // Min * sec * ms

    return () => clearInterval(interval);
  },[])

  return (
    loading 
    ? 
    <div className="text-2xl">Loading...</div>
    :
    <section className="relative flex flex-col w-3/4 justify-center gap-5 min-h-[400px] py-10">
      <div className="flex w-full justify-center gap-x-10">
        <section className="flex flex-col items-center gap-y-5 pt-4 max-w-[350px] min-h-[300px] min-w-[260px] rounded-lg z-10 bg-white/10 backdrop-blur-md brightness-125 border-2 text-white">
          <h1 className="font-semibold text-xl text-[#fafafa]">
            Performance
          </h1>
          <div className="flex flex-col gap-3">
            <p><span className="font-bold">Visitas:</span> {totalViews}</p>
            <p><span className="font-bold">Consultas totales</span> {totalQueries}</p>
          </div>
        </section>

        <section className="flex flex-col items-center gap-y-5 pt-4 min-h-[300px] h-fit min-w-[260px] py-7 rounded-lg z-10 bg-white/10 backdrop-blur-md brightness-125 border-2 text-white">
          <h1 className="font-semibold text-xl text-[#fafafa]">TOP mas consultados:</h1> 
          <div className="flex flex-col gap-y-5">
            {topProducts.slice(0,5).map((product, index) =>(
              <div key={product.id} className="flex flex-col">
                <p className="font-bold">
                  TOP {index + 1}: <span className="font-normal">{product.sku}</span>
                </p>
                <p className="font-semibold">
                  Consultas: <span className="font-normal">{product.total_views}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      <div className="flex justify-center w-full">
        <section className="flex flex-col items-center justify-around gap-5 p-4 min-h-[460px] max-h-[400px] rounded-lg z-10 bg-white/10 backdrop-blur-md brightness-125 border-2 text-white w-full">
          <h1 className="font-semibold text-xl text-[#fafafa]">
            Emails subscriptos
          </h1>
          <div className="grid grid-rows-6 grid-cols-2 gap-y-5 place-items-center w-full h-full max-sm:grid-cols-1">
            {clients.reverse().slice(startIndex, startIndex + 10).map(client => (
              <span className="min-w-[300px]" key={client.id}>
                💠{client.email}
              </span>
            ))}
          </div>
          <div className="flex justify-between w-1/2">
            <button 
              className="text-4xl disabled:opacity-40 disabled:cursor-default"
              onClick={() => setStartIndex(startIndex - 10)} 
              disabled={startIndex === 0}>
              ⬅️
            </button>
            <button 
              className="text-4xl disabled:opacity-40 disabled:cursor-default"
              onClick={() => setStartIndex(Math.max(0, startIndex + 10))} 
              disabled={startIndex + 10 >= clients.length}>
              ➡️
            </button>
          </div>
        </section>
      </div>
    </section>
  )
}