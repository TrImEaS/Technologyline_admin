import { NavLink } from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";
import Spinner from "./Products/Spinner";

const API_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_URL_PROD : import.meta.env.VITE_API_URL_DEV;

export default function ProductCard({ product, loading }) {
  const [actualStatus, setActualStatus] = useState(product.adminStatus);
  const formattedPrice = product.price_list_1 
    ? `$${parseFloat(product.price_list_1).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '-----';
  
  const handleProductStatus = async (sku) => {
    try {
      Swal.fire({
        title: 'Modificando producto...',
        html: 'Por favor espera...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const response = await fetch(`${API_URL}/api/products?sku=${sku}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminStatus: !actualStatus })
      });

      if (!response.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Error al modificar producto!',
          text: 'Hubo un error al intentar modificar el producto.'
        });

        throw new Error('Error al editar producto');
      }

      setActualStatus(!actualStatus);
      Swal.fire({
        icon: 'success',
        title: 'Producto modificado correctamente!',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <section className="flex box-border items-center border-2 shadow-page-hover justify-center bg-white duration-300 text-gray-600 rounded-lg px-1 py-4 w-full h-[70px]">
      <article className="flex w-full h-full border-r border-gray-400 px-1">
        <header className="relative image-container w-[200px] h-full border-r border-gray-400 box-border">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner />
            </div>
          )}

          <img
            src={product.img_urls.length > 0 ? product.img_urls[0] : 'https://technologyline.com.ar/banners-images/Assets/page-icon.jpeg'}
            alt={product.name}
            className={`w-full h-full object-contain scale-150 rounded-lg`}
            onError={(e) => e.target.src = 'https://technologyline.com.ar/banners-images/Assets/page-icon.jpeg'}
          />
        </header>

        <div className="w-full text-sm h-full box-border flex items-center">
          <p className="min-w-[15%] gap-1 px-5 flex items-center justify-center h-full border-r border-gray-400">
            <span>SKU:</span> 
            <span>{product.sku}</span></p>
          <p className="w-full flex items-center justify-center h-full border-r border-gray-400 text-xs text-center">{product.name}</p>
          <p className="min-w-[15%] text-xs flex flex-col items-center justify-center h-full border-r border-gray-400 font-bold">
            <span>Precio Lista:</span>
            <span>{formattedPrice}</span>
          </p>
          <p className="min-w-[15%] gap-1 flex items-center justify-center h-full">
            <span>Stock:</span>  
            <span>{product.stock}</span>
          </p>
        </div>
      </article>

      <article className="min-w-[10%] pl-5 flex items-center h-full text-xs border-gray-400 px-1 font-bold">
        <ul className="flex flex-col gap-1">
          <NavLink
            className="text-blue-500 hover:text-cyan-400 duration-300 w-10"
            to={`/admin/page/products?product=${product.sku}`}
          >
            Editar
          </NavLink>

          <p onClick={() => handleProductStatus(product.sku)} className="flex relative items-center gap-x-1 cursor-pointer w-fit">
            <span className={`${actualStatus ? 'text-green-400' : 'text-red-500'}`}>{actualStatus ? 'Activo' : 'Desactivado'}</span>
          </p>

          <p className="flex flex-col">
            <span className={`${!actualStatus || !product.status ? 'text-red-500' : 'text-green-400'}`}>
              {
                !product.status 
                  ? 'Sin stock'
                  : 'En stock'
              }
            </span>
          </p>
        </ul>
      </article>
    </section>
  );
}
