import { useEffect, useState } from "react";
import { NavLink, useLocation } from 'react-router-dom';
import { FaEnvelopeOpenText } from "react-icons/fa6";
import axios from "axios";
import Swal from 'sweetalert2';
import env from './env.json';

const API_URL = import.meta.env.MODE === 'production' ? env.API_URL_PROD : env.API_URL;

export default function Nav({ user }) {
  const path = useLocation().pathname;
  const [resellersData, setResellersData] = useState([]);
  const [iconView, setIconView] = useState(true);

  const getData = () => {
    axios.get(`${API_URL}/api/page/resellersData`)
      .then(res => {
        setResellersData(res.data);
      })
      .catch(e => {
        console.error('Error loading resellers form data: ', e);
      });
  };

  useEffect(() => {
    if (path === '/admin/page/queries') {
      getData();
      setIconView(false);
    } else {
      getData();
      setIconView(true);
    }
  }, [path]);

  useEffect(() => {
    getData();

    const interval = setInterval(() => {
      getData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // const handleUpdateStock = () => {
  //   Swal.fire({
  //     title: 'Selecciona el archivo Excel para actualizar el stock',
  //     input: 'file',
  //     inputAttributes: {
  //       accept: '.xlsx',
  //     },
  //     showCancelButton: true,
  //     confirmButtonText: 'Subir',
  //     cancelButtonText: 'Cancelar',
  //     inputValidator: (value) => {
  //       return !value && 'Necesitas seleccionar un archivo!';
  //     }
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       const file = result.value;
  //       const formData = new FormData();
  //       formData.append('file', file);

  //       Swal.fire({
  //         title: 'Actualizando stock...',
  //         allowOutsideClick: false,
  //         didOpen: () => {
  //           Swal.showLoading();
  //         }
  //       });

  //       fetch(`${API_URL}/api/products/jirejfdisbjfi4iwurjknvijioeb49/refresh-data`, {
  //         method: 'POST',
  //         body: formData
  //       })
  //       .then(response => {
  //         if (response.ok) {
  //           return response.json();
  //         } else {
  //           throw new Error('Error al actualizar el stock');
  //         }
  //       })
  //       .then(data => {
  //         Swal.fire({
  //           icon: 'success',
  //           title: 'DB actualizada correctamente',
  //           confirmButtonText: 'Aceptar'
  //         });
  //       })
  //       .catch(error => {
  //         console.error('Error al actualizar el stock:', error);
  //         Swal.fire({
  //           icon: 'error',
  //           title: 'Error al actualizar DB',
  //           text: '¡Inténtalo nuevamente!',
  //           confirmButtonText: 'Aceptar'
  //         });
  //       });
  //     }
  //   });
  // };

  const handleUpdateStock = () => {
    Swal.fire({
      title: '¿Estás seguro de que deseas actualizar el stock?',
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Actualizando stock...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
  
        // Make the fetch request without a file upload
        fetch(`${API_URL}/api/admin/jirejfdisbjfi4iwurjknvijioeb49/refresh-data`)
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Error al actualizar el stock');
          }
        })
        .then(data => {
          Swal.fire({
            icon: 'success',
            title: 'DB actualizada correctamente',
            confirmButtonText: 'Aceptar'
          });
        })
        .catch(error => {
          console.error('Error al actualizar el stock:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar DB',
            text: '¡Inténtalo nuevamente!',
            confirmButtonText: 'Aceptar'
          });
        });
      }
    });
  };
  
  const views = resellersData.filter(data => data.view === 0);

  return (
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

        <NavLink
          to={'/admin/page/banners'} 
          className={`${path.includes('/admin/page/banners') ? 'isActive' : ''} p-2 rounded-xl font-semibold hover:bg-white hover:text-black duration-300`}>
          Banners
        </NavLink>
      </article>

      <article className='min-w-[300px] flex gap-x-5 items-center'>
        <button 
          onClick={handleUpdateStock}
          className={`max-sm:absolute top-[75px] right-20 border-4 px-2 py-1 border-white rounded-lg text-white hover:scale-105 duration-300 font-semibold z-10 bg-black`}>
          Actualizar stock
        </button>

        <span className='text-xl'>
          Bienvenido <span className="text-white font-bold">{user.slice(0, 1).toUpperCase() + user.slice(1)}</span>
        </span>

        <NavLink to='/admin/page/queries' title="Tiene consultas sin leer, click para ver" className="flex drop-shadow-xl flex-col relative cursor-pointer hover:scale-105 duration-500">
          <span data-text="2" className="absolute text-outline z-10 text-white font-bold text-2xl left-[-10px] top-[-10px]">{views.length}</span>
          <FaEnvelopeOpenText className="text-5xl text-white"/>
        </NavLink>
      </article>
    </section>
  );
}
