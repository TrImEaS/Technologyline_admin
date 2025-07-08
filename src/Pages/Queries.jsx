import axios from "axios"
import { useEffect, useState } from "react"
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight, FaStar, FaTimes } from "react-icons/fa"

const API_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_URL_PROD : import.meta.env.VITE_API_URL_DEV;

export default function Queries() {
  const [resellersData, setResellersData] = useState([])
  const [selectedMail, setSelectedMail] = useState(null)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(13);

  const getResellersData = () => {
    axios.get(`${API_URL}/api/page/resellersData`)
    .then(res => {
      const mapped = res.data.map(data => {
        return {
          id: parseInt(data.id) || 0,
          fullname: data.fullname || 'No tiene',
          email: data.email || 'No tiene',
          comentary: data.comentary || 'No tiene',
          phone: data.phone || 'No tiene',
          date: data.created_at || 'No tiene',
          view: data.view || 0,
        };
      }).sort((a,b) => b.id - a.id);
      setResellersData(mapped);
    })
    .catch(e =>{
      console.error('Error loading resellers form data: ', e)
    })
  }

  useEffect(()=> {
    getResellersData()
    
    const interval = setInterval(() => {
      getResellersData()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval);
  },[])

  const handleSelectedMail = (mail) => {
    axios.patch(`${API_URL}/api/page/check-view/${mail.id}`)
      .then(res => console.log(res.data.success))
      .catch(e => console.error(e))
    setResellersData(prev => prev.map(item => 
      item.id === mail.id ? { ...item, view: 1 } : item
    ));
    setSelectedMail(mail)
  }

  const totalPages = Math.ceil(resellersData.length / itemsPerPage);
  const displayedArticles = resellersData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col justify-center items-center w-full h-full">
      <div className="flex flex-col text-black w-4/5 gap-y-[1px] mt-5 min-h-[400px] rounded-lg border border-gray-300">
        <section className="flex w-full text-black bg-white/90 p-1 rounded-t-lg">
          <header className="flex gap-3 pl-4 items-center w-full border-dashed border-r border-gray-300">
            Nombre
          </header>

          <article className="flex items-center pl-4 w-full border-dashed border-r border-gray-300">
            Email
          </article>

          <article className="flex items-center pl-4 w-[350px]">
            Fecha
          </article>
        </section>
        
        {displayedArticles && displayedArticles.map((data, index) => (
          <section 
            tabIndex={0} 
            key={index} 
            onDoubleClick={()=> handleSelectedMail(data)}
            className="flex focus:bg-blue-400 cursor-pointer w-full select-none text-white bg-white/20 p-1 first:rounded-t-lg last:rounded-b-lg">
            <header className="flex gap-3 pl-4 items-center w-full border-dashed border-r border-gray-300">
              <FaStar className={`${data.view === 0 && 'text-yellow-400' } mb-[1px] font-bold text-xl`}/>
              <span className="text-sm">{data.fullname}</span>
            </header>
   
            <article className="flex items-center pl-4 text-sm w-full border-dashed border-r border-gray-300">
              {data.email}
            </article>

            <article className="flex items-center text-sm px-2 w-[350px]">
              {`${data.date.slice(11,16)}hs ${data.date.slice(8,10)}/${data.date.slice(5,7)}/${data.date.slice(2,4)}`}
            </article>
          </section>
        ))}

        {selectedMail && 
          <section className="bg-black/90 text-white p-4 z-30 rounded-lg flex flex-col w-3/4 h-[500px] absolute top-[10%] left-[12.5%]">
            <header className="flex flex-col gap-1 relative w-full border-b-2 pb-3">
              <div className="flex">
                <span className="min-w-[350px]"><b>Nombre: </b>{selectedMail.fullname}</span>
                <span className=""><b>Email: </b>{selectedMail.email}</span>
              </div>

              <div className="flex">
                <span className="min-w-[350px]"><b>Telefono: </b>{selectedMail.phone}</span>
                <span className="">
                  <b>Fecha: </b>
                  {`${selectedMail.date.slice(11,16)}hs (${selectedMail.date.slice(8,10)}/${selectedMail.date.slice(5,7)}/${selectedMail.date.slice(2,4)})`}
                </span>
              </div>

              <FaTimes onClick={()=> setSelectedMail(null)} className="cursor-pointer hover:scale-110 duration-300 font-bold absolute right-3 text-xl"/>
            </header>

            <main className="w-full h-full p-2">
              <p className="text-pretty">{selectedMail.comentary}</p>
            </main>
          </section>
        }
      </div>

      {/* Div Paginacion*/}
      <div className="flex gap-x-5 mt-5 w-full justify-center items-center">
        <div className="flex items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              className="px-4 py-2 cursor-pointer bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300"
            >
              <FaAngleDoubleLeft className="text-2xl" />
            </button>

            <button
              onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 cursor-pointer bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
            >
              <FaAngleLeft className="text-2xl" />
            </button>
          </div>

          {/* Mostrar currentPage / totalPages */}
          <span className="px-4 bg-blue-500 mx-1 text-white py-[6px] rounded-lg text-xl font-semibold">{currentPage} / {totalPages}</span>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 cursor-pointer py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
            >
              <FaAngleRight className="text-2xl" />
            </button>

            <button
              onClick={() => setCurrentPage(totalPages)}
              className="px-4 py-2 cursor-pointer bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300"
            >
              <FaAngleDoubleRight className="text-2xl" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}