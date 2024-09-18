import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight, FaDotCircle, FaTrashAlt } from "react-icons/fa"
import axios from "axios"

export default function Home() {
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [totalViews, setTotalViews] = useState(0)
  const [totalQueries, setTotalQueries] = useState(0)
  const [startIndex, setStartIndex] = useState(0)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(13);

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

  const getAllMails = (arr = []) => {
    const newArray = arr.map(item => item.email).join(';')
    navigator.clipboard.writeText(`${newArray};`)
      .then(() => {
        Swal.fire({
          title: '¡Texto copiado al portapapeles!',
          icon: 'success',
          timer: 2000,
          timerProgressBar: 2000
        })
      })
      .catch(err => {
        console.error('Error al copiar al portapapeles: ', err);
        Swal.fire({
          title: 'Error al copiar al portapapeles',
          icon: 'error',
          timer: 2000,
          timerProgressBar: 2000
        })
      });
  }

  const handleDeleteMail = (id) => {
    axios.delete(`https://technologyline.com.ar/api/clients/deleteClient?id=${parseInt(id)}`)
      .then(res => {
        if (res.status >= 200 && res.status < 300) {
          Swal.fire({
            title: 'Mail borrado exitosamente!',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true
          });
          return getData()
        } 

        Swal.fire({
          title: 'Error al eliminar mail o ya ha sido eliminado.',
          icon: 'error',
          timer: 2000,
          timerProgressBar: true
        });
      })
      .catch(error => {
        Swal.fire({
          title: 'Error al eliminar mail, intente de nuevo!',
          icon: 'error',
          timer: 2000,
          timerProgressBar: true
        });
        console.error('Error deleting mail:', error);
      });
  }

  const totalPages = Math.ceil(clients.length / itemsPerPage);
  const displayedArticles = clients.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
          <h1 className="font-semibold text-xl text-[#fafafa] border-b-2">
            Emails subscriptos
          </h1>
          <div className="flex flex-wrap gap-y-5 pl-[100px] w-full h-full max-sm:grid-cols-1">
            {displayedArticles.reverse().slice(startIndex, startIndex + 10).map(client => (
              <span className="min-w-[300px] flex gap-1 items-center" key={client.id}>
                <FaDotCircle/>
                <span>{client.email}</span>
                <FaTrashAlt onClick={()=> handleDeleteMail(client.id)} className="hover:text-red-500 duration-300 cursor-pointer"/>
              </span>
            ))}
          </div>

          {/* Div Paginacion*/}
          <div className="flex gap-x-5 mt-5 w-full justify-center items-center">
            <div className="flex items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  className="px-4 py-2 cursor-pointer bg-white text-black rounded-lg shadow-md hover:scale-105 hover:bg-opacity-80 transition duration-300"
                >
                  <FaAngleDoubleLeft className="text-2xl" />
                </button>

                <button
                  onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 cursor-pointer bg-white text-black rounded-lg shadow-md hover:scale-105 hover:bg-opacity-80 transition duration-300"
                >
                  <FaAngleLeft className="text-2xl" />
                </button>
              </div>

              {/* Mostrar currentPage / totalPages */}
              <span className="px-4 bg-white text-black mx-1 py-[6px] rounded-lg text-xl font-semibold">{currentPage} / {totalPages}</span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 cursor-pointer py-2 bg-white text-black rounded-lg shadow-md hover:scale-105 hover:bg-opacity-80 transition duration-300"
                >
                  <FaAngleRight className="text-2xl" />
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-4 py-2 cursor-pointer bg-white text-black rounded-lg shadow-md hover:scale-105 hover:bg-opacity-80 transition duration-300"
                >
                  <FaAngleDoubleRight className="text-2xl" />
                </button>

                <button
                  onClick={() => getAllMails(clients)}
                  className="px-4 py-2 cursor-pointer font-bold bg-white text-black rounded-lg shadow-md hover:scale-105 hover:bg-opacity-80 transition duration-300"
                >
                  Copiar Mails
                </button>
              </div>
            </div>

            <div>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}