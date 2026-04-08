import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Spinner from '../Components/Products/Spinner.jsx'
import axios from 'axios'
import ImageSlider from '../Components/Products/ImageSlider.jsx'
import Editor from '../Components/Editor/Editor.jsx'
import useFormattedPrice from '../Utils/useFormattedPrice.js'
import { FaCartPlus, FaMapMarkerAlt, FaTruck, FaExclamationTriangle } from 'react-icons/fa'
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
    if (!product) return;
    const quantity = product.stock
    
    if (quantity < 1)
      return ( <span className='text-red-600'> Sin stock </span> )

    if (quantity === 1)
      return ( <span className='text-red-600'> Ultima unidad </span> )

    if (quantity < 5)
      return ( <span className='text-orange-400 font-semibold'> Bajo </span> )

    if (quantity < 10)
      return ( <span className='text-yellow-400 font-semibold'> Medio </span> )

    return ( <span className='text-green-600 font-semibold'> Alto </span> )
  }

  const isSame = aditionalData.weight === originalAditionalData.weight && aditionalData.volume === originalAditionalData.volume

  const maxInstallmentsLimit = parseInt(product?.max_installments) || 0;
  
  const availableInstallments = product ? Object.keys(product)
    .filter(key => !isNaN(parseInt(key)) && parseInt(key) > 0 && parseInt(key) <= maxInstallmentsLimit)
    .map(Number)
    .sort((a, b) => b - a) : [];

  const hasPromo = product?.promoPrice && product.promoPrice > 0 && product.promoPrice !== product.basePrice;


  return (
    <section className='flex relative flex-col items-center h-full w-[100%] min-h-[600px] gap-y-10 pb-14 pt-5 max-md:pt-10'>
      <header className='w-[100%] relative h-full flex max-md:flex-col max-md:items-center sm:p-5 rounded-3xl py-5 gap-5'>
        <section className='relative w-[55%] max-md:w-full h-full sm:mt-5 sm:min-h-[620px] min-h-[500px] sm:pb-10 sm:p-5 max-sm:px-1 rounded-lg'>
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
            : <ImageSlider loadedImages={productImages} setLoadedImages={setProductImages} sku={product.sku} id={product.id} />
          }

          {/* { product.brand.toLowerCase() === 'drean' &&
            <img src='https://technologyline.com.ar/banners-images/Assets/DREAN_WEEK.svg' className='absolute h-8 top-0 right-3'/>
          } */}
        </section>

        <section className='flex tracking-wider gap-4 flex-col w-[45%] mt-5 min-h-[620px] max-sm:min-h-[500px] justify-center items-center h-fit max-md:w-full py-8 px-1 max-sm:py-5 sm:mb-10'>
          <div className='flex flex-col gap-y-2 w-[100%]'>
            <div className='flex flex-col w-full gap-y-3 justify-center'>
              {/*SECCION DE PRECIOS*/}
              <section className='flex flex-col items-start w-full gap-1 border-b pb-4 border-slate-600'>
                <span className='text-3xl font-bold text-white max-sm:text-xl tracking-tight'>
                  {`$ ${useFormattedPrice(product.basePrice)}`}
                </span>
                <span className='text-gray-300 text-xs max-sm:text-[10px] font-semibold'>
                  Precio sin impto. nac: {`$ ${useFormattedPrice(product.basePrice / ((product.tax_percentage / 100) + 1))}`}
                </span>
              </section>

              {/*SECCION DE CUOTAS*/}
              <section className='flex flex-col w-full gap-2 py-1'>
                {availableInstallments.map((q) => (
                  <div key={q} className='flex items-center gap-2 text-gray-200 font-medium'>
                    <span className='text-base max-sm:text-[12px]'><b className='font-black text-[#005ea5]'>{q}</b> cuotas <b className='font-black text-[#005ea5]'>sin interes</b> de {`$${(parseFloat(product.basePrice) / q).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
                    <div className='flex items-center gap-2'>
                      <img className='h-5 object-contain' src='https://technologyline.com.ar/banners-images/Assets/Some-icons/logo_visa.webp' alt="Visa" />
                      <img className='h-5 object-contain' src='https://technologyline.com.ar/banners-images/Assets/Some-icons/Mastercard-logo.webp' alt="Mastercard" />
                    </div>
                  </div>
                ))}
              </section>

              {/* PROMO EFECTIVO/TRANSFERENCIA */}
              {hasPromo && (
                <section className='w-full'>
                  <div className='bg-gradient-to-br from-blue-100 to-blue-100/50 border border-blue-600/30 rounded-2xl p-5 flex flex-col gap-1 shadow-sm hover:shadow-md transition-all duration-500 group'>
                    <div className='flex justify-between items-start'>
                      <div className='flex flex-col'>
                        <span className='bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full w-fit tracking-wider uppercase mb-1'>
                          PROMO EXCLUSIVA
                        </span>
                        <h2 className='text-blue-500 max-sm:text-[12px] font-medium text-base tracking-normal'>
                          Pagando con tarjeta de debito o credito en 1 pago de forma presencial obtene un {product.basePrice > 0 ? ((product.basePrice - product.promoPrice) / product.basePrice * 100).toFixed(0) : 0}% de descuento sobre el precio de lista
                        </h2>
                      </div>
                      <div className='bg-blue-100 p-2 max-sm:p-1 rounded-xl  text-blue-600 group-hover:scale-110 transition-transform'>
                        <FaMapMarkerAlt className='text-xl' />
                      </div>
                    </div>

                    <div className='flex flex-col'>
                      <div className='flex items-baseline justify-between'>
                        <span className='text-blue-900/60 font-medium text-sm max-sm:text-[10px] uppercase tracking-widest'>Precio de Promo</span>
                        <span className='text-2xl font-bold text-blue-700 max-sm:text-[17px] tracking-tighter'>{`$ ${useFormattedPrice(product.promoPrice)}`}</span>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-start gap-3 mt-2 bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm'>
                    <FaExclamationTriangle className='text-amber-500 text-lg mt-0.5 flex-shrink-0' />
                    <div className='flex flex-col gap-1'>
                      <span className='font-bold text-amber-800 text-sm uppercase tracking-tight'>Aviso Importante</span>
                      <p className='text-[11px] text-amber-700 leading-relaxed'>
                        También podés acceder a la promo vía transferencia bancaria. 
                        Tené en cuenta que la verificación de la misma demora <span className='font-bold underline'>24hs hábiles</span>.
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* SECCIÓN DE ENVÍO */}
          <div className='bg-slate-50 border flex max-sm:flex-col items-center border-slate-200 rounded-2xl w-[100%] max-sm:w-full overflow-hidden shadow-sm'>
            <div className='p-4 bg-white border-b w-full sm:border-b-0 sm:border-r sm:w-[60%] border-slate-200'>
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
                    className='w-full pl-9 pr-4 py-2 bg-slate-100 border-slate-200 border-2 rounded-xl text-sm focus:ring-2 focus:ring-page-blue-normal outline-none transition-all'
                    placeholder="Ingresá tu CP..."
                  />
                </div>
              </div>
            </div>

            <div className='p-4 min-h-[80px] flex items-center w-full sm:w-[40%] justify-center'>
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
                    className='text-[10px] bg-green-500 text-gray-800 px-4 py-1.5 rounded-full font-bold hover:bg-green-600 transition-colors shadow-sm'
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
                <div className='w-full'>
                  <div className='flex flex-col items-center'>
                    <div className='flex flex-col items-center w-full'>
                      <span className='text-[11px] uppercase font-bold text-slate-500'>Costo estimado</span>
                      <span className='text-xl font-black text-slate-800'>
                        ${shippingResult.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <span className='text-[11px] uppercase font-bold text-[#4398d9] bg-green-50 px-2 rounded-full'>
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
          <div className='flex pt-1 max-md:justify-center flex-col w-full gap-2 items-center'>
            <button
              onClick={() => completeOrder({ product })}
              className='max-sm:hidden bg-blue-600/80 backdrop-blur-lg active:text-sm active:duration-0 rounded-xl flex items-center justify-center text-sm font-bold duration-300 border border-gray-300 text-gray-50 py-1 px-2 w-[100%] h-[50px] cart hover:brightness-105'
            >
              REALIZAR PEDIDO
            </button>
            <button
              onClick={() => addProductToCart({ product })}
              className='max-sm:hidden gap-3 bg-blue-200/80 backdrop-blur-lg active:text-sm active:duration-0 rounded-xl flex items-center justify-center text-sm font-bold duration-300 border border-gray-300 text-page-blue-normal py-1 px-2 w-[100%] h-[50px] cart hover:brightness-105'
            >
              <FaCartPlus className="text-xl max-sm:text-lg"/>
              <span>AGREGAR AL CARRITO</span>
            </button>
          </div>

          {/* DATOS ADICIONALES */}
          <div className='flex flex-col text-white w-full justify-center items-center gap-5 mt-5 bg-blue-400/20 border border-gray-300 rounded-lg p-5'>
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
        <Editor
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