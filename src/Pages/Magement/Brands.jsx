import { useEffect, useState } from "react";
import axios from "axios";
import { FaPen, FaTrash, FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight } from "react-icons/fa";

const API_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_URL_PROD : import.meta.env.VITE_API_URL_DEV;

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [addError, setAddError] = useState("");
  const [editError, setEditError] = useState("");
  const [loading, setLoading] = useState(true);
  const [newBrand, setNewBrand] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [editName, setEditName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchBrands();
    }, []);

  const fetchBrands = () => {
    setLoading(true);
    axios.get(`${API_URL}/api/products/manage/brands`)
      .then(res => {
        setBrands(res.data);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  const handleAddBrand = (e) => {
    e.preventDefault();
    const trimmedName = newBrand.trim();
    if (!trimmedName || trimmedName.length < 3) {
      setAddError("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    setAddError("");
    axios.post(`${API_URL}/api/products/manage/brands`, { name: trimmedName })
      .then(() => {
        setNewBrand("");
        fetchBrands();
      })
      .catch(e => console.error(e));
  };

  const openEditModal = (brand) => {
    setEditBrand(brand);
    setEditName(brand.name);
    setEditModal(true);
  };

  const handleEditBrand = (e) => {
    e.preventDefault();
    const trimmedEditName = editName.trim();
    if (!trimmedEditName || trimmedEditName.length < 3) {
      setEditError("El nombre debe tener al menos 3 caracteres.");
      return;
    }
    setEditError("");
    axios.patch(`${API_URL}/api/products/manage/brands/${editBrand.id}`, { name: trimmedEditName })
      .then(() => {
        setEditModal(false);
        setEditBrand(null);
        fetchBrands();
      })
      .catch(e => console.error(e));
  };

  const handleDisableBrand = (id) => {
    axios.delete(`${API_URL}/api/products/manage/brands/${id}`)
      .then(() => fetchBrands())
      .catch(e => console.error(e));
  };

  const totalPages = Math.ceil(brands.length / itemsPerPage);
  const displayedBrands = brands.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleActivateBrand = (id) => {
    axios.patch(`${API_URL}/api/products/manage/brands/${id}`, { activo: 1 })
      .then(() => fetchBrands())
      .catch(e => console.error(e));
  };

  return (
    <div className="flex flex-1 gap-5 flex-col w-3/4 max-sm:w-full p-5">
      <h1 className='text-2xl w-full text-center text-white underline'>Gestión de Marcas</h1>
      <form className="flex flex-col text-white gap-4" onSubmit={handleAddBrand}>
        <section className="bg-black/20 w-full p-4 rounded flex gap-2 items-center">
          <label className='min-w-[130px]' htmlFor="newBrand">Nombre:</label>
          <input
            id="newBrand"
            type="text"
            value={newBrand}
            onChange={e => setNewBrand(e.target.value.toLowerCase())}
            placeholder="Nombre de la marca"
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
            ) : displayedBrands.length === 0 ? (
              <tr><td colSpan={2} className="text-center p-4">No hay marcas</td></tr>
            ) : displayedBrands.map(brand => (
              <tr key={brand.id} className="border-b">
                <td className={`p-2 font-bold ${brand.activo === 0 ? 'text-red-600' : 'text-white'}`}>{brand.name}</td>
                <td className="p-2 flex gap-2">
                  <button title="Editar" onClick={() => openEditModal(brand)} className="bg-green-500 px-3 py-1 rounded text-white flex items-center justify-center"><FaPen /></button>
                  {brand.activo === 0 ? (
                    <button title="Activar" onClick={() => handleActivateBrand(brand.id)} className="bg-green-500 px-3 py-1 rounded text-white">Activar</button>
                  ) : (
                    <button title="Desactivar" onClick={() => handleDisableBrand(brand.id)} className="bg-red-600 px-3 py-1 rounded text-white flex items-center justify-center"><FaTrash /></button>
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
            <h3 className="text-lg font-bold mb-4 text-blue-700">Editar Marca</h3>
            <form onSubmit={handleEditBrand} className="flex flex-col gap-3">
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
