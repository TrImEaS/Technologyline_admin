import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Spinner from '../Components/Products/Spinner.jsx'
import saleImg from '../Assets/hotsale-icon.svg'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import 'bootstrap/dist/css/bootstrap.min.css'

const MySwal = withReactContent(Swal);

export default function Products () {
  const [loadedImages, setLoadedImages] = useState([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImg, setSelectedImg] = useState(null)
  const [description, setDescription] = useState(null)
  const [specifications, setSpecifications] = useState(null)
  const [price, setPrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [name, setName] = useState(null)
  const [descriptionMenu, setDescriptionMenu] = useState('desc')
  const {product: productQuery } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    (async function () {
      try {
        const response = await fetch('https://technologyline.com.ar/api/products');
        if (!response.ok) {
          throw new Error('Error al obtener productos');
        }
        const data = await response.json();
        const newProduct = data.find(product => product.sku === productQuery)
        if (!newProduct) {
          navigate('/error')
        } 
        else {
          setLoadingImages(true)
          setProduct(newProduct)
          setSelectedImg(newProduct.img_base)
          setDescription(newProduct.description)
          setName(newProduct.name)
          setPrice(newProduct.price)
          setDiscount(newProduct.discount)
          setSpecifications(newProduct.specifications)
          document.title = `${newProduct.name} | Technology Line`
          setLoading(false);
        }
      } 
      catch (err) {
        console.log(err)
      }
    })()
  }, [productQuery, navigate])
  
  useEffect(() => {
    const loadImages = async (product) => {
      const images = []
      const baseUrl = 'https://technologyline.com.ar/products-images'
      let notFoundCount = 0
      // Cargar la imagen principal
      const mainImage = `${baseUrl}/${product.sku}.jpg`
      if (await imageExists(mainImage)) {
        images.push(mainImage)
      }
      
      // Cargar las imágenes adicionales
      for (let i = 1; i <= 10; i++) {
        const additionalImage = `${baseUrl}/${product.sku}_${i}.jpg`
        if (await imageExists(additionalImage)) {
          images.push(additionalImage)
        } else {
          notFoundCount++
          if(notFoundCount === 2) {
            break
          }
        }
      }
      setLoadedImages(images)
      setLoadingImages(false)
    }
  
    if (product) {
      loadImages(product)
    }
  }, [product])
  
  const imageExists = (url) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve(true) // La imagen se ha cargado correctamente
      }
      img.onerror = () => {
        resolve(false) // La imagen no se pudo cargar
      }
      img.src = url
    })
  }
  
  // const totalDiscount = (price, discount) => {
  //   // Convertir los precios a números
  //   const normalPrice = parseFloat(price);
  //   const discountedPrice = parseFloat(discount);
    
  //   // Calcular el porcentaje de descuento
  //   const percentage = ((normalPrice - discountedPrice) / normalPrice) * 100;
    
  //   // Devolver el porcentaje como un número entero
  //   return Math.round(percentage);
  // }

  const editField = (field) => {
    MySwal.fire(
    {
      title: `Editar 
      ${
        field === 'desc' ? 'Descripción'
        : field === 'spec' ?  'Especificaciones'
        : field === 'price' ? 'Precio'
        : field === 'discount' ? 'Descuento'
        : 'Nombre'
      }`,
      inputLabel: `Ingrese nuevo valor 
      ${
        field === 'discount' 
          ? '\n (Recuerde que si aplica un valor mayor a \n0 al descuento, se activara modo descuento.)'
          : ':'
      }`,
      inputValue:
        field === 'desc' ? description : 
        field === 'spec' ?  specifications : 
        field === 'price' ? price : 
        field === 'discount' ? discount : 
        name,
      input: 'textarea',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',

      inputValidator: (value) => {
        if (!value || value.trim() === '') { return 'El campo no puede estar vacío' }
        
        if (value === 
        (
          field === 'desc' ? description 
          : field === 'spec' ?  specifications
          : field === 'price' ? price
          : name
        )) { return 'No se detectaron cambios, intente nuevamente.' }
      }
    })
    .then((result) => {
      if (result.isConfirmed) 
      {
        const newValue = result.value;
        if (field === 'desc') 
        {
          setDescription(newValue);
          handleEditDescription(product.id, newValue);
        } 
        
        if (field === 'spec') 
        {
          setSpecifications(newValue);
          handleEditSpecifications(product.id, newValue);
        }

        if (field === 'price') 
        {
          setPrice(newValue);
          handleEditPrice(product.id, newValue);
        }

        if (field === 'name') 
        {
          setName(newValue);
          handleEditName(product.id, newValue);
        }

        if (field === 'discount') 
        {
          setDiscount(newValue);
          handleEditDiscount(product.id, newValue);
        }
      }
    });
  };

  const handleEditSpecifications = async (id, newValue) => {
    if(newValue === specifications || newValue === undefined) 
    {
      return alert('Error, no se detecto cambios en la especificacion del producto, intente nuevamente.')
    }
    try 
    {
      const response = await fetch(`https://technologyline.com.ar/api/products/${id}`, 
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({specifications: newValue})
      });

      if (!response.ok) { throw new Error('Error al editar producto') }
      
      alert('Producto editado con exito!')
      setSpecifications(newValue)
    } 
    catch (err) { console.log(err) }
  }

  const handleEditDescription = async (id, newValue) => {
    if(newValue === description || newValue === undefined) {
      return alert('Error, no se detecto cambios en la descripcion del producto, intente nuevamente.')
    }
    try {
      const response = await fetch(`https://technologyline.com.ar/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({description: newValue})
      });
      if (!response.ok) { 
        throw new Error('Error al editar producto') 
      }
        alert('Producto editado con exito!')
        setDescription(newValue)
    } 
    catch (err) {
      console.log(err)
    }
  }

  const handleEditName = async (id, newValue) => {
    if(newValue === name || newValue === undefined) {
      return alert('Error, no se detecto cambios en el nombre del producto, intente nuevamente.')
    }
    try {
      const response = await fetch(`https://technologyline.com.ar/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: newValue})
      });
      if (!response.ok) { 
        throw new Error('Error al editar producto') 
      }
        alert('Producto editado con exito!')
        setName(newValue)
    } 
    catch (err) {
      console.log(err)
    }
  }

  const handleEditPrice = async (id, newValue) => {
    if(newValue === price || newValue === undefined) {
      return alert('Error, no se detecto cambios en el precio del producto, intente nuevamente.')
    }
    try {
      const response = await fetch(`https://technologyline.com.ar/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({price: parseFloat(newValue)})
      });
      if (!response.ok) { 
        throw new Error('Error al editar producto') 
      }
        alert('Producto editado con exito!')
        setPrice(newValue)
    } 
    catch (err) {
      alert('Error al cambiar precio, 500 servidor error')
      console.log(err)
    }
  }

  const handleEditDiscount = async (id, newValue) => {
    if(newValue === discount || newValue === undefined) {
      return alert('Error, no se detecto cambios en el descuento del producto, intente nuevamente.')
    }
    try {
      const response = await fetch(`https://technologyline.com.ar/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({discount: parseFloat(discount)})
      });
      if (!response.ok) { 
        throw new Error('Error al editar producto') 
      }
        alert('Producto editado con exito!')
        setDiscount(newValue)
    } 
    catch (err) {
      alert('Error al cambiar precio, 500 servidor error')
      console.log(err)
    }
  }

  if(loading) return(<Spinner/>)
  
  const formattedPrice = parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const formattedDiscount = parseFloat(discount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <section className='flex flex-col items-center h-full w-full gap-y-10 pb-14 max-md:pt-10 z-10 bg-[#fafafa]'>
      <header className='w-[90%] sm:mt-5 relative h-full flex max-md:flex-col max-md:items-center sm:p-5 rounded-3xl py-5'>
        <section className='flex flex-col items-center relative w-[55%] max-sm:w-full h-full min-h-[300px]'>
          {discount > 0 ? <img className="absolute h-14 w-14 right-7 top-10" src={saleImg} alt="" /> : ''}
          
          <div className='h-[300px] w-[300px]'>
            <img className='h-full w-full object-contain' src={selectedImg} />
          </div>

          {loadingImages ? <Spinner /> : 
            <div className='flex justify-center w-full h-full'>
              {loadedImages.map((img, index) =>(
                <img 
                  className='h-24 w-24 cursor-pointer object-contain' 
                  onClick={() => {setSelectedImg(img)}} 
                  key={index} 
                  src={img} 
                />
              ))}
            </div>
          }
        </section>

        <section className='flex flex-col w-[45%] justify-start max-sm:px-10 items-start h-fit max-md:w-full border-2 rounded-lg p-8 sm:mb-10 shadow-lg'>
          <div className='flex gap-3'>
            <span onClick={() => editField('name')} className='text-blue-400 hover:text-black cursor-pointer top-1 font-bold duration-300'>
              Editar nombre
            </span>
            
            <span onClick={() => editField('price')} className='text-blue-400 hover:text-black cursor-pointer top-1 font-bold duration-300'>
              Editar precio
            </span>

            <span onClick={() => editField('discount')} className='text-blue-400 hover:text-black cursor-pointer top-1 font-bold duration-300'>
              Editar descuento
            </span>
          </div>

          <div className='min-h-[200px] flex flex-col gap-y-2'>
            <span className='text-sm text-gray-500'>
              SKU: {product.sku}
            </span>

            <h1 className='text-2xl'>
              {name}
            </h1>

            <div className='flex flex-col w-full gap-y-3 justify-center'>
              <div className='flex flex-col'>
                <span className='text-2xl font-semibold'>
                  Precio: {`$${formattedPrice}`}
                </span>
                <span className='text-2xl font-semibold'>
                  Descuento: {discount === 0 ? "Desactivado" : formattedDiscount}
                </span>
              </div>

              <div className='flex text-xl w-full items-center'>
                <span>Stock: <strong>{product.stock}</strong></span>
              </div>

              <span>{product.ean && 'EAN: ' + product.ean}</span>
            </div>
          </div>

          <div className='w-full flex max-md:justify-center items-center'>
            <a className='rounded-xl flex items-center justify-center text-lg border-2 border-black font-bold hover:bg-black hover:text-white active:text-sm active:duration-0 py-1 px-2 duration-300 w-[200px] h-[50px]'>
              Consultar Articulo
            </a>
          </div>
        </section>
      </header>

      <div className='flex flex-col max-sm:w-[90%] w-[83%] bg-blue-400 rounded-lg border shadow-lg'>
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
            ?
            (
              <div>
                <div 
                  className='flex flex-col px-4 py-2' 
                  dangerouslySetInnerHTML={{ __html: description ? description : 'Este articulo no posee descripciones.' }} />
                <span onClick={() => editField('desc')} className='absolute text-blue-400 hover:text-black cursor-pointer top-0 right-2 duration-300'>Editar</span>
              </div>
            )
            :
            (
              <div>
                <div className='flex flex-col px-4 py-2' dangerouslySetInnerHTML={{ __html: specifications ? specifications : 'Este articulo no posee especificaciones.' }} />
                <span onClick={() => editField('spec')} className='absolute text-blue-400 hover:text-black cursor-pointer top-0 right-2 duration-300'>Editar</span>
              </div>
            )}
        </div>
      </div>
    </section>
  )
}
