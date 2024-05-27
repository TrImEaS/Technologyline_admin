import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ImageSlider from '../Components/Products/ImageSlider.jsx'
import Spinner from '../Components/Products/Spinner.jsx'
import saleImg from '../Assets/hotsale-icon.svg'


export default function Products () {
  const [loadedImages, setLoadedImages] = useState([])
  const [loadingImages, setLoadingImages] = useState(false)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [descriptionMenu, setDescriptionMenu] = useState('desc')
  const productQuery = new URLSearchParams(location.search).get('product')
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
          document.title = `${newProduct.name} | Technology Line`
          setLoading(false);
        }
      } 
      catch (err) {
        console.log(err)
      }
    })()
  }, [location.search, navigate])
  
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

  if(loading){
    return(<Spinner/>)
  }

  const formattedPrice = parseFloat(product.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const formattedDiscount = parseFloat(product.discount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const totalDiscount = (price, discount) => {
    // Convertir los precios a números
    const normalPrice = parseFloat(price);
    const discountedPrice = parseFloat(discount);
  
    // Calcular el porcentaje de descuento
    const percentage = ((normalPrice - discountedPrice) / normalPrice) * 100;
  
    // Devolver el porcentaje como un número entero
    return Math.round(percentage);
  }

  const percentageOff = totalDiscount(product.price, product.discount)

  const handleStockQuantity = () => {
    const quantity = product.stock
    if(quantity === 3){
      return (
        <span className='text-red-600'>
          Ultima unidad
        </span>
        )
    }

    if(quantity < 10){
      return (
        <span className='text-orange-400 font-semibold'>
          Ultimas unidades
        </span>
        )
    }

    return (
      <span className='text-green-600 font-semibold'>
        Existente
      </span>
    )
  }

  return (
    <section className={`flex flex-col items-center h-full w-full gap-y-10 pb-14 max-md:pt-10`}>
      <header className='w-[90%] relative h-full flex max-md:flex-col max-md:items-center sm:p-5 rounded-3xl py-5'>
        <section className='relative w-[55%] max-sm:w-full h-full min-h-[450px]'>
        {product.discount > 0
        ?
          <img className="absolute h-14 w-14 right-7 top-10" src={saleImg} alt="" />
        :
          ''
        }
          {loadingImages ? <Spinner /> : <ImageSlider loadedImages={loadedImages}/>}
        </section>

        <section className='flex flex-col w-[45%] sm:mt-12 justify-start max-sm:px-10 items-start h-fit max-md:w-full border-2 rounded-lg p-8 sm:mb-10 shadow-lg'>
          <div className='min-h-[200px] flex flex-col gap-y-2'>
            <span className='text-sm text-gray-500'>
              SKU: {product.sku}
            </span>

            <h1 className='text-2xl'>
              {product.name}
            </h1>

            <div className='flex flex-col w-full gap-y-3 justify-center'>
              {product.discount > 0
              ?
                <div>
                  <div className='flex items-center gap-x-1'>
                    <p className="text-sm line-through">${formattedPrice}</p>
                    <span className='text-sm mb-1 bg-orange-400 text-white px-2 rounded-full'>{percentageOff}% OFF</span>
                  </div>
                  <p className="font-bold text-2xl">${formattedDiscount}</p>
                </div>
              :
                <h2 className='text-2xl font-semibold'>
                  {`$${formattedPrice}`}
                </h2>
              }
              <div className='flex gap-x-5 text-xl w-full items-center'>
                <span>
                  Stock:
                </span>
                <span className='font-bold'>
                  {handleStockQuantity()}
                </span>
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

      <div className='flex flex-col max-sm:w-[90%] w-[83%] bg-blue-400 rounded-lg font-bold border shadow-lg'>
        <div className='flex p-2 gap-x-3'>
          <span 
            onClick={() => setDescriptionMenu('desc')}          
            className={`${descriptionMenu === 'desc' ? 'text-white' : ''} hover:font-bold hover:text-white rounded-xl px-2 py-1 duration-300 cursor-pointer`}>
            Descripción
          </span>
          <span className='py-1'>|</span>
          <span 
            onClick={() => setDescriptionMenu('spec')}
            className={`${descriptionMenu === 'spec' ? 'text-white' : ''} hover:font-bold hover:text-white rounded-xl px-2 py-1 duration-300 cursor-pointer`}>
            Especificaciones
          </span>
        </div>
        <div className='p-2 bg-gray-100 min-h-[100px]'>
          {descriptionMenu === 'desc' 
            ? <p>{product.description ? '' : 'Este articulo no posee descripciones.'}</p>
            : <p>{product.specifications ? '' : 'Este articulo no posee especificaciones.'}</p>
          }
        </div>
      </div>
    </section>
  )
}
