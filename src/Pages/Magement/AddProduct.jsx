import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import { useDropzone } from 'react-dropzone'
import { FaTimes } from 'react-icons/fa'
import RichEditor from '../../Components/Editor/RichEditor'
import Swal from 'sweetalert2'

const API_URL = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_API_URL_PROD
  : import.meta.env.VITE_API_URL_DEV

export default function AddProduct() {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    stock: '',
    category: '',
    sub_category: '',
    brand: '',
    descriptions: '',
    specifications: '',
    weight: '',
    volume: '',
    tax_percentage: '',
    gbp_id: '',
    images: [],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const numericFields = ['stock', 'weight', 'volume', 'tax_percentage', 'gbp_id']
  const [categories, setCategories] = useState([])
  const [originalSubcategories, setOriginalSubcategories] = useState([])
  const [subCategories, setSubcategories] = useState([])
  const [brands, setBrands] = useState([])
  const [openEditor, setOpenEditor] = useState(null)

  useEffect(() => {
    const timestamp = new Date().getTime()
    axios.get(`${API_URL}/api/products/getCategories?t=${timestamp}`)
    .then(res => setCategories(res.data))
    .catch(e => error.log('Error fetching categories:', e))
    
    axios.get(`${API_URL}/api/products/getSubcategories?t=${timestamp}`)
    .then(res => {
      setOriginalSubcategories(res.data)
      setSubcategories(res.data)
    })
    .catch(e => error.log('Error fetching subcategories:', e))

    axios.get(`${API_URL}/api/products/getBrands?t=${timestamp}`)
    .then(res => {
      setBrands(res.data)
    })
    .catch(e => error.log('Error fetching brands:', e))
  }, [])

  useEffect(() => {
    document.title = `Crear producto | Technology Line`
  }, [])

  const handleChange = e => {
    const { name, value } = e.target
    if (numericFields.includes(name)) {
      if (!/^(?:\d+(\.\d*)?)?$/.test(value)) return
    }
    if (name === 'sku') {
      return setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }))
    }

    if (name === 'name') {
      return setFormData(prev => ({ ...prev, [name]: value.charAt(0).toUpperCase() + value.slice(1) }))
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const onDrop = useCallback(acceptedFiles => {
    const nuevos = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setFormData(prev => ({ ...prev, images: [...prev.images, ...nuevos] }))
  }, [])

  const removeImage = idx => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { sku, name, stock, category, sub_category, brand, descriptions, specifications, weight, volume, tax_percentage, gbp_id, images } = formData
    const isEmpty = (val) => val === null || val === undefined || String(val).trim() === '';
    
    if (isEmpty(sku)) return Swal.fire('Atención!', 'El SKU no puede estar vacío.', 'warning');
    if (isEmpty(name)) return Swal.fire('Atención!', 'El nombre no puede estar vacío.', 'warning');
    if (isEmpty(stock)) return Swal.fire('Atención!', 'Se requiere indicar stock.', 'warning');
    if (isEmpty(category)) return Swal.fire('Atención!', 'La categoría no puede estar vacía.', 'warning');
    if (isEmpty(sub_category)) return Swal.fire('Atención!', 'La subcategoría no puede estar vacía.', 'warning');
    if (isEmpty(brand)) return Swal.fire('Atención!', 'La marca no puede estar vacía.', 'warning');
    if (isEmpty(descriptions)) return Swal.fire('Atención!', 'La descripcion no puede estar vacía.', 'warning');
    if (isEmpty(specifications)) return Swal.fire('Atención!', 'La especificacion no puede estar vacía.', 'warning');
    if (isEmpty(weight)) return Swal.fire('Atención!', 'Se requiere indicar peso.', 'warning');
    if (isEmpty(volume)) return Swal.fire('Atención!', 'Se requiere indicar volumen.', 'warning');
    if (isEmpty(tax_percentage)) return Swal.fire('Atención!', 'Se requiere indicar porcenaje de IVA.', 'warning');

    if(volume <= 0) return Swal.fire('Atencion!','El volumen no puede ser menor o igual a 0.', 'warning')
    if(weight <= 0) return Swal.fire('Atencion!','El peso no puede ser menor o igual a 0.', 'warning')
    if(tax_percentage <= 0) return Swal.fire('Atencion!','El IVA no puede ser menor o igual a 0.', 'warning')
    if(sku.length < 6) return Swal.fire('Atencion!','El SKU debe tener al menos 6 caracteres.', 'warning')
    if(name.length < 3) return Swal.fire('Atencion!','El nombre debe tener al menos 3 caracteres.', 'warning')

    try {
      // Primero subir las imágenes
      const uploadedImages = []
      for (let i = 0; i < images.length; i++) {
        const formData = new FormData()
        formData.append('image', images[i].file)
        formData.append('sku', sku.trim().toUpperCase())
        formData.append('index', i)
        
        const { data } = await axios.post(`${API_URL}/api/products/addImage`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        uploadedImages.push(data.imageUrl)
      }

      // Luego crear el producto con las URLs de las imágenes
      const productData = {
        sku: sku.trim().toUpperCase(),
        name: name.trim().toUpperCase(),
        stock: +stock,
        category: category.trim().toLowerCase(),
        sub_category: sub_category.trim().toLowerCase(),
        brand: brand.trim().toUpperCase(),
        descriptions: descriptions.trim(),
        specifications: specifications.trim(),
        weight: parseFloat(weight),
        volume: parseFloat(volume),
        tax_percentage: parseFloat(tax_percentage),
        gbp_id: +gbp_id,
        images: uploadedImages
      }

      await axios.post(`${API_URL}/api/products/`, productData)
      
      Swal.fire('Éxito', 'Producto creado exitosamente!', 'success')
      // Resetear el formulario después de éxito
      setFormData({
        sku: '',
        name: '',
        stock: '',
        category: '',
        sub_category: '',
        brand: '',
        descriptions: '',
        specifications: '',
        weight: '',
        volume: '',
        tax_percentage: '',
        gbp_id: '',
        images: [],
      })
    } catch (error) {
      console.error('Error:', error)
      Swal.fire('Error', `Ocurrió un error al crear producto\nDetalle: ${error.response?.data?.error || error.message}`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 gap-5 flex-col w-3/4 max-sm:w-full p-5">
      <h1 className='text-2xl w-full text-center text-white underline'>Crear nuevo producto</h1>
      <form onSubmit={handleSubmit} className="flex flex-col text-white gap-4">
        <FormInput label="SKU" name="sku" value={formData.sku} onChange={handleChange} minLength={6} placeholder="Ej: ABC123" />
        <FormInput label="Nombre" name="name" value={formData.name} onChange={handleChange} minLength={3} placeholder="Ej: Producto lorem ipsum 123 MOD: EJ102" />
        <FormInput label="Stock" name="stock" value={formData.stock} onChange={handleChange} placeholder="Ej: 10" />
        <FormSelect
          label="Categoría"
          name="category"
          value={formData.category}
          onChange={e => {
            handleChange(e)
            const catId = Number(e.target.value)
            setFormData(prev => ({ ...prev, sub_category: '' }))
            setSubcategories(originalSubcategories.filter(sc => +sc.category_id === +catId))
          }}
          options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
          placeholder="Seleccionar categoría"
        />
        <FormSelect
          label="Subcategoría"
          name="sub_category"
          value={formData.sub_category}
          onChange={handleChange}
          options={subCategories.map(sub => ({ value: sub.id, label: sub.name }))}
          placeholder="Seleccionar subcategoría"
          disabled={!formData.category}
        />
        <FormSelect
          label="Marca"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          options={brands.map(sub => ({ value: sub.id, label: sub.name.toUpperCase() }))}
          placeholder="Seleccionar marca"
        />
        <FormButton label="Descripción" value={formData.descriptions} onClick={() => setOpenEditor('descriptions')} />
        <FormButton label="Especificaciones" value={formData.specifications} onClick={() => setOpenEditor('specifications')} />
        <FormInput label="Peso" name="weight" value={formData.weight} onChange={handleChange} />
        <FormInput label="Volumen" name="volume" value={formData.volume} onChange={handleChange} />
        <FormInput label="Porcentaje de IVA" name="tax_percentage" value={formData.tax_percentage} onChange={handleChange} />
        <FormInput label="GBP ID" name="gbp_id" value={formData.gbp_id} onChange={handleChange} />

        <section {...getRootProps()} className="bg-black/20 w-full p-4 rounded flex flex-col items-center justify-center border-2 border-dashed cursor-pointer">
          <input {...getInputProps()} />
          {isDragActive
            ? <p className='text-xl pb-4'>Suelta las imágenes aquí...</p>
            : <p className='text-xl pb-4'>Arrastrá o hacé click para subir imágenes</p>
          }
          {formData.images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.images.map((img, i) => (
                <div key={i} className="relative w-20 h-20">
                  <button
                    onClick={e => { e.stopPropagation(); removeImage(i) }}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    <FaTimes />
                  </button>
                  <img src={img.preview} className="w-full h-full object-cover rounded" />
                </div>
              ))}
            </div>
          )}
        </section>
        <button 
          className="bg-blue-600 p-2 mt-4 rounded disabled:opacity-50" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </button>
      </form>

      {openEditor && (
        <RichEditor
          initialValue={formData[openEditor]}
          title={openEditor === 'descriptions' ? 'Descripción' : 'Especificaciones'}
          onClose={() => setOpenEditor(null)}
          onSave={(val) => {
            setFormData(prev => ({ ...prev, [openEditor]: val }))
            setOpenEditor(null)
          }}
        />
      )}
    </div>
  )
}

function FormInput({ label, name, value, onChange, placeholder = '', minLength = 0 }) {
  return (
    <section className="bg-black/20 w-full p-4 rounded flex gap-2 items-center">
      <label className='min-w-[130px]' htmlFor={name}>{label}:</label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        minLength={minLength}
        placeholder={placeholder}
        className="text-black outline-none px-2 py-1 w-full"
      />
    </section>
  )
}

function FormSelect({ label, name, value, onChange, options = [], placeholder = '', disabled = false }) {
  return (
    <section className="bg-black/20 w-full p-4 rounded flex gap-2 items-center">
      <label className='min-w-[130px]' htmlFor={name}>{label}:</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="text-black outline-none px-2 py-1 w-full"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </section>
  )
}

function FormButton({ label, value, onClick }) {
  return (
    <section className="bg-black/20 w-full p-4 rounded flex justify-between items-center">
      <span>{label}:</span>
      <button type="button" onClick={onClick} className="bg-green-500 px-3 py-1 rounded text-white">
        {value ? 'Editar' : 'Agregar'}
      </button>
    </section>
  )
}
