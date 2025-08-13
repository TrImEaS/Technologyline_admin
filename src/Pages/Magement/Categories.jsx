import { useEffect, useState } from "react";
import axios from "axios";
import { FaPen, FaTrash, FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight } from "react-icons/fa";

const API_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_URL_PROD : import.meta.env.VITE_API_URL_DEV;

export default function Categories() {
  const [addError, setAddError] = useState("");
  const [editError, setEditError] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    setLoading(true);
    axios.get(`${API_URL}/api/products/manage/categories`)
      .then(res => {
        console.log('Categorías recibidas:', res.data);
        setCategories(res.data);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const trimmedName = newCategory.trim();
    if (!trimmedName || trimmedName.length < 3) {
      setAddError("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    setAddError("");
    axios.post(`${API_URL}/api/products/manage/categories`, { name: trimmedName })
      .then(() => {
        setNewCategory("");
        fetchCategories();
      })
      .catch(e => console.error(e));
  };

  const openEditModal = (cat) => {
    setEditCategory(cat);
    setEditName(cat.name);
    setEditModal(true);
  };

  const handleEditCategory = (e) => {
    e.preventDefault();
    const trimmedEditName = editName.trim();
    if (!trimmedEditName || trimmedEditName.length < 3) {
      setEditError("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    setEditError("");
    axios.patch(`${API_URL}/api/products/manage/categories/${editCategory.id}`, { name: trimmedEditName })
      .then(() => {
        setEditModal(false);
        setEditCategory(null);
        fetchCategories();
      })
      .catch(e => console.error(e));
  };

  const handleDisableCategory = (id) => {
    axios.delete(`${API_URL}/api/products/manage/categories/${id}`)
      .then(() => fetchCategories())
      .catch(e => console.error(e));
  };

  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const displayedCategories = categories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleActivateCategory = (id) => {
    axios.patch(`${API_URL}/api/products/manage/categories/${id}`, { activo: 1 })
      .then(() => fetchCategories())
      .catch(e => console.error(e));
  };

  return (
    <div className="flex flex-1 gap-5 flex-col w-3/4 max-sm:w-full p-5">
      <h1 className='text-2xl w-full text-center text-white underline'>Gestión de Categorías</h1>
      <form className="flex flex-col text-white gap-4" onSubmit={handleAddCategory}>
        <section className="bg-black/20 w-full p-4 rounded flex gap-2 items-center">
          <label className='min-w-[130px]' htmlFor="newCategory">Nombre:</label>
          <input
            id="newCategory"
            type="text"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value.toLowerCase())}
            placeholder="Nombre de la categoría"
            className="text-black outline-none px-2 py-1 w-full"
          />
          <button type="submit" className="bg-blue-600 p-2 rounded">Agregar</button>
        </section>
        {addError && <span className="text-red-500 font-bold mt-1">{addError}</span>}
      </form>

      <section className="bg-black/20 w-full p-4 rounded flex flex-col gap-2">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Nombre</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={2} className="text-center p-4">Cargando...</td></tr>
            ) : displayedCategories.length === 0 ? (
              <tr><td colSpan={2} className="text-center p-4">No hay categorías</td></tr>
            ) : displayedCategories.map(cat => (
              <tr key={cat.id} className="border-b">
                <td className={`p-2 font-bold ${cat.activo === 0 ? 'text-red-600' : 'text-white'}`}>{cat.name}</td>
                <td className="p-2 flex gap-2">
                  <button title="Editar" onClick={() => openEditModal(cat)} className="bg-green-500 px-3 py-1 rounded text-white flex items-center justify-center"><FaPen /></button>
                  {cat.activo === 0 ? (
                    <button title="Activar" onClick={() => handleActivateCategory(cat.id)} className="bg-green-500 px-3 py-1 rounded text-white">Activar</button>
                  ) : (
                    <button title="Desactivar" onClick={() => handleDisableCategory(cat.id)} className="bg-red-600 px-3 py-1 rounded text-white flex items-center justify-center"><FaTrash /></button>
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
            <h3 className="text-lg font-bold mb-4 text-blue-700">Editar Categoría</h3>
            <form onSubmit={handleEditCategory} className="flex flex-col gap-3">
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value.toLowerCase())}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                autoFocus
              />
              {editError && <span className="text-red-500 font-bold mt-1">{editError}</span>}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setEditModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
