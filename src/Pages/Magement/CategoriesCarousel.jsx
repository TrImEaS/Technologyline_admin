import axios from "axios"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"
import "sweetalert2/dist/sweetalert2.min.css"

const API_URL = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_API_URL_PROD
  : import.meta.env.VITE_API_URL_DEV

export default function CategoriesCarousel() {
  const STATIC_PATH = import.meta.env.MODE === 'production'   
    ? '/home/realcolorweb/public_html/technologyline.com.ar/banners-images/Assets/CategoriesCarousel-images'
    : '/home/subsistemas/Documents/GitHub/Realcolor/Technologyline-API/src/FakeStatic'
  const [newCategories, setNewCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])


  useEffect(() => {
    axios.get(`${API_URL}/api/page/getCategoriesForCarrousel?t=${new Date()}`)
    .then(res => setNewCategories(res.data))
    .catch(e => Swal.fire('Error', 'Error al traer CategoriesCarousel, intente nuevamente!', 'error'))

    axios.get(`${API_URL}/api/products/getSubcategories?t=${new Date()}`)
    .then(res => setSubcategories(res.data))
    .catch(e => Swal.fire('Error', 'Error al traer CategoriesCarousel, intente nuevamente!', 'error'))
  }, [])

  const handleEdit = (cat) => {
    const optionsHtml = subcategories
      .map(subcat =>
        `<option value="${subcat.name}" ${subcat.name === cat.category ? 'selected' : ''}>${subcat.name}</option>`
      )
      .join('')

    Swal.fire({
      title: 'Editar Categoría',
      html: `
        <div class="flex flex-col gap-3 w-full justify-center items-center">
          <div class="flex flex-col gap-1 w-4/5">
            <label class="text-left w-full text-xs font-semibold">Categoría</label>
            <select id="swal-category" class="outline-none w-full p-1 px-2 text-sm border-2 rounded-lg">
              <option value="">Seleccione una categoría</option>
              ${optionsHtml}
            </select>
          </div>
          
          <div class="flex flex-col gap-1 w-4/5">
            <label class="text-left w-full text-xs font-semibold">Imagen</label>
            <input id="swal-img" type="file" accept="image/*" class="text-sm"/>
          </div>

          <div class="flex flex-col gap-1 w-4/5">
            <label class="text-left w-full text-xs font-semibold">Posición</label>
            <input id="swal-position" type="number" class="outline-none p-1 px-2 border-2 rounded-lg text-sm w-full" value="${cat.position}">
          </div>
          
          <div class="flex flex-col gap-1 w-4/5">
            <label class="text-left w-full text-xs font-semibold">Estado</label>
            <select id="swal-active" class="outline-none p-1 px-2 text-sm border-2 rounded-lg w-1/2">
              <option value="1" ${cat.active === 1 ? 'selected' : ''}>Activo</option>
              <option value="0" ${cat.active === 0 ? 'selected' : ''}>Inactivo</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        const name = document.getElementById('swal-category').value
        const position = parseInt(document.getElementById('swal-position').value)
        const active = parseInt(document.getElementById('swal-active').value)
        const fileInput = document.getElementById('swal-img')
        let img_url = cat.img_url

        // Si el usuario selecciona una imagen, subimos primero
        if (fileInput.files.length > 0) {
          const formData = new FormData()
          formData.append('image', fileInput.files[0])
          formData.append('sku', 'CAT')
          formData.append('index', 1)
          formData.append('newPath', STATIC_PATH)

          try {
            const uploadRes = await axios.post(`${API_URL}/api/products/addImage`, formData)
            console.log(uploadRes.data)
            img_url = uploadRes.data.imageUrl
          } catch (err) {
            Swal.showValidationMessage('Error al subir la imagen. Intente nuevamente.')
            return false
          }
        }

        return { ...cat, name, position, active, img_url }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedCat = result.value
        const updatedList = newCategories.map(item =>
          +item.id === +updatedCat.id ? updatedCat : item
        )
        setNewCategories(updatedList)

        axios.patch(`${API_URL}/api/page/updateCategoriesForCarrousel`, {
          path: STATIC_PATH,
          ...updatedCat
        }).then(() => {
          Swal.fire('Actualizado', 'La categoría fue actualizada', 'success')
        }).catch(() => {
          Swal.fire('Error', 'No se pudo actualizar', 'error')
        })
      }
    })
  }

  return (
    <div className="flex flex-col gap-10 w-3/4 max-sm:w-full p-5">
      <h1 className='text-2xl w-full text-center text-white underline'>
        Gestión de carousel de categorías
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {newCategories.map(cat => (
          <div key={cat.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
            <img src={cat.img_url} alt={cat.category} className="w-full h-40 object-contain rounded" />
            <h2 className="mt-2 font-bold text-lg">{cat.category.toUpperCase()}</h2>
            <p className="text-sm text-gray-600">Posición: {cat.position}</p>
            <p className={`text-sm ${cat.active ? 'text-green-600' : 'text-red-600'}`}>
              {cat.active ? 'Activo' : 'Inactivo'}
            </p>
            <button
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => handleEdit(cat)}
            >
              Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
