import { useState, useEffect } from "react"
import Swal from 'sweetalert2'

export default function Home() {
  const [topProducts, setTopProducts] = useState()
  const [emails, setEmails] = useState()

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

  useEffect(() => {
    fetch('https://technologyline.com.ar/api/products')
    .then(response => response.json())
    .then(data => {
      const products = data.filter(product => product.total_views > 0)
      console.log(products)
    })
  },[])



  return (
    <div className="relative flex flex-wrap justify-center items-center gap-5">
      <section className="flex flex-col items-center gap-y-5 border-4 pt-4 border-blue-400 border-dashed w-[300px] h-[230px] rounded-lg z-10 bg-[#ebfafb]">
        <h1 className="font-bold text-gray-500">
          Performance
        </h1>
        <div className="flex flex-col gap-3">
          <p><span className="font-bold">Visitas:</span> {11}</p>
          <p><span className="font-bold">Consultas Recibidas</span> {13}</p>
        </div>
      </section>

      <section className="flex flex-col items-center gap-y-5 border-4 pt-4 border-blue-400 border-dashed w-[300px] h-[230px] rounded-lg z-10 bg-[#ebfafb]">
        <h1 className="font-bold text-gray-500">TOP mas consultados:</h1> 
        <p><span className="font-bold">TOP 1:</span> {'CALE100'}</p>
        <p><span className="font-bold">TOP 2:</span> {'CALE200'}</p>
        <p><span className="font-bold">TOP 3:</span> {'CALE300'}</p>
      </section>

      <section className="flex items-center justify-center w-full">
        <button 
          onClick={handleUpdateStock}
          className='border-4 border-blue-400 border-dashed rounded-lg px-3 py-2 hover:bg-black hover:text-white duration-300 font-bold z-10 bg-[#ebfafb]'>
          Actualizar stock
        </button>
      </section>
    </div>
  )
}