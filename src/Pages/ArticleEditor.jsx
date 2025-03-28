import * as XLSX from 'xlsx';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProducts } from '../Context/ProductsContext';
import ProductCard from '../Components/ProductCard';

export default function ArticleEditor() {
  const { products, loading } = useProducts()
  const [startIndex, setStartIndex] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState(false);
  const [productsPerPage, setProductsPerPage] = useState(10);
  const maxPageButtons = 3;
  const location = useLocation();
  const navigate = useNavigate(); 

  useEffect(() => {
    const handleResize = () => {  
      const screenWidth = window.innerWidth;
      
      if (screenWidth >= 2100) { setProductsPerPage(15) } 
      else if (screenWidth >= 1680) { setProductsPerPage(12) }
      else { setProductsPerPage(10) }   
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const page = parseInt(queryParams.get('page')) || 1;
    const onlyStock = queryParams.get('onlystock') === 'true';

    setStartIndex((page - 1) * productsPerPage);
    setFilter(onlyStock);
  }, [location.search, productsPerPage]);

  const filteredProducts = products.filter((product) => 
    (product.name && product.name.toLowerCase().includes(keyword.toLowerCase())) ||
    (product.sku && product.sku.toLowerCase().includes(keyword.toLowerCase())) ||
    (product.sub_category && product.sub_category.toLowerCase().includes(keyword.toLowerCase()))
  );

  const getFilteredProducts = () => {
    if (!filter) {
      return filteredProducts;
    }

    // console.log(filteredProducts)
    return filteredProducts.filter(product => product.stock > 0 && !product.name.includes('prueba'));
  };

  const totalProducts = getFilteredProducts().length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const handlePageChange = (page) => {
    const newIndex = (page - 1) * productsPerPage;
    setStartIndex(newIndex);
    navigate(`?page=${page}&onlystock=${filter}`);
    window.scrollTo(0, 0);
  };

  const getPagesToShow = () => {
    const pages = [];
    const currentPage = Math.floor(startIndex / productsPerPage) + 1;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = startPage + maxPageButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    // Añadir la primera página si no está en el rango de páginas
    if (startPage > 1) {
      pages.push(1);
    }

    // Añadir puntos suspensivos si es necesario
    if (startPage > 2) {
      pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Añadir puntos suspensivos si hay más páginas después del rango visible
    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    // Añadir la última página si no está en el rango de páginas
    if (endPage < totalPages) {
      pages.push(totalPages);
    }

    return pages;
  };

  if (loading) {
    return <div className="z-10 text-3xl min-h-screen text-white py-[150px]">Loading...</div>;
  }
  
  const displayedProducts = getFilteredProducts().slice(startIndex, startIndex + productsPerPage);

  const exportToExcel = () => {
    const data = displayedProducts.map(p => ({
      'SKU': p.sku,
      'Nombre': p.name,
      'Precio lista': p.price_list_1,
      'Stock': p.stock,
      'categoría': p.category,
      'Sub-categoría': p.sub_category,
      'Marca': p.brand,
      'Imagen': p.img_url
    }))

    const date = new Date().getDate() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getFullYear();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `lista_productos_${date}.xlsx`);
  }

  return (
    <section className="flex flex-col justify-center items-center h-full min-h-[500px] w-[80%] z-10 py-5">
      <article className="flex w-full flex-col gap-5 relative items-center">
        <div className='flex gap-5 justify-center items-center'>
          <div className='flex border bg-gray-100 rounded-full flex-col w-[500px] text-black gap-2 justify-center items-center px-2 z-[9999]'>
            <div className='flex w-full gap-2 mr-2 justify-center items-center px-2 bg-gray-100 rounded-full'>
              <input 
                type="text" 
                className='w-full placeholder:text-gray-500 rounded-full bg-gray-100 outline-none px-3 py-1'
                placeholder='Buscar por nombre, sub-categoria o sku'
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>

          <div className='flex gap-x-2 items-center justify-center'>
            <span 
              className={`${!filter ? 'text-gray-500 bg-opacity-60 border-transparent' : 'text-opacity-100 border-white shadow-white shadow-sm text-white bg-opacity-0'} hover:bg-opacity-100 font-bold bg-white tracking-tighter text-center rounded-lg flex items-center text-sm justify-center h-9 px-2 cursor-pointer duration-300 border-2 border-black`}
              onClick={() => 
              {
                setFilter(!filter);
                setStartIndex(0);
                navigate(`?page=1&onlystock=${!filter}`);
              }}>
              Solo con stock
            </span>

            <button onClick={exportToExcel} className='btn absolute right-0 top-0'>
              Exportar a excel
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 w-full min-h-[400px]">
          {displayedProducts.map(product => (
            <ProductCard 
              key={product.id + product.name} 
              product={product}
              loading={loading} 
            />
          ))}
        </div>

        <div className="flex w-full justify-between items-center">
          <div className='flex justify-center gap-2 pl-[20%] items-center flex-1'>
            {getPagesToShow().map((page, index) => (
              <span
                key={page === '...' ? `ellipsis-${index}` : page} // Clave única para los puntos suspensivos
                className={`cursor-pointer p-2 w-9 h-9 text-center flex justify-center items-center border rounded-lg
                  ${typeof page === 'number' && (Math.floor(startIndex / productsPerPage) + 1) === page ? 'bg-white text-black' : 'text-white' }`}
                onClick={() => {
                  if (page !== '...') handlePageChange(page);
                }}
              >
                {page}
              </span>
            ))}
          </div>


          <div className='flex flex-0 gap-2 justify-center items-center'>
            {[10, 25, 50, 100, 500].map((value) => (
              <span
                key={value}
                className={`cursor-pointer p-2 w-9 h-9 text-center flex justify-center items-center border rounded-lg
                  ${productsPerPage === value ? 'bg-white text-black' : 'text-white' }`}
                onClick={() => setProductsPerPage(value)}
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
