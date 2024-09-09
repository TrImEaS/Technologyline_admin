import { useEffect, useState } from "react"
import { NavLink, useLocation } from 'react-router-dom'
import { FaEnvelopeOpenText } from "react-icons/fa6"
import axios from "axios"
import Swal from 'sweetalert2'

export default function Nav({ user }) {
  const path = useLocation().pathname
  const [resellersData, setResellersData] = useState([])
  const [iconView, setIconView] = useState(true)

  const getData = ()=> {
    axios.get('https://technologyline.com.ar/api/page/resellersData')
    .then(res => {
      setResellersData(res.data)
    })
    .catch(e =>{
      console.error('Error loading resellers form data: ', e)
    })
  }

  useEffect(()=> {
    if(path === '/admin/page/queries') {
      getData()
      setIconView(false)
    }
    else {
      getData()
      setIconView(true)
    }
  },[path])

  useEffect(()=> {
    getData()
    
    const interval = setInterval(() => {
      getData()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval);
  },[])


  const handleUpdateStock = () => {
    // Mostrar una alerta previa al usuario para confirmar la acción
    Swal.fire({
      title: 'Recuerda actualizar el excel de stock previo a este paso!',
      text: '¿Deseas continuar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar'
    })
    .then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Actualizando stock...',
          allowOutsideClick: false,  
          showConfirmButton: false, 
          willOpen: () => {
            Swal.showLoading()
          }
        })

        fetch('https://technologyline.com.ar/api/admin/jirejfdisbjfi4iwurjknvijioeb49/refresh-data')
          .then(response => {
            if(response.status === 200) {
              Swal.fire({
                icon: 'success',
                title: 'Stock actualizado con éxito',
                timer: 2000,
                timerProgressBar: true,
              })
            }
            else {
              Swal.fire({
                icon: 'error',
                title: 'Ocurrió un error al actualizar el stock, ¡inténtelo nuevamente!',
                timer: 3000,
                timerProgressBar: true
              })
            }
          })
          .catch(error => {
            console.error('Error al actualizar el stock:', error)
            Swal.fire({
              icon: 'error',
              title: 'Ocurrió un error al actualizar el stock, ¡inténtelo nuevamente!',
              timer: 3000,
              timerProgressBar: true
            })
          })
      }
    })
  }

  const views = resellersData.filter(data => data.view === 0)
  
  return(
    <section className="flex z-50 max-sm:flex-col text-white border-b border-[#fafafa] border-opacity-40 relative items-center justify-between px-10 w-full h-[70px] max-sm:px-2">
      <article>
        <NavLink
          to={'/admin/page/'} 
          className={`${path === '/admin/page/' ? 'isActive' : ''} p-2 rounded-xl font-semibold hover:bg-white hover:text-black duration-300`}>
          Indicadores
        </NavLink>
        
        <NavLink
          to={'/admin/page/article_editor'} 
          className={`${path.includes('/admin/page/article_editor') ? 'isActive' : ''} p-2 rounded-xl font-semibold hover:bg-white hover:text-black duration-300`}>
          Productos
        </NavLink>
      </article>

      <article className='min-w-[300px] flex gap-x-5 items-center'>
        <button 
          onClick={handleUpdateStock}
          className={`max-sm:absolute top-[75px] right-20 border-4 px-2 py-1 border-white rounded-lg text-white hover:scale-105 duration-300 font-semibold z-10 bg-black`}>
          Actualizar stock
        </button>

        <span className='text-xl'>
          Bienvenido <span className="text-white font-bold">{user.slice(0,1).toUpperCase() + user.slice(1)}</span>
        </span>
       
        <NavLink to='/admin/page/queries' title="Tiene consultas sin leer, click para ver" className="flex drop-shadow-xl flex-col relative cursor-pointer hover:scale-105 duration-500">
          <span data-text="2" className="absolute text-outline z-10 text-white font-bold text-2xl left-[-10px] top-[-10px]">{views.length}</span>
          <FaEnvelopeOpenText className="text-5xl text-white"/>
        </NavLink>
      </article>
    </section>
  )
}