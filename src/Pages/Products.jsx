import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Spinner from '../Components/Products/Spinner.jsx';
import axios from 'axios';
import ImageSlider from '../Components/Products/ImageSlider.jsx';
import RichEditor from '../Components/Editor/RichEditor';

const API_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_URL_PROD : import.meta.env.VITE_API_URL_DEV;

export default function Products() {
  const [product, setProduct] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [aditionalData, setAditionalData] = useState({ peso: "", volume: "" });
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState(null);
  const [specifications, setSpecifications] = useState(null);
  const [descriptionMenu, setDescriptionMenu] = useState('desc');
  const [showEditor, setShowEditor] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const editField = (field) => {
    setEditingField(field);
    setShowEditor(true);
  };

  useEffect(() => {
    setLoading(true)
    const query = new URLSearchParams(location.search);
    const productQuery = query.get('product');
    
    if (!productQuery) {
      navigate('/admin/page/error');
      return;
    }

    axios.get(`${API_URL}/api/products?sku=${productQuery}`)
    .then(res => {
      const newProduct = res.data[0]
      if(!newProduct) throw new Error('Producto no encontrado');

      setProduct(newProduct);
      setProductImages(newProduct.img_urls);
      setDescription(newProduct.descriptions);
      setSpecifications(newProduct.specifications);

      document.title = `${newProduct.name} | Technology Line`;
    })
    .catch(e => {
      console.error(e)
      return navigate('/admin/page/error')
    })
    .finally(() => setLoading(false))
  }, [location.search, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*\.?\d*$/.test(value)) {
      setAditionalData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditField = async (field, newValue) => {
    try {
      const response = await fetch(`${API_URL}/api/products?sku=${product.sku}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue })
      });
      if (!response.ok) throw new Error('Error al editar producto');
      
      if (field === 'descriptions') {
        setDescription(newValue);
      } else if (field === 'specifications') {
        setSpecifications(newValue);
      }
      
      alert('Contenido actualizado con éxito!');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el contenido');
    }
  };

  if (loading) return <Spinner />;
  
  const formattedPrice = (price) => {
    return price ? parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-----'
  }

  return (
    <section className='flex relative flex-col items-center h-full w-[90%] min-h-[600px] gap-y-10 pb-14 pt-5 max-md:pt-10'>
      <header className='w-[100%] relative h-full flex max-md:flex-col max-md:items-center sm:p-5 rounded-3xl py-5 gap-5 shadow-page'>
        <section className='relative text-white w-[60%] max-md:w-full h-full sm:mt-2 -mt-2 sm:min-h-[620px] min-h-[550px] sm:pb-10 p-5 rounded-lg'>
          <span className='text-sm tracking-wide w-full'>
            SKU: {product.sku}
          </span>

          <h1 className='text-2xl font-semibold'>
            {product.name.replace(/EAN.*/,'')}
          </h1>

          {loading 
            ? <div><Spinner /></div> 
            : <ImageSlider 
                loadedImages={productImages} 
                setLoadedImages={setProductImages} 
                id={product.id}
                sku={product.sku}
              />
          }
        </section>

        <section className='flex tracking-wider bg-[#fafafa] flex-col w-[40%] mt-5 min-h-[620px] max-sm:min-h-[500px] justify-center items-center h-fit max-md:w-full border rounded-lg p-8 max-sm:py-0 sm:mb-10 shadow-lg'>
          <div className='min-h-[200px] flex flex-col gap-y-2'>
            <div className='flex flex-col w-full gap-y-3 justify-center'>
              <section className='flex flex-col text-lg w-full gap-2 border-b pb-3 border-dashed border-page-blue-normal'>
                <p className='flex flex-col text-center text-[#333333] tracking-widest mb-2 text-2xl'>
                  <span>
                    PRECIO LISTA
                  </span>
                  <span>
                    <b className='font-semibold text-[#333333]'>{`$${formattedPrice(product.price_list_1)}`}</b>
                  </span>
                </p>

                <div className='flex font-semibold text-red-600 flex-col text-center items-center text-base tracking-tighter'>
                  <span>PROMO: EFECTIVO / TRANSFERENCIA BANCARIA: </span>
                  <p className='pl-5 font-semibold flex gap-1 text-[#15803d] items-center tracking-normal'>
                    <span>{`$${formattedPrice(product.price_list_2)}`}</span>
                    <span className='text-xs text-[#dc7b26]'>(Ahorras: ${product.price_list_1 ? ((product.price_list_2 - product.price_list_1)*-1).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-----'})</span>
                  </p>
                </div>
              </section>
              
              <section className='flex flex-col items-center mb-5 w-full gap-y-3 justify-center'>
                <span className='font-bold text-[#2563eb]'>¡Opcion de compra en cuotas fijas!</span>

                <article className='flex flex-col'>
                  <p className='flex w-fit justify-center gap-1 p-1'>
                    <span className='text-[#1e40af] font-semibold'>3</span> 
                    <span className='text-[#1e40af]'>cuotas</span>
                    <span>de:</span> 
                    <span className='text-[#1e40af] font-semibold'>{`$${product.price_list_3 ? (parseFloat(product.price_list_3)/3).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-----'}`}</span>
                  </p>
                </article>  

                <article className='flex flex-col'>
                  <p className='flex w-fit justify-center gap-1 p-1'>
                    <span className='text-[#1e40af] font-semibold'>6</span> 
                    <span className='text-[#1e40af]'>cuotas</span>
                    <span>de:</span> 
                    <span className='text-[#1e40af] font-semibold'>{`$${product.price_list_3 ? (parseFloat(product.price_list_4)/6).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-----'}`}</span>
                  </p>
                </article>  

                <article className='flex flex-col'>
                  <p className='flex w-fit justify-center gap-1 p-1'>
                    <span className='text-[#1e40af] font-semibold'>9</span> 
                    <span className='text-[#1e40af]'>cuotas</span>
                    <span>de:</span> 
                    <span className='text-[#1e40af] font-semibold'>{`$${product.price_list_3 ? (parseFloat(product.price_list_5)/9).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-----'}`}</span>
                  </p>
                </article>  

                <article className='flex flex-col'>
                  <p className='flex w-fit justify-center gap-1 p-1'>
                    <span className='text-[#1e40af] font-semibold'>12</span> 
                    <span className='text-[#1e40af]'>cuotas</span>
                    <span>de:</span> 
                    <span className='text-[#1e40af] font-semibold'>{`$${product.price_list_3 ? (parseFloat(product.price_list_6)/12).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-----'}`}</span>
                  </p>

                </article>  

                <ul className="flex text-3xl max-[1500px]:ml-0 gap-x-4">
                  <img className='bg-gray-700 rounded-lg w-[45px] h-[30px]' src='https://technologyline.com.ar/banners-images/Assets/Some-icons/card-icon2.svg'/>
                  <img className='bg-red-600 rounded-lg w-[45px] h-[30px]' src='https://technologyline.com.ar/banners-images/Assets/Some-icons/card-icon3.svg'/>
                  <img className='bg-blue-500 rounded-lg w-[45px] h-[30px]' src='https://technologyline.com.ar/banners-images/Assets/Some-icons/card-icon4.svg'/>
                  <img className='bg-yellow-500 rounded-lg w-[45px] h-[30px]' src='https://technologyline.com.ar/banners-images/Assets/Some-icons/card-icon5.svg'/>
                  <img className='bg-orange-500 rounded-lg w-[45px] h-[30px]' src='https://technologyline.com.ar/banners-images/Assets/Some-icons/card-icon1.svg'/>
                </ul>
              </section>
            </div>
          </div>

          <div className='w-full flex max-md:justify-center flex-col gap-5 items-center'>
            <span className='text-sm uppercase tracking-widest font-semibold text-gray-700'>
              DISPONIBILIDAD: {product.stock}
            </span>
            <button
              onClick={()=> addProductToCart({ product })}
              className='max-sm:hidden bg-page-blue-normal active:text-sm active:duration-0 hover:bg-page-lightblue rounded-xl flex items-center justify-center text-sm font-bold bg-gradient-to-l from-sky-400 to-sky-800 duration-300 border border-gray-300 text-white py-1 px-2 w-[90%] h-[50px] cart hover:brightness-125'
            >
              AGREGAR AL CARRITO
            </button>
          </div>
        </section>
      </header>

      {showEditor && (
        <RichEditor
          initialValue={editingField === 'desc' ? description : specifications}
          title={editingField === 'desc' ? 'Descripción' : 'Especificaciones'}
          onSave={(content) => {
            const field = editingField === 'desc' ? 'descriptions' : 'specifications';
            handleEditField(field, content);
            setShowEditor(false);
          }}
          onClose={() => setShowEditor(false)}
        />
      )}

      <section className='flex shadow-page rounded-md p-5 flex-col min-h-[100px] text-white w-full justify-center gap-5'>
        <h3>Datos adicionales: </h3>
        
        <article className='flex gap-2'>
          <label htmlFor="peso" className='min-w-[70px]'>Peso: </label>
          <input
            className='rounded-sm outline-none px-2 max-w-[100px] text-black' 
            type="text" 
            name="peso" 
            id="peso"
            value={aditionalData.peso} 
            onChange={handleInputChange} 
          />
        </article>

        <article className='flex gap-2'>
          <label htmlFor="volume" className='min-w-[70px]'>Volumen: </label>
          <input 
            value={aditionalData.volume} 
            onChange={handleInputChange}           
            className='rounded-sm outline-none px-2 max-w-[100px] text-black' 
            type="text"
            name="volume" 
            id="volume" />
        </article>
      </section>
      
      <div className='flex flex-col w-full bg-blue-400 rounded-lg border shadow-lg'>
        <div className='flex p-2 gap-x-3'>
          <span
            onClick={() => setDescriptionMenu('desc')}
            className={`${descriptionMenu === 'desc' ? 'text-white' : ''} font-bold hover:font-bold hover:text-white rounded-xl px-2 py-1 duration-300 cursor-pointer`}>
            Descripción
          </span>
          <span className='py-1'>|</span>
          <span
            onClick={() => setDescriptionMenu('spec')}
            className={`${descriptionMenu === 'spec' ? 'text-white' : ''} font-bold hover:font-bold hover:text-white rounded-xl px-2 py-1 duration-300 cursor-pointer`}>
            Especificaciones
          </span>
        </div>

        <div className='relative p-2 bg-gray-100 min-h-[100px]'>
          {descriptionMenu === 'desc'
            ? (
              <div>
                <div
                  className='flex flex-col px-4 py-2 text-black'
                  dangerouslySetInnerHTML={{ __html: description || 'Este articulo no posee descripciones.' }} />
                <span onClick={() => editField('desc')} className='absolute text-blue-400 hover:text-black cursor-pointer top-0 right-2 duration-300'>Editar</span>
              </div>
            )
            : (
              <div>
                <div
                  className='flex flex-col px-4 py-2 text-black'
                  dangerouslySetInnerHTML={{ __html: specifications || 'Este articulo no posee especificaciones.' }} />
                <span onClick={() => editField('spec')} className='absolute text-blue-400 hover:text-black cursor-pointer top-0 right-2 duration-300'>Editar</span>
              </div>
            )}
        </div>
      </div>
    </section>
  );
}
