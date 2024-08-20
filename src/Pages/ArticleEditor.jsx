import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductCard from '../Components/ProductCard';

export default function ArticleEditor() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState(false);
  const [productsPerPage, setProductsPerPage] = useState(10);
  const maxPageButtons = 5;
  const location = useLocation();
  const navigate = useNavigate(); 

  useEffect(() => {
    (async function () {
      try {
        const response = await fetch('https://technologyline.com.ar/api/products?all=true');
        if (!response.ok) {
          throw new Error('Error al obtener productos');
        }
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } 
      catch (err) {
        console.log(err);
      }
    })();
  }, []);

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
    return filteredProducts.filter(product => product.status === true);
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

  return (
    <section className="flex flex-col justify-center items-center h-full min-h-[500px] w-[90%] z-10 py-5">
      <article className="flex w-full flex-col gap-10 items-center">
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
              className={`${!filter ? 'text-black' : 'text-gray-300 border-gray-50'} font-bold bg-[#fafafa] rounded-lg flex items-center text-sm justify-center w-full h-14 cursor-pointer hover:outline-dashed hover:text-black hover:border-black duration-100 border-2 border-black`}
              onClick={() => 
              {
                setFilter(false);
                setStartIndex(0);
                navigate(`?page=1&onlystock=false`);
              }}>
              Todo
            </span>

            <span>|</span>

            <span 
              className={`${filter ? 'text-black' : 'text-gray-300 border-gray-50'} font-bold bg-[#fafafa] rounded-lg flex items-center text-sm justify-center w-full h-14 cursor-pointer hover:outline-dashed hover:text-black hover:border-black duration-100 border-2 border-black`}
              onClick={() => 
              {
                setFilter(true);
                setStartIndex(0);
                navigate(`?page=1&onlystock=true`);
              }}>
              Solo con stock
            </span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 w-full min-h-[400px]">
          {displayedProducts.map(product => (
            <ProductCard 
              key={product.id+product.name} 
              product={product}
              onClick={() => navigate(`/admin/page/products?product=${product.sku}`)} 
            />
          ))}
        </div>

        <div className="flex w-full justify-center items-center mt-10">
          {getPagesToShow().map((page, index) => (
            <span
              key={page === '...' ? `ellipsis-${index}` : page} // Clave única para los puntos suspensivos
              onClick={() => {
                if (page !== '...') handlePageChange(page);
              }}
              className={`cursor-pointer mx-2 p-2 ${
                typeof page === 'number' && (Math.floor(startIndex / productsPerPage) + 1) === page ? 'bg-gray-500 text-white' : 'bg-gray-200'
              }`}
            >
              {page}
            </span>
          ))}
        </div>
      </article>
    </section>
  );
}
