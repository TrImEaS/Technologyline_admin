import { useState, useCallback, useEffect } from 'react'
import axios from 'axios'
import { useDropzone } from 'react-dropzone'
import { FaTimes } from 'react-icons/fa'
import RichEditor from '../Components/Editor/RichEditor'

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

  const numericFields = ['stock', 'weight', 'volume', 'tax_percentage', 'gbp_id']
  const [categories, setCategories] = useState([])
  const [originalSubcategories, setOriginalSubcategories] = useState([])
  const [subCategories, setSubcategories] = useState([])
  const [brands, setBrands] = useState([])

  // estados para abrir/cerrar editores
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

  return (
    <div className="flex flex-1 gap-5 flex-col w-3/4 max-sm:w-full p-5">
      <h1 className='text-2xl w-full text-center text-white underline'>Crear nuevo producto</h1>
      <form className="flex flex-col text-white gap-4">
        <FormInput label="SKU" name="sku" value={formData.sku} onChange={handleChange} placeholder="Ej: ABC123" />
        <FormInput label="Nombre" name="name" value={formData.name} onChange={handleChange} placeholder="Ej: Producto lorem ipsum 123 MOD: EJ102" />
        <FormInput label="Stock" name="stock" value={formData.stock} onChange={handleChange} placeholder="Ej: 10" />
        <FormSelect
          label="Categoría"
          name="category"
          value={formData.category}
          onChange={e => {
            handleChange(e)
            const catId = Number(e.target.value)
            setFormData(prev => ({ ...prev, sub_category: '' }))
            setSubcategories(originalSubcategories.filter(sc => sc.category_id === catId))
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
          options={brands.map(sub => ({ value: sub.id, label: sub.name }))}
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

        <button type="submit" className="bg-blue-600 p-2 mt-4 rounded">Enviar</button>
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

function FormInput({ label, name, value, onChange, placeholder = '' }) {
  return (
    <section className="bg-black/20 w-full p-4 rounded flex gap-2 items-center">
      <label className='min-w-[130px]' htmlFor={name}>{label}:</label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
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
        <option value="">{placeholder}</option>
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
