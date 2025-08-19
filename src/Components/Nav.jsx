import { useEffect, useState } from "react";
import { NavLink, useLocation } from 'react-router-dom';
import { FaEnvelopeOpenText, FaChevronDown, FaPlus, FaList, FaSitemap, FaTags } from "react-icons/fa6";
import axios from "axios";
import Swal from 'sweetalert2';
import { usePage } from '../Context/PageContext.jsx'
const API_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_URL_PROD : import.meta.env.VITE_API_URL_DEV;

export default function Nav() {
  const path = useLocation().pathname;
  const [resellersData, setResellersData] = useState([]);
  const [iconView, setIconView] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  const handleUpdateData = () => {
    Swal.fire({
      title: 'Selecciona el archivo de stock',
      input: 'file',
      inputAttributes: { accept: '.xls,.xlsx,.xlsm' },
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
      <article className="flex gap-4 items-center">
        <NavLink
          to={'/admin/page/'} 
          className={`${path === '/admin/page/' ? 'isActive' : ''} p-2 rounded-xl font-semibold hover:bg-white hover:text-black duration-300`}>
          Indicadores
        </NavLink>  

        <NavLink
          to={'/admin/page/orders'} 
          className={`${path.includes('/admin/page/orders') ? 'isActive' : ''} p-2 rounded-xl font-semibold hover:bg-white hover:text-black duration-300`}>
          Pedidos
        </NavLink>

        <NavLink
          to={'/admin/page/article_editor'} 
          className={`${path.includes('/admin/page/article_editor') ? 'isActive' : ''} p-2 rounded-xl font-semibold hover:bg-white hover:text-black duration-300`}>
          Productos
        </NavLink>

        <div className="relative">
          <button
            type="button"
            className="p-2 rounded-xl font-semibold flex items-center gap-2 bg-white text-black hover:bg-gray-200 duration-300 border border-gray-300"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <FaChevronDown /> Gestión
          </button>
          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white text-black rounded-xl shadow-lg z-50 flex flex-col border border-gray-300">
              <NavLink to={'/admin/page/manage/add_product'} className="p-3 flex items-center gap-2 hover:bg-blue-100 duration-200" onClick={() => setDropdownOpen(false)}><FaPlus /> Agregar Producto</NavLink>
              <NavLink to={'/admin/page/manage/categories'} className="p-3 flex items-center gap-2 hover:bg-blue-100 duration-200" onClick={() => setDropdownOpen(false)}><FaList /> Crear Categoría</NavLink>
              <NavLink to={'/admin/page/manage/subcategories'} className="p-3 flex items-center gap-2 hover:bg-blue-100 duration-200" onClick={() => setDropdownOpen(false)}><FaSitemap /> Crear Subcategoría</NavLink>
              <NavLink to={'/admin/page/manage/brands'} className="p-3 flex items-center gap-2 hover:bg-blue-100 duration-200" onClick={() => setDropdownOpen(false)}><FaTags /> Crear Marca</NavLink>
              <NavLink to={'/admin/page/manage/banners'} className="p-3 flex items-center gap-2 hover:bg-blue-100 duration-200" onClick={() => setDropdownOpen(false)}><FaPlus /> Banners</NavLink>
              <NavLink to={'/admin/page/manage/categories_carousel'} className="p-3 flex items-center gap-2 hover:bg-blue-100 duration-200" onClick={() => setDropdownOpen(false)}><FaList /> Carousel de categorias</NavLink>
              <NavLink to={'/admin/page/manage/brands_carousel'} className="p-3 flex items-center gap-2 hover:bg-blue-100 duration-200" onClick={() => setDropdownOpen(false)}><FaTags /> Carousel de marcas</NavLink>
            </div>
          )}
        </div>
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
