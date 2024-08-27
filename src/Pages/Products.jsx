import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Spinner from '../Components/Products/Spinner.jsx';
import saleImg from '../Assets/hotsale-icon.svg';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Products() {
  const [loadedImages, setLoadedImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null);
  const [description, setDescription] = useState(null);
  const [specifications, setSpecifications] = useState(null);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [name, setName] = useState(null);
  const [descriptionMenu, setDescriptionMenu] = useState('desc');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const productQuery = query.get('product');
    
    if (!productQuery) {
      navigate('/admin/page/error');
      return;
    }

    (async function fetchProduct() {
      try {
        const response = await fetch('https://technologyline.com.ar/api/products?all=true');
        if (!response.ok) throw new Error('Error al obtener productos');
        const data = await response.json();
        const newProduct = data.find(p => p.sku === productQuery);
        if (!newProduct) return navigate('/admin/page/error');

        setLoadingImages(true);
        setProduct(newProduct);
        setSelectedImg(newProduct.img_base);
        setDescription(newProduct.description);
        setName(newProduct.name);
        setPrice(newProduct.price);
        setDiscount(newProduct.discount);
        setSpecifications(newProduct.specifications);
        document.title = `${newProduct.name} | Technology Line`;
        setLoading(false);
      } catch (err) {
        console.log(err);
      }
    })();
  }, [location.search, navigate]);

  useEffect(() => {
    const loadImages = async (product) => {
      const images = [];
      const baseUrl = 'https://technologyline.com.ar/products-images';
      const imagePromises = [product.sku].concat(Array.from({ length: 10 }, (_, i) => `${product.sku}_${i + 1}`))
        .map(async name => {
          const url = `${baseUrl}/${name}.jpg`;
          if (await imageExists(url)) images.push(url);
          return url;
        });

      await Promise.all(imagePromises);
      setLoadedImages(images);
      setLoadingImages(false);
    };

    if (product) loadImages(product);
  }, [product]);

  const imageExists = (url) => new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });

  const editField = (field) => {
    const titles = { desc: 'Descripción', spec: 'Especificaciones', price: 'Precio', discount: 'Descuento', name: 'Nombre' };
    const inputs = { desc: description, spec: specifications, price, discount, name };
    const inputLabels = { discount: ' (Recuerde que si aplica un valor mayor a 0 al descuento, se activara modo descuento.)' };

    MySwal.fire({
      title: `Editar ${titles[field]}`,
      inputLabel: `Ingrese nuevo valor${inputLabels[field] || ':'}`,
      inputValue: inputs[field],
      input: 'textarea',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value.trim()) return 'El campo no puede estar vacío';
        if (value === inputs[field]) return 'No se detectaron cambios, intente nuevamente.';
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newValue = result.value;
        const handlers = {
          desc: handleEditDescription,
          spec: handleEditSpecifications,
          price: handleEditPrice,
          name: handleEditName,
          discount: handleEditDiscount
        };
        handlers[field](product.id, newValue);
      }
    });
  };

  const handleEditField = async (field, newValue) => {
    if (newValue === product[field] || newValue === undefined) return alert(`Error, no se detectó cambios en ${field}.`);
    try {
      const response = await fetch(`https://technologyline.com.ar/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: field === 'price' || field === 'discount' ? parseFloat(newValue) : newValue })
      });
      if (!response.ok) throw new Error('Error al editar producto');
      alert('Producto editado con éxito!');
      setProduct(prev => ({ ...prev, [field]: newValue }));
      window.location.reload()
    } catch (err) {
      console.log(err);
      alert('Error al cambiar el valor, 500 servidor error');
    }
  };

  const handleEditDescription = (id, newValue) => handleEditField('description', newValue);
  const handleEditSpecifications = (id, newValue) => handleEditField('specifications', newValue);
  const handleEditName = (id, newValue) => handleEditField('name', newValue);
  const handleEditPrice = (id, newValue) => handleEditField('price', newValue);
  const handleEditDiscount = (id, newValue) => handleEditField('discount', newValue);

  if (loading) return <Spinner />;
  
  const formattedPrice = parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedDiscount = parseFloat(discount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <section className='flex flex-col items-center h-full w-full gap-y-10 pb-14 max-md:pt-10 z-10 bg-gradient-to-tl from-[#0d1717] to-[#f9bf89] text-white'>
      <header className='w-[90%] sm:mt-5 relative h-full flex max-md:flex-col max-md:items-center sm:p-5 rounded-3xl py-5'>
        <section className='flex flex-col items-center gap-y-5 relative w-[55%] max-sm:w-full h-full min-h-[300px] max-h-[500px]'>
          {discount > 0 && <img className="absolute h-14 w-14 right-7 top-10" src={saleImg} alt="Sale" />}
          <div className='h-[300px] w-[300px]'>
            <img className='h-full w-full object-contain rounded-lg' src={selectedImg} alt="Product" />
          </div>
          {loadingImages ? <Spinner /> : (
            <div className='flex justify-center w-full h-full rounded-lg max-h-[100px]'>
              {loadedImages.map((img, index) => (
                <img
                  className='h-24 w-24 cursor-pointer object-contain rounded-lg'
                  onClick={() => setSelectedImg(img)}
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                />
              ))}
            </div>
          )}
        </section>
        <section className='flex flex-col w-[45%] justify-start max-sm:px-10 items-start h-fit max-md:w-full border-2 rounded-lg p-8 sm:mb-10 shadow-[#fafafa] shadow-lg'>
          <div className='flex gap-3'>
            {['name', 'price', 'discount'].map(field => (
              <span
                key={field}
                onClick={() => editField(field)}
                className='text-blue-400 hover:text-black cursor-pointer top-1 font-bold duration-300'>
                Editar {field === 'discount' ? 'descuento' : field}
              </span>
            ))}
          </div>
          <div className='min-h-[200px] flex flex-col gap-y-2'>
            <span className='text-sm text-[#fafafae8]'>SKU: {product.sku}</span>
            <h1 className='text-2xl'>{name}</h1>
            <div className='flex flex-col w-full gap-y-3 justify-center'>
              <div className='flex flex-col'>
                <span className='text-2xl font-semibold'>Precio: ${formattedPrice}</span>
                <span className='text-2xl font-semibold'>Descuento: {discount === 0 ? "Desactivado" : formattedDiscount}</span>
              </div>
              <div className='flex text-xl w-full items-center'>
                <span>Stock: <strong>{product.stock}</strong></span>
              </div>
              <span>{product.ean && `EAN: ${product.ean}`}</span>
            </div>
          </div>
          <div className='w-full flex max-md:justify-center items-center'>
            <a className='rounded-xl flex items-center justify-center text-lg border-2 bg-white text-black border-black font-bold hover:bg-black hover:text-white active:text-sm active:duration-0 z-40 py-1 px-2 duration-300 w-[200px] h-[50px]'>
              Consultar Articulo
            </a>
          </div>
        </section>
      </header>
      <div className='flex flex-col max-sm:w-[90%] w-[83%] bg-blue-400 rounded-lg border shadow-[#fafafa] shadow-lg'>
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
