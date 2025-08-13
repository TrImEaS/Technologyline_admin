import { useEffect, useState } from "react";
import axios from "axios";
import { FaPen, FaTrash, FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight } from "react-icons/fa";

const API_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_URL_PROD : import.meta.env.VITE_API_URL_DEV;

export default function Subcategories() {
  const [subcategories, setSubcategories] = useState([]);
  const [addError, setAddError] = useState("");
  const [editError, setEditError] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSubcategory, setNewSubcategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editSubcategory, setEditSubcategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, []);

  const fetchSubcategories = () => {
    setLoading(true);
    axios.get(`${API_URL}/api/products/manage/subcategories`)
      .then(res => {
        setSubcategories(res.data);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    axios.get(`${API_URL}/api/products/manage/categories`)
      .then(res => {
        setCategories(res.data);
      })
      .catch(e => console.error(e));
  };

  const handleAddSubcategory = (e) => {
    e.preventDefault();
    const trimmedName = newSubcategory.trim();
    if (!trimmedName || trimmedName.length < 3 || !selectedCategory) {
      setAddError("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    setAddError("");
    const formattedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1);
    axios.post(`${API_URL}/api/products/manage/subcategories`, { name: formattedName, category_id: selectedCategory })
      .then(() => {
        setNewSubcategory("");
        setSelectedCategory("");
        fetchSubcategories();
      })
      .catch(e => console.error(e));
  };

  const openEditModal = (subcat) => {
    setEditSubcategory(subcat);
    setEditName(subcat.name);
    setEditCategoryId(subcat.category_id);
    setEditModal(true);
  };

  const handleEditSubcategory = (e) => {
    e.preventDefault();
    const trimmedEditName = editName.trim();
    if (!editCategoryId) return;
    if (!trimmedEditName || trimmedEditName.length < 3) {
      setEditError("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    setEditError("");
    const formattedEditName = trimmedEditName.charAt(0).toUpperCase() + trimmedEditName.slice(1);
    axios.patch(`${API_URL}/api/products/manage/subcategories/${editSubcategory.id}`, { name: formattedEditName, category_id: editCategoryId })
      .then(() => {
        setEditModal(false);
        setEditSubcategory(null);
        fetchSubcategories();
      })
      .catch(e => {
        console.error('Error al editar subcategoría:', e);
        if (e.response) {
          console.error('Backend response:', e.response.data);
        }
      });
  };

  const handleDisableSubcategory = (id) => {
    axios.delete(`${API_URL}/api/products/manage/subcategories/${id}`)
      .then(() => fetchSubcategories())
      .catch(e => console.error(e));
  };

  const totalPages = Math.ceil(subcategories.length / itemsPerPage);
  const displayedSubcategories = subcategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleActivateSubcategory = (id) => {
    axios.patch(`${API_URL}/api/products/manage/subcategories/${id}`, { activo: 1 })
      .then(() => fetchSubcategories())
      .catch(e => {
        console.error('Error al activar subcategoría:', e);
        if (e.response) {
          console.error('Backend response:', e.response.data);
        }
      });
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : "";
  };

  return (
    <div className="flex flex-1 gap-5 flex-col w-3/4 max-sm:w-full p-5">
      <h1 className='text-2xl w-full text-center text-white underline'>Gestión de Subcategorías</h1>
      <form className="flex flex-col text-white gap-4" onSubmit={handleAddSubcategory}>
        <section className="bg-black/20 w-full p-4 rounded flex gap-2 items-center">
          <label className='min-w-[130px]' htmlFor="newSubcategory">Nombre:</label>
          <input
            id="newSubcategory"
            type="text"
            value={newSubcategory.charAt(0).toUpperCase() + newSubcategory.slice(1)}
            onChange={e => {
              const val = e.target.value;
              setNewSubcategory(val.charAt(0).toUpperCase() + val.slice(1).toLowerCase());
            }}
            placeholder="Nombre de la subcategoría"
            className="text-black outline-none px-2 py-1 w-full"
            disabled={!selectedCategory}
          />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="text-black outline-none px-2 py-1 rounded"
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button type="submit" className="bg-blue-600 p-2 rounded" disabled={!selectedCategory}>Agregar</button>
        </section>
        {addError && <span className="text-red-500 font-bold mt-1">{addError}</span>}
      </form>

      <section className="bg-black/20 w-full p-4 rounded flex flex-col gap-2">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Nombre</th>
              <th className="p-2">Categoría</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center p-4">Cargando...</td></tr>
            ) : displayedSubcategories.length === 0 ? (
              <tr><td colSpan={3} className="text-center p-4">No hay subcategorías</td></tr>
            ) : displayedSubcategories.map(subcat => (
              <tr key={subcat.id} className="border-b">
                <td className={`p-2 font-bold ${subcat.activo === 0 ? 'text-red-600' : 'text-white'}`}>{subcat.name}</td>
                <td className="p-2 text-white font-bold">{getCategoryName(subcat.category_id)}</td>
                <td className="p-2 flex gap-2">
                  <button title="Editar" onClick={() => openEditModal(subcat)} className="bg-green-500 px-3 py-1 rounded text-white flex items-center justify-center"><FaPen /></button>
                  {subcat.activo === 0 ? (
                    <button title="Activar" onClick={() => handleActivateSubcategory(subcat.id)} className="bg-green-500 px-3 py-1 rounded text-white">Activar</button>
                  ) : (
                    <button title="Desactivar" onClick={() => handleDisableSubcategory(subcat.id)} className="bg-red-600 px-3 py-1 rounded text-white flex items-center justify-center"><FaTrash /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="flex items-center gap-2 mt-4">
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 bg-blue-100 rounded-lg"><FaAngleDoubleLeft /></button>
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 bg-blue-100 rounded-lg"><FaAngleLeft /></button>
        <span className="px-4 bg-blue-500 text-white py-1 rounded-lg font-bold">{currentPage} / {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 bg-blue-100 rounded-lg"><FaAngleRight /></button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 bg-blue-100 rounded-lg"><FaAngleDoubleRight /></button>
      </div>

      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg min-w-[300px]">
            <h3 className="text-lg font-bold mb-4 text-blue-700">Editar Subcategoría</h3>
            <form onSubmit={handleEditSubcategory} className="flex flex-col gap-3">
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                autoFocus
                disabled={!editCategoryId}
              />
              {editError && <span className="text-red-500 font-bold mt-1">{editError}</span>}
              <select
                value={editCategoryId}
                onChange={e => setEditCategoryId(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setEditModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold" disabled={!editCategoryId}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
