import * as XLSX from 'xlsx';
import { useState, useEffect } from "react"
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight, FaCrown, FaDotCircle, FaTrashAlt } from "react-icons/fa"
import Swal from "sweetalert2"
import axios from "axios"

const API_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_URL_PROD : import.meta.env.VITE_API_URL_DEV;


export default function Home() {
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [totalViews, setTotalViews] = useState(0)
  const [weekQueries, setWeekQueries] = useState(0)
  const [totalQueries, setTotalQueries] = useState(0)
  const startIndex = 0
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 13
  const date = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

  const getData = () => {
    fetch(`${API_URL}/api/products?all=true`)
      .then(response => response.json())
      .then(data => {
        const products = data.filter(p => p.week_views > 0).sort((a,b) => b.week_views - a.week_views).slice(0,10)
        const totalQueries = data.map(p => p.total_views).reduce((total, actual) => total + actual, 0)
        const weekQueries = data.map(p => p.week_views).reduce((total, actual) => total + actual, 0)

        setTopProducts(products)
        setWeekQueries(weekQueries)
        setTotalQueries(totalQueries)
      })
      .catch(e => console.error('Error loading products: ', e))

    fetch(`${API_URL}/api/clients`)
      .then(response => response.json())
      .then(data => setClients(data))
      .catch(e => console.error('Error loading client data: ', e))

    fetch(`${API_URL}/api/clients/getViews`)
    .then(response => response.json())
      .then(data => setTotalViews(data.views))
      .catch(e => console.error('Error loading page views: ', e))

    setLoading(false)
  } 

  useEffect(() => {
    getData()
    
    const interval = setInterval(() => {
      getData()
    }, 5 * 60 * 1000) 

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
    axios.delete(`${API_URL}/api/clients/deleteSubscriptor?id=${parseInt(id)}`)
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

  const exportToExcel = () => {
    const exportData = displayedArticles.map(data => ({
      'ID': data.id,
      'EMAIL': data.email,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `mails suscriptores (${date}).xlsx`);
  };
  
  if(loading)
    return <div className="text-2xl">Loading...</div>

  return (
    <section className="relative flex flex-col w-3/4 justify-center gap-5 min-h-[400px] py-10">
      <div className="flex w-full justify-center gap-5 max-lg:flex-col max-lg:items-center">
        <section className="px-5 flex flex-col items-center gap-y-6 py-6 min-h-[300px] min-w-[300px] w-[500px] max-lg:w-full rounded-xl z-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-md border-2 border-white/20 text-white shadow-lg transform transition-all duration-300">
          <h1 className="font-bold text-2xl text-white/90 max-sm:text-xl tracking-wide text-center">
            Metricas de Rendimiento
          </h1>

          <article className="w-full px-8 max-md:p-0 flex flex-col">
            <div className="grid grid-cols-2 gap-8 max-w-[100%] mx-auto max-md:grid-cols-1">
              <section className="flex flex-col gap-2">
                <p className="text-white/70 text-sm uppercase tracking-wider">Visitas Totales</p>
                <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  {totalViews.toLocaleString()}
                </p>
              </section>

              <section className="flex flex-col gap-2">
                <p className="text-white/70 text-sm uppercase tracking-wider">Consultas totales</p>
                <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  {totalQueries.toLocaleString()}
                </p>
              </section>

              {/* <section className="flex flex-col gap-2">
                <p className="text-white/70 text-sm uppercase tracking-wider whitespace-nowrap">Visitas Semanales</p>
                <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  {weekViews.toLocaleString()}
                </p>
              </section> */}

              <section className="flex flex-col gap-2">
                <p className="text-white/70 text-sm uppercase tracking-wider whitespace-nowrap">Consultas Semanales</p>
                <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  {weekQueries.toLocaleString()}
                </p>
              </section>
            </div>
          </article>
        </section>

        <section className="px-5 flex flex-col items-center gap-y-6 pt-6 min-h-[300px] h-fit min-w-[300px] w-full rounded-xl z-10 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 backdrop-blur-md border-2 border-white/20 text-white shadow-lg transform transition-all duration-300">
          <h1 className="font-bold text-2xl text-white/90 tracking-wide">Los Mas Buscados Semanal</h1> 
          <div className="flex flex-wrap gap-2 max-sm:w-full w-full justify-center items-center max-sm:px-2 px-8 pb-6">
            {topProducts.map((product, index) =>(
              <div key={product.id + index} className={`${index === 0 ? 'w-full pt-7' : 'w-[32.3%] max-sm:w-[80%]'} flex flex-col p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200`}>
                <div className="flex relative items-center gap-2 justify-center">
                  <span className="text-sm font-semibold text-emerald-400">#{index + 1}</span>
                  <p className="font-medium text-white/90">{product.sku}</p>
                  {index === 0 && <FaCrown className="-top-5 text-green-500 text-xl absolute"/>}
                </div>
                <p className="text-sm text-white/70 text-center">
                  <span className="font-medium">{product.week_views.toLocaleString()}</span> vistas
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      <div className="flex justify-center w-full">
        <section className="flex flex-col items-center justify-around gap-5 p-6 min-h-[460px] rounded-xl z-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-md border-2 border-white/20 text-white w-full shadow-lg">
          <div className="flex items-center justify-between w-full border-b border-white/20 pb-4 max-sm:flex-col max-sm:gap-5">
            <h1 className="font-bold text-2xl max-sm:text-xl text-white/90 tracking-wide">
              Emails Subscritos
            </h1>
            <div className="flex gap-3">
              <button onClick={()=> exportToExcel()} className='text-center font-medium bg-green-500 p-2 rounded-lg text-white hover:bg-green-500/70 duration-300'>
                Exportar mails
              </button>

              <button
                onClick={() => getAllMails(clients)}
                className="px-4 py-2 cursor-pointer font-medium max-sm:text-xs bg-white/10 hover:bg-white/20 text-white rounded-lg shadow-md transition-all duration-300 flex items-center gap-2"
              >
                Copiar todos
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full max-lg:grid-cols-1">
            {displayedArticles.reverse().slice(startIndex, startIndex + 10).map(client => (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200" key={client.id}>
                <FaDotCircle className="text-blue-400 text-sm"/>
                <span className="flex-1 text-white/90">{client.email}</span>
                <FaTrashAlt 
                  onClick={() => handleDeleteMail(client.id)} 
                  className="text-white/50 hover:text-red-400 transition-colors duration-300 cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 max-sm:gap-1 mt-4">
            <button
              onClick={() => setCurrentPage(1)}
              className="p-2 cursor-pointer bg-white/10 hover:bg-white/20 text-white rounded-lg shadow-md transition-all duration-300"
            >
              <FaAngleDoubleLeft className="text-xl" />
            </button>

            <button
              onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 cursor-pointer bg-white/10 hover:bg-white/20 text-white rounded-lg shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaAngleLeft className="text-xl" />
            </button>

            <span className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 cursor-pointer bg-white/10 hover:bg-white/20 text-white rounded-lg shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaAngleRight className="text-xl" />
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              className="p-2 cursor-pointer bg-white/10 hover:bg-white/20 text-white rounded-lg shadow-md transition-all duration-300"
            >
              <FaAngleDoubleRight className="text-xl" />
            </button>
          </div>
        </section>
      </div>
    </section>
  )
}