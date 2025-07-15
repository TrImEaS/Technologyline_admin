import { useEffect, useState } from "react";
import { NavLink, useLocation } from 'react-router-dom';
import { FaEnvelopeOpenText } from "react-icons/fa6";
import axios from "axios";
import Swal from 'sweetalert2';
import { usePage } from '../Context/PageContext.jsx'
const API_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_URL_PROD : import.meta.env.VITE_API_URL_DEV;

export default function Nav() {
  const path = useLocation().pathname;
  const [resellersData, setResellersData] = useState([]);
  const [iconView, setIconView] = useState(true);
  const { user } = usePage()

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
    } 
    else {
      getData();
      setIconView(true);
    }
  }, [path]);

  useEffect(() => {
    getData();

    const interval = setInterval(() => getData(), 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // const handleUpdateStock = () => {
  //   Swal.fire({
  //     title: 'Selecciona el archivo de stock',
  //     input: 'file',
  //     inputAttributes: { accept: '.xls,.xlsx' },
  //     showCancelButton: true,
  //     confirmButtonText: 'Actualizar Stock',
  //     cancelButtonText: 'Cancelar',
  //     preConfirm: (file) => {
  //       if (!file) {
  //         Swal.showValidationMessage('Debes seleccionar un archivo Excel');
  //         return false;
  //       }
  //       return file;
  //     }
  //   }).then((result) => {
  //     if (result.isConfirmed && result.value) {
  //       const formData = new FormData();
  //       formData.append('filename', 'products');
  //       formData.append('file', result.value);
  
        
  //       console.log("📂 Subiendo archivo de stock...", formData);
  //       Swal.fire({ title: 'Subiendo archivo...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  
  //       axios.post(`${API_URL}/api/page/uploadExcel`, formData, {
  //         headers: { 'Content-Type': 'multipart/form-data' } // Obligatorio para Multer
  //       })
  //       .then(response => {
  //         console.log("✅ Archivo subido:", response.data);
  
  //         Swal.fire({ title: 'Actualizando stock...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  
  //         return axios.get(`${API_URL}/api/admin/jirejfdisbjfi4iwurjknvijioeb49/refresh_data`);
  //       })
  //       .then(response => {
  //         Swal.fire({ icon: 'success', title: 'Stock actualizado correctamente', confirmButtonText: 'Aceptar' });
  //       })
  //       .catch(error => {
  //         console.error('❌ Error:', error);
  //         Swal.fire({ icon: 'error', title: 'Error al actualizar stock', text: '¡Inténtalo nuevamente!', confirmButtonText: 'Aceptar' });
  //       });
  //     }
  //   });
  // };
  
  // const handleUpdatePrices = () => {
  //   Swal.fire({
  //     title: 'Selecciona el archivo de precios)',
  //     input: 'file',
  //     inputAttributes: { accept: '.xls,.xlsx' },
  //     showCancelButton: true,
  //     confirmButtonText: 'Actualizar Precios',
  //     cancelButtonText: 'Cancelar',
  //     preConfirm: (file) => {
  //       if (!file) {
  //         Swal.showValidationMessage('Debes seleccionar un archivo Excel');
  //         return false;
  //       }
  //       return file;
  //     }
  //   }).then((result) => {
  //     if (result.isConfirmed && result.value) {
  //       const formData = new FormData();
  //       formData.append('filename', 'prices'); 
  //       formData.append('file', result.value);
    
  //       console.log("📂 Subiendo archivo de precios...", formData);
    
  //       Swal.fire({ title: 'Subiendo archivo...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
  //       axios.post(`${API_URL}/api/page/uploadExcel`, formData, {
  //         headers: { 'Content-Type': 'multipart/form-data' } // Obligatorio para Multer
  //       })
  //       .then(response => {
  //         console.log("✅ Archivo subido:", response.data);
    
  //         Swal.fire({ title: 'Actualizando precios...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
  //         return axios.get(`${API_URL}/api/admin/jirejfdisbjfi4iwurjknvijioeb49/refresh_prices`);
  //       })
  //       .then(response => {
  //         Swal.fire({ icon: 'success', title: 'Precios actualizados correctamente', confirmButtonText: 'Aceptar' });
  //       })
  //       .catch(error => {
  //         console.error('❌ Error:', error);
  //         Swal.fire({ icon: 'error', title: 'Error al actualizar precios', text: '¡Inténtalo nuevamente!', confirmButtonText: 'Aceptar' });
  //       });
  //     }
  //   });
  // };

  // const handleUpdateImages = () => {
  //   Swal.fire({
  //     title: 'Estas seguro que desea actualizar las imagenes?',
  //     showCancelButton: true,
  //     confirmButtonText: 'Actualizar Imagenes',
  //     cancelButtonText: 'Cancelar',
  //   })
  //   .then((result) => {
  //     if (result.isConfirmed && result.value) {
  //       Swal.fire({ title: 'Actualizando imagenes...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    
  //       axios.get(`${API_URL}/api/admin/jirejfdisbjfi4iwurjknvijioeb49/refresh_images`)
  //       .then(response => {
  //         Swal.fire({ icon: 'success', title: 'Precios actualizados correctamente', confirmButtonText: 'Aceptar' });
  //       })
  //       .catch(error => {
  //         console.error('❌ Error:', error);
  //         Swal.fire({ icon: 'error', title: 'Error al actualizar precios', text: '¡Inténtalo nuevamente!', confirmButtonText: 'Aceptar' });
  //       });
  //     }
  //   });
  // };
  
  const handleUpdateData = () => {
    Swal.fire({
      title: 'Selecciona el archivo de stock',
      input: 'file',
      inputAttributes: { accept: '.xls,.xlsx' },
      showCancelButton: true,
      confirmButtonText: 'Actualizar Stock',
      cancelButtonText: 'Cancelar',
      preConfirm: (file) => {
        if (!file) {
          Swal.showValidationMessage('Debes seleccionar un archivo Excel');
          return false;
        }
        return file;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const formData = new FormData();
        formData.append('filename', 'products');
        formData.append('file', result.value);
  
        
        console.log("📂 Subiendo archivo de stock...", formData);
        Swal.fire({ title: 'Subiendo archivo...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  
        axios.post(`${API_URL}/api/page/uploadExcel`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' } // Obligatorio para Multer
        })
        .then(response => {
          console.log("✅ Archivo subido:", response.data);
  
          Swal.fire({ title: 'Actualizando stock...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  
          return axios.get(`${API_URL}/api/admin/jirejfdisbjfi4iwurjknvijioeb49/refresh_data`);
        })
        .then(response => {
          Swal.fire({ icon: 'success', title: 'Stock actualizado correctamente', confirmButtonText: 'Aceptar' });
        })
        .catch(error => {
          console.error('❌ Error:', error);
          Swal.fire({ icon: 'error', title: 'Error al actualizar stock', text: '¡Inténtalo nuevamente!', confirmButtonText: 'Aceptar' });
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

        <NavLink
          to={'/admin/page/orders'} 
          className={`${path.includes('/admin/page/orders') ? 'isActive' : ''} p-2 rounded-xl font-semibold hover:bg-white hover:text-black duration-300`}>
          Pedidos
        </NavLink>
      </article>

      <article className='min-w-[300px] flex gap-x-5 items-center'>
        {/* <button 
          onClick={handleUpdateImages}
          className='btn'>
          Act. img. de productos
        </button> */}

        {/* <button 
          onClick={handleUpdatePrices}
          className='btn'>
          Actualizar stock
        </button> */}
        
        <span className='text-xl'>
          Bienvenido <span className="text-white font-bold">{user.slice(0, 1).toUpperCase() + user.slice(1)}</span>
        </span>

        <button 
          onClick={handleUpdateData}
          className='btn'>
          Actualizar pagina
        </button>

        <NavLink to='/admin/page/queries' title="Tiene consultas sin leer, click para ver" className="flex drop-shadow-xl flex-col relative cursor-pointer hover:scale-105 duration-500">
          <span data-text="2" className="absolute text-outline z-10 text-white font-bold text-2xl left-[-10px] top-[-10px]">{views.length}</span>
          <FaEnvelopeOpenText className="text-3xl text-white"/>
        </NavLink>
      </article>
    </section>
  );
}
