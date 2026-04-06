import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Spinner from '../Components/Products/Spinner.jsx'
import axios from 'axios'
import ImageSlider from '../Components/Products/ImageSlider.jsx'
import RichEditor from '../Components/Editor/RichEditor'
import useFormattedPrice from '../Utils/useFormattedPrice.js'
import { FaCartPlus, FaMapMarkerAlt, FaTruck } from 'react-icons/fa'
const API_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_URL_PROD : import.meta.env.VITE_API_URL_DEV

export default function Products () {
  const [product, setProduct] = useState(null)
  const [preSell, setPreSell] = useState(null)
  const [userCP, setUserCP] = useState(1408);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [productImages, setProductImages] = useState([])
  const [originalAditionalData, setOriginalAditionalData] = useState({ weight: '', volume: '' })
  const [aditionalData, setAditionalData] = useState({ weight: '', volume: '' })
  const [loading, setLoading] = useState(true)
  const [description, setDescription] = useState(null)
  const [shippingResult, setShippingResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [specifications, setSpecifications] = useState(null)
  const [faq, setFaq] = useState(null)
  const [descriptionMenu, setDescriptionMenu] = useState('desc')
  const [showEditor, setShowEditor] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const location = useLocation()
  const [hasNoVolume, setHastNoVolume] = useState('')
  const navigate = useNavigate()

  const togglePreSell = () => setPreSell(preSell === 1 ? 0 : 1)

  const editField = (field) => {
    setEditingField(field)
    setShowEditor(true)
  }

  const fetchData = async () => {
    setLoading(true)
    const query = new URLSearchParams(location.search)
    const productQuery = query.get('product')

    if (!productQuery) {
      navigate('/admin/page/error')
      return
    }

    axios.get(`${API_URL}/api/products?sku=${productQuery}`)
      .then(res => {
        const newProduct = res.data[0]
        if (!newProduct) throw new Error('Producto no encontrado')

        setProduct(newProduct)
        setProductImages(newProduct.img_urls)
        setPreSell(newProduct.pre_sell)
        setDescription(newProduct.descriptions)
        setSpecifications(newProduct.specifications)
        setFaq(newProduct.faq)
        console.log(newProduct.faq)

        document.title = `${newProduct.name} | Technology Line`

        setOriginalAditionalData({
          weight: newProduct.weight || '',
          volume: newProduct.volume || ''
        })
        setAditionalData({
          weight: newProduct.weight || '',
          volume: newProduct.volume || ''
        })
        setHastNoVolume(!newProduct.volume || parseFloat(newProduct.volume) === 0 || newProduct.volume === '')
      })
      .catch(e => {
        console.error(e)
        return navigate('/admin/page/error')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [location.search, navigate])


  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (/^\d*\.?\d*$/.test(value)) {
      setAditionalData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleEditField = async (field, newValue) => {
    try {
      const response = await fetch(`${API_URL}/api/products?sku=${product.sku}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue })
      })
      if (!response.ok) throw new Error('Error al editar producto')

      if (field === 'preSell') {
        setPreSell(newValue)
        window.location.reload()
      }

      if (field === 'descriptions') {
        setDescription(newValue)
      } else if (field === 'specifications') {
        setSpecifications(newValue)
      } else if (field === 'faq') {
        setFaq(newValue)
      }

      alert('Contenido actualizado con éxito!')
    } catch (err) {
      console.error(err)
      alert('Error al actualizar el contenido')
    }
  }

  const saveAditionalData = async () => {
    const data = {
      weight: aditionalData.weight,
      volume: aditionalData.volume
    }

    axios.patch(`${API_URL}/api/products/?sku=${product.sku}`, data)
      .then(res => {
        if (res.status === 200) {
          fetchData()
          return alert('Datos adicionales guardados correctamente')
        }
        throw new Error('Error al guardar los datos adicionales')
      })
      .catch(e => {
        alert(e.message)
        console.error(e)
      })
  }

  if (loading) return <Spinner />

  const handleStockQuantity = () => {
    const quantity = product.stock
    
    if (quantity < 1) {
      return (
        <span className='text-red-600'>
          Sin stock
        </span>
      )
    }

    if (quantity === 1) {
      return (
        <span className='text-red-600'>
          Ultima unidad
        </span>
      )
    }

    if (quantity < 5) {
      return (
        <span className='text-orange-400 font-semibold'>
          Bajo
        </span>
      )
    }

    if (quantity < 10) {
      return (
        <span className='text-yellow-400 font-semibold'>
          Medio
        </span>
      )
    }

    return (
      <span className='text-green-600 font-semibold'>
        Alto
      </span>
    )
  }

  const isSame = aditionalData.weight === originalAditionalData.weight && aditionalData.volume === originalAditionalData.volume

  return (
    <section className='flex relative flex-col items-center h-full w-[90%] min-h-[600px] gap-y-10 pb-14 pt-5 max-md:pt-10'>
      <header className='w-[100%] relative h-full flex max-md:flex-col max-md:items-center sm:p-5 rounded-3xl py-5 gap-5'>
        <section className='relative w-[60%] max-md:w-full h-full sm:mt-5 sm:min-h-[620px] min-h-[500px] sm:pb-10 sm:p-5 max-sm:px-1 rounded-lg'>
          {(product.stock <= 0) && (
            <span className='absolute top-[35%] max-md:text-3xl max-md:top-[33%] max-md:right-[12%] max-md:px-14 right-[15%] -rotate-12 z-20 italic bg-blue-400/70 tracking-widest text-white text-5xl px-10 font-semibold py-1 rounded-full'>
              INGRESANDO
            </span>
          )}
          <span className='text-sm text-[#eee] tracking-wide w-full'>
            SKU: {product.sku}
          </span>

          <h1 className='text-2xl text-[#eee] font-semibold max-sm:text-xl mb-5'>
            {product.name.replace(/EAN(?::\s*|\s+)\d{5,}/gi, '')}
          </h1>

          {loading
            ? <div><Spinner /></div>
            : <ImageSlider loadedImages={product.img_urls}/>
          }

          {/* { product.brand.toLowerCase() === 'drean' &&
            <img src='https://technologyline.com.ar/banners-images/Assets/DREAN_WEEK.svg' className='absolute h-8 top-0 right-3'/>
          } */}
        </section>

        <section className='flex tracking-wider gap-4 flex-col w-[40%] mt-5 min-h-[620px] max-sm:min-h-[500px] justify-center items-center h-fit max-md:w-full border rounded-lg py-8 px-1 max-sm:py-5 sm:mb-10 shadow-lg'>
          <div className='flex flex-col gap-y-2 w-[90%]'>
            <div className='flex flex-col w-full gap-y-3 justify-center'>
              {/*SECCION DE PRECIOS*/}
              <section className='flex flex-col items-start w-full gap-1 border-b pb-4 border-slate-600'>
                <span className='text-xl uppercase text-white'>Precio de lista</span>
                <span className='text-4xl font-bold text-white tracking-tight'>
                  {`$ ${useFormattedPrice(product.price_list_4)}`}
                </span>
                <span className='text-blue-300 text-sm font-semibold'>
                  Precio sin impto. nac: {`$ ${useFormattedPrice(product.price_list_4 / ((product.tax_percentage / 100) + 1))}`}
                </span>
              </section>

              {/*SECCION DE CUOTAS*/}
              <section className='flex flex-col w-full gap-2 py-1'>
                <div className='flex items-center gap-2 text-blue-300 font-medium'>
                  <span className='text-sm'>3 cuotas sin interés de {`$${(parseFloat(product.price_list_4) / 3).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                  <img className='h-4 object-contain' src='https://technologyline.com.ar/banners-images/Assets/Some-icons/card-icon2.svg' alt="Visa"/>
                  <img className='h-4 object-contain' src='https://technologyline.com.ar/banners-images/Assets/Some-icons/card-icon3.svg' alt="MasterCard" />
                  <img className='h-4 object-contain' src='https://technologyline.com.ar/banners-images/Assets/Some-icons/card-icon1.svg' alt="Naranja" />
                </div>
                <div className='flex items-center gap-3 text-blue-300 font-medium'>
                  <span className='text-sm'>6 cuotas sin interes de {`$${(parseFloat(product.price_list_4) / 6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                  <div className='flex items-center gap-2'>
                    <img className='h-4 object-contain' src='https://technologyline.com.ar/banners-images/Assets/Some-icons/card-icon2.svg' alt="Visa"/>
                    <img className='h-4 object-contain' src='https://technologyline.com.ar/banners-images/Assets/Some-icons/card-icon3.svg' alt="MasterCard" />
                    <img className='h-5 object-contain' src='https://technologyline.com.ar/banners-images/Assets/Some-icons/card-icon1.svg' alt="Naranja" />
                  </div>
                </div>
              </section>

              {/* PROMO EFECTIVO/TRANSFERENCIA */}
              <section className='w-full pt-2'>
                <div className='bg-blue-900/30 border border-blue-700/50 rounded-xl p-4 flex flex-col gap-1 shadow-sm hover:shadow-md transition-shadow duration-300'>
                  <div className='flex justify-between items-center'>
                    <span className='text-blue-300 font-bold text-xs uppercase tracking-wider'>Promo Efectivo / Transferencia / 1 Pago Tarjeta de crédito/débito con contactless (presencial) </span>
                  </div>
                  <div className='flex items-baseline gap-2'>
                    <span className='text-2xl font-black text-blue-400'>{`$${useFormattedPrice(product.price_list_2)}`}</span>
                    <span className='text-xs text-green-400 font-semibold'>(Ahorras: ${((product.price_list_2 - product.price_list_4) * -1).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* SECCIÓN DE ENVÍO */}
          <div className='bg-slate-50 border border-slate-200 rounded-2xl w-[90%] overflow-hidden shadow-sm'>
            <div className='p-4 bg-white border-b border-slate-100'>
              <div className='flex flex-col gap-3'>
                <div className='flex items-center gap-2 text-page-blue-normal'>
                  <FaTruck className='text-lg' />
                  <span className='text-xs font-bold uppercase tracking-wider'>Calcular envío</span>
                </div>
                
                <div className='relative flex items-center'>
                  <FaMapMarkerAlt className='absolute left-3 text-slate-400 text-sm' />
                  <input 
                    type="number" 
                    value={userCP}
                    min="0"
                    step="1" // Refuerza que sean enteros
                    onKeyDown={(e) => {
                      // Bloquea el punto (.), la coma (,), el signo menos (-) y la 'e' (exponenciales)
                      if (['.', ',', '-', 'e', 'E'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Solo actualiza si el valor es una cadena de dígitos vacía o numérica
                      if (/^\d*$/.test(val)) {
                        setUserCP(val);
                      }
                    }}
                    className='w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-page-blue-normal outline-none transition-all'
                    placeholder="Ingresá tu CP..."
                  />
                </div>
              </div>
            </div>

            <div className='p-4 min-h-[80px] flex items-center justify-center'>
              {loadingShipping ? (
                <div className='flex flex-col items-center gap-2'>
                  <span className='text-[10px] text-slate-400 animate-pulse'>Calculando costos...</span>
                </div>
              ) : hasNoVolume ? (
                /* MENSAJE DE WHATSAPP SI NO HAY VOLUMEN */
                <div className='flex flex-col items-center gap-2 bg-amber-50 p-3 rounded-lg w-full border border-amber-100'>
                  <p className='text-[11px] font-bold text-amber-700 text-center uppercase tracking-tighter leading-tight'>
                    Lo sentimos, no pudimos calcular el envío automáticamente
                  </p>
                  <a 
                    href="https://wa.me/5491131019901" 
                    target="_blank" 
                    rel="noreferrer"
                    className='text-[10px] bg-green-500 text-white px-4 py-1.5 rounded-full font-bold hover:bg-green-600 transition-colors shadow-sm'
                  >
                    CONSULTAR POR WHATSAPP
                  </a>
                </div>
              ) : notFound ? (
                <div className='flex items-center gap-3 bg-red-50 p-3 rounded-lg w-full border border-red-100'>
                  <FaExclamationTriangle className='text-red-400 text-xl' />
                  <div>
                    <p className='text-xs font-bold text-red-700'>Lo sentimos, no llegamos a tu zona.</p>
                    <p className='text-[10px] text-red-500'>Probá con otro código postal cercano.</p>
                  </div>
                </div>
              ) : shippingResult ? (
                <div className='w-full space-y-2'>
                  <div className='flex flex-col justify-between items-center'>
                    <div className='flex flex-col items-center w-full'>
                      <span className='text-[11px] uppercase font-bold text-slate-400'>Costo estimado</span>
                      <span className='text-2xl font-black text-slate-800'>
                        ${shippingResult.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <span className='text-[11px] uppercase font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full'>
                      Llega en {shippingResult.time} días
                    </span>
                  </div>
                </div>
              ) : (
                <p className='text-xs text-slate-400 text-center italic'>
                  Ingresá un CP válido para ver opciones de entrega.
                </p>
              )}
            </div>
          </div>
          
          {/* STOCK Y BOTONES */}
          <div className='flex pt-5 max-md:justify-center flex-col w-full gap-5 items-center'>
            <span className='text-sm uppercase tracking-widest font-semibold text-gray-50'>
              DISPONIBILIDAD: {handleStockQuantity()}
            </span>
            <button
              onClick={() => completeOrder({ product })}
              className='max-sm:hidden bg-blue-500/50 backdrop-blur-lg active:text-sm active:duration-0 rounded-xl flex items-center justify-center text-sm font-bold duration-300 border border-gray-300 text-white py-1 px-2 w-[90%] h-[50px] cart hover:brightness-105'
            >
              REALIZAR PEDIDO
            </button>
            <button
              onClick={() => addProductToCart({ product })}
              className='max-sm:hidden gap-3 bg-blue-200/80 backdrop-blur-lg active:text-sm active:duration-0 rounded-xl flex items-center justify-center text-sm font-bold duration-300 border border-gray-300 text-page-blue-normal py-1 px-2 w-[90%] h-[50px] cart hover:brightness-105'
            >
              <FaCartPlus className="text-xl max-sm:text-lg"/>
              <span>AGREGAR AL CARRITO</span>
            </button>
          </div>

          {/* DATOS ADICIONALES */}
          <div className='flex flex-col text-white w-full justify-center items-center gap-5 mt-5 border-t border-gray-300 pt-5'>
            <h3 className='text-white'>Datos adicionales </h3>

            <article className='flex gap-2'>
              <label htmlFor="weight" className='min-w-[110px] text-white'>Peso (kg): </label>
              <input
                className='outline-none px-2 max-w-[150px] text-white border-[#777] border bg-transparent hover:border-x-white hover:border-t-white focus:border-x-white focus:border-t-white rounded-lg duration-300'
                type="text"
                name="weight"
                id="weight"
                autoComplete='off'
                value={aditionalData.weight}
                onChange={handleInputChange}
              />
            </article>

            <article className='flex gap-2'>
              <label htmlFor="volume" className='min-w-[110px] text-white'>Volumen (m³): </label>
              <input
                value={aditionalData.volume}
                onChange={handleInputChange}
                className='outline-none px-2 max-w-[150px] text-white border-[#777] border bg-transparent hover:border-x-white hover:border-t-white focus:border-x-white focus:border-t-white rounded-lg duration-300'
                type="text"
                name="volume"
                id="volume"
                autoComplete='off'
              />
            </article>

            <button
              onClick={() => saveAditionalData()}
              className='bg-green-500 hover:bg-green-600 text-white min-w-[200px] mx-auto font-bold py-2 px-4 rounded-lg duration-300 disabled:bg-green-500/50 disabled:hover:bg-green-500/50'
              disabled={isSame}
            >
              Guardar
            </button>
          </div>
        </section>
      </header>

      {showEditor && (
        <RichEditor
          initialValue={editingField === 'desc' ? description : editingField === 'spec' ? specifications : faq}
          title={editingField === 'desc' ? 'Descripción' : editingField === 'spec' ? 'Especificaciones' : 'FAQ'}
          onSave={(content) => {
            const field = editingField === 'desc' ? 'descriptions' : editingField === 'spec' ? 'specifications' : 'faq'
            handleEditField(field, content)
            setShowEditor(false)
          }}
          onClose={() => setShowEditor(false)}
        />
      )}

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
          <span className='py-1'>|</span>
          <span
            onClick={() => setDescriptionMenu('faq')}
            className={`${descriptionMenu === 'faq' ? 'text-white' : ''} font-bold hover:font-bold hover:text-white rounded-xl px-2 py-1 duration-300 cursor-pointer`}>
            FAQ
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
            : descriptionMenu === 'spec'
              ? (
              <div>
                <div
                  className='flex flex-col px-4 py-2 text-black'
                  dangerouslySetInnerHTML={{ __html: specifications || 'Este articulo no posee especificaciones.' }} />
                <span onClick={() => editField('spec')} className='absolute text-blue-400 hover:text-black cursor-pointer top-0 right-2 duration-300'>Editar</span>
              </div>
                )
              : (
              <div>
                <div
                  className='flex flex-col px-4 py-2 text-black'
                  dangerouslySetInnerHTML={{ __html: faq || 'Este articulo no posee preguntas frecuentes.' }} />
                <span onClick={() => editField('faq')} className='absolute text-blue-400 hover:text-black cursor-pointer top-0 right-2 duration-300'>Editar</span>
              </div>
                )}
        </div>
      </div>
    </section>
  )
}


          {/* SECCIÓN DE MERCADOLIBRE*/}
          {/* <div className='flex max-md:justify-center flex-col w-[90%] gap-2 items-center'>
            <div className='w-full bg-blue-50 border flex-col border-blue-100 rounded-xl p-3 flex gap-3 items-start shadow-sm'>
              <div className='flex gap-2'>
                <div className='bg-blue-100 p-2 rounded-full text-blue-600 h-8 w-8'>
                  <FaExclamationTriangle className='text-sm' />
                </div>
                <p className='text-[13px] leading-relaxed text-blue-800 font-medium'>
                  También podés financiar tu compra en cuotas mediante nuestra tienda de Mercado Libre. <br /> (En caso de no encontrar la publicación, podés <a href={`https://wa.me/541133690584?text=Hola, queria consultar sobre la financiación en cuotas de este producto: SKU: ${product.sku} - Nombre:${product.name}`} target="_blank" rel="noreferrer" className='font-bold underline decoration-blue-300 hover:text-blue-600 transition-colors'>consultarnos por WhatsApp</a>).
                </p>
                </div>
              <div className='w-full flex items-center justify-center  mt-0.5'>
                <p className='p-2 animate-bounce rounded-full text-sm bg-blue-100 text-blue-600'>
                  <FaArrowAltCircleDown className='text-lg' />
                </p>
              </div>
            </div>
            <MeliStats /> 
          </div> */}