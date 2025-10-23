import axios from 'axios'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const API_URL = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_API_URL_PROD
  : import.meta.env.VITE_API_URL_DEV

export default function BrandsCarousel () {
  const STATIC_PATH = import.meta.env.MODE === 'production'
    ? '/home/technologyline/public_html/products-images'
    : 'e:/Xampp/htdocs/Technologyline-API/src/FakeStatic/products-images'
  const [brands, setBrands] = useState([])
  const [allBrands, setAllBrands] = useState([])

  useEffect(() => {
    axios.get(`${API_URL}/api/page/getBrandsForCarousel?t=${Date.now()}`)
      .then(res => setBrands(res.data))
      .catch(err => {
        console.error('Error fetching brands:', err)
      })
    axios.get(`${API_URL}/api/products/manage/brands`)
      .then(res => setAllBrands(res.data))
      .catch(err => {
        console.error('Error fetching all brands:', err)
      })
  }, [])

  const handleEdit = (brand) => {
    const optionsHtml = allBrands
      .map(b => `<option value="${b.id}" ${b.id === brand.id_brand ? 'selected' : ''}>${b.name}</option>`)
      .join('')
    Swal.fire({
      title: 'Editar Marca',
      html: `
        <div class="flex flex-col gap-3 w-full justify-center items-center">
          <div class="flex flex-col gap-1 w-4/5">
            <label class="text-left w-full text-xs font-semibold">Marca</label>
            <select id="swal-brand" class="outline-none w-full p-1 px-2 text-sm border-2 rounded-lg">
              <option value="">Seleccione una marca</option>
              ${optionsHtml}
            </select>
          </div>
          <div class="flex flex-col gap-1 w-4/5">
            <label class="text-left w-full text-xs font-semibold">Imagen</label>
            <input id="swal-img" type="file" accept="image/*" class="text-sm"/>
          </div>
          <div class="flex flex-col gap-1 w-4/5">
            <label class="text-left w-full text-xs font-semibold">Estado</label>
            <select id="swal-active" class="outline-none p-1 px-2 text-sm border-2 rounded-lg w-1/2">
              <option value="1" ${brand.active === 1 ? 'selected' : ''}>Activo</option>
              <option value="0" ${brand.active === 0 ? 'selected' : ''}>Inactivo</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        const id_brand = Number(document.getElementById('swal-brand').value)
        const active = parseInt(document.getElementById('swal-active').value)
        const fileInput = document.getElementById('swal-img')
        let image_path = brand.image_path
        // validar que no se repita la marca
        if (brands.some(b => String(b.id_brand) === String(id_brand) && b.id !== brand.id)) {
          Swal.showValidationMessage('Ya existe una imagen para esta marca')
          return false
        }
        if (fileInput.files.length > 0) {
          const formData = new FormData()
          formData.append('image', fileInput.files[0])
          formData.append('sku', 'BRAND')
          formData.append('index', 1)
          formData.append('newPath', STATIC_PATH)
          try {
            const uploadRes = await axios.post(`${API_URL}/api/products/addImage`, formData)
            image_path = uploadRes.data.imageUrl
          } catch (err) {
            Swal.showValidationMessage('Error al subir la imagen. Intente nuevamente.')
            return false
          }
        }
        return { ...brand, id_brand, active, image_path }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedBrand = result.value
        const updatedList = brands.map(item =>
          +item.id === +updatedBrand.id ? updatedBrand : item
        )
        setBrands(updatedList)
        axios.patch(`${API_URL}/api/page/updateBrandsForCarousel`, {
          path: STATIC_PATH,
          ...updatedBrand
        }).then(() => {
          Swal.fire('Actualizado', 'La marca fue actualizada', 'success')
        }).catch(() => {
          Swal.fire('Error', 'No se pudo actualizar', 'error')
        })
      }
    })
  }

  const handleAddBrandImage = () => {
    let previewUrl = ''
    Swal.fire({
      title: 'Agregar imagen de marca',
      html: `
        <div class="flex flex-col gap-3 w-full justify-center items-center">
          <div class="flex flex-col gap-1 w-4/5">
            <label class="text-left w-full text-xs font-semibold">Marca</label>
            <select id="swal-brand" class="outline-none w-full p-1 px-2 text-sm border-2 rounded-lg">
              <option value="">Seleccione una marca</option>
              ${allBrands.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
            </select>
          </div>
          <div class="flex flex-col gap-1 w-4/5">
            <label class="text-left w-full text-xs font-semibold">Imagen</label>
            <input id="swal-img" type="file" accept="image/*" class="text-sm"/>
            <div id="swal-img-preview" style="margin-top:8px;"></div>
          </div>
          <div class="flex flex-col gap-1 w-4/5">
            <label class="text-left w-full text-xs font-semibold">Estado</label>
            <select id="swal-active" class="outline-none p-1 px-2 text-sm border-2 rounded-lg w-1/2">
              <option value="1">Activo</option>
              <option value="0">Inactivo</option>
            </select>
          </div>
        </div>
      `,
      didOpen: () => {
        const fileInput = document.getElementById('swal-img')
        fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0]
          if (file) {
            const reader = new window.FileReader()
            reader.onload = function (ev) {
              previewUrl = ev.target.result
              document.getElementById('swal-img-preview').innerHTML = `<img src='${previewUrl}' style='max-width:100%;max-height:120px;border-radius:8px;border:1px solid #ccc;' />`
            }
            reader.readAsDataURL(file)
          } else {
            document.getElementById('swal-img-preview').innerHTML = ''
          }
        })
      },
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        const id_brand = document.getElementById('swal-brand').value
        const active = parseInt(document.getElementById('swal-active').value)
        const fileInput = document.getElementById('swal-img')
        let image_path = ''
        if (!id_brand) {
          Swal.showValidationMessage('Seleccione una marca')
          return false
        }
        // validar que no se repita la marca
        if (brands.some(b => String(b.id_brand) === String(id_brand))) {
          Swal.showValidationMessage('Ya existe una imagen para esta marca')
          return false
        }
        if (fileInput.files.length === 0) {
          Swal.showValidationMessage('Seleccione una imagen')
          return false
        }
        const formData = new FormData()
        formData.append('image', fileInput.files[0])
        formData.append('sku', 'BRAND')
        formData.append('index', 1)
        formData.append('newPath', STATIC_PATH)
        try {
          const uploadRes = await axios.post(`${API_URL}/api/products/addImage`, formData)
          image_path = uploadRes.data.imageUrl
        } catch (err) {
          Swal.showValidationMessage('Error al subir la imagen. Intente nuevamente.')
          return false
        }
        return { id_brand, active, image_path }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newBrand = result.value
        axios.post(`${API_URL}/api/page/addBrandForCarousel`, {
          path: STATIC_PATH,
          ...newBrand
        }).then((res) => {
          setBrands(prev => [...prev, res.data])
          Swal.fire('Agregado', 'La imagen fue agregada', 'success')
        }).catch(() => {
          Swal.fire('Error', 'No se pudo agregar', 'error')
        })
      }
    })
  }

  return (
    <div className="flex flex-col gap-10 w-3/4 max-sm:w-full p-5">
      <h1 className='text-2xl w-full text-center text-white underline'>
        Gestión de carousel de marcas
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.map(brand => (
          <div key={brand.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <img
              src={brand.image_path.startsWith('http') ? brand.image_path.replace('8080', '808') : `${API_URL}/products-images/${brand.image_path.replace(/^.*[\\\/]/, '')}`}
              alt={brand.id_brand}
              className="w-full h-40 object-contain rounded"
            />
            <h2 className="mt-2 font-bold text-lg">{brand.id_brand}</h2>
            <p className={`text-sm ${brand.active ? 'text-green-600' : 'text-red-600'}`}>{brand.active ? 'Activo' : 'Inactivo'}</p>
            <button
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => handleEdit(brand)}
            >
              Editar
            </button>
          </div>
        ))}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100" onClick={handleAddBrandImage}>
          <div className="w-full h-40 flex items-center justify-center border-2 border-dashed border-gray-400 rounded">
            <span className="text-5xl text-gray-400 font-bold">+</span>
          </div>
          <h2 className="mt-2 font-bold text-lg text-gray-400">Agregar</h2>
        </div>
      </div>
    </div>
  )
}
