import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'

export default function Nav({ user }) {
  const path = useLocation().pathname
  const handleUpdateStock = () => {
    // Mostrar una alerta previa al usuario para confirmar la acción
    Swal.fire({
      title: 'Recuerda actualizar el excel de stock previo a este paso!',
      text: '¿Deseas continuar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Actualizando stock...',
          allowOutsideClick: false,  
          showConfirmButton: false, 
          willOpen: () => {
            Swal.showLoading()
          }
        })

        // fetch('http://localhost:8080/api/admin/jirejfdisbjfi4iwurjknvijioeb49/refresh-data')
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
  
  return(
    <section className="flex relative z-20 max-sm:flex-col items-center justify-between px-10 w-full h-[70px] max-sm:px-2 border-2 border-blue-400 bg-white border-dashed">
      <article>
        <NavLink
          to={'/'} 
          className={`${path === '/' ? 'isActive' : ''} p-2 rounded-xl font-semibold hover:bg-sky-300 duration-300`}>
          Indicadores
        </NavLink>
        
        <NavLink
          to={'/products'} 
          className={`${path === '/products' ? 'isActive' : ''} p-2 rounded-xl font-semibold hover:bg-sky-300 duration-300`}>
          Productos
        </NavLink>
      </article>

      <article className='min-w-[300px] flex gap-x-5 items-center'>
        <button 
          onClick={handleUpdateStock}
          className={`max-sm:absolute top-[75px] right-20 border-4 px-2 py-1 border-blue-400 border-dashed rounded-lg hover:bg-black hover:text-white duration-300 font-semibold z-10 bg-[#ebfafb]`}>
          Actualizar stock
        </button>

        <span className='text-xl'>
          Bienvenido <span className="text-blue-400 font-semibold">{user.slice(0,1).toUpperCase() + user.slice(1)}</span>
        </span>
      </article>
    </section>
  )
}