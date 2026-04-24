import { useState, useEffect, useRef } from 'react'
import { FaFolder, FaFolderPlus, FaTrash, FaFileArrowUp, FaFile, FaChevronLeft, FaPen } from 'react-icons/fa6'

const API_URL = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_API_URL_PROD
  : import.meta.env.VITE_API_URL_DEV

export default function Informes() {
  const [tree, setTree] = useState([])
  const [path, setPath] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [renamingItem, setRenamingItem] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const fileInputRef = useRef(null)

  const fetchTree = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/informes/tree`)
      const json = await res.json()
      setTree(json.children || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchTree() }, [])

  const currentItems = (() => {
    let items = tree
    for (const seg of path) {
      const folder = items.find(i => i.name === seg && i.type === 'folder')
      if (!folder) return []
      items = folder.children || []
    }
    return items
  })()

  const fullPath = (name) => path.length ? `${path.join('/')}/${name}` : name

  const createFolder = async () => {
    if (!newFolderName.trim()) return
    await fetch(`${API_URL}/api/informes/folder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: fullPath(newFolderName.trim()) })
    })
    setNewFolderName('')
    setShowNewFolder(false)
    fetchTree()
  }

  const deleteFolder = async (name) => {
    if (!confirm(`¿Eliminar carpeta "${name}" y todo su contenido?`)) return
    await fetch(`${API_URL}/api/informes/folder`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: fullPath(name) })
    })
    fetchTree()
  }

  const deleteFile = async (name) => {
    if (!confirm(`¿Eliminar archivo "${name}"?`)) return
    await fetch(`${API_URL}/api/informes/file`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: fullPath(name) })
    })
    fetchTree()
  }

  const renameFolder = async () => {
    if (!renameValue.trim() || !renamingItem) return
    await fetch(`${API_URL}/api/informes/folder/rename`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPath: fullPath(renamingItem), newName: renameValue.trim() })
    })
    setRenamingItem(null)
    setRenameValue('')
    fetchTree()
  }

  const uploadFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', path.join('/'))
    await fetch(`${API_URL}/api/informes/upload`, { method: 'POST', body: formData })
    setUploading(false)
    fileInputRef.current.value = ''
    fetchTree()
  }

  const folders = currentItems.filter(i => i.type === 'folder')
  const files = currentItems.filter(i => i.type === 'file')

  return (
    <div className="w-full max-w-4xl mx-auto p-6 mt-6">
      <h1 className="text-2xl font-bold text-white mb-6">Gestión de Informes</h1>

      <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {path.length > 0 && (
              <button onClick={() => setPath(prev => prev.slice(0, -1))} className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors">
                <FaChevronLeft size={14} />
              </button>
            )}
            <span className="text-white/60 text-sm font-mono">
              /{path.join('/')}
            </span>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setShowNewFolder(true)} className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors">
              <FaFolderPlus size={14} /> Nueva Carpeta
            </button>
            <label className={`flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
              <FaFileArrowUp size={14} /> {uploading ? 'Subiendo...' : 'Subir Archivo'}
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={uploadFile} className="hidden" />
            </label>
          </div>
        </div>

        {showNewFolder && (
          <div className="flex gap-2 mb-4">
            <input
              autoFocus
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createFolder()}
              placeholder="Nombre de la carpeta..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 text-sm placeholder:text-white/40 outline-none focus:border-emerald-500"
            />
            <button onClick={createFolder} className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700">Crear</button>
            <button onClick={() => { setShowNewFolder(false); setNewFolderName('') }} className="px-4 py-2 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20">Cancelar</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-1">
            {folders.map(item => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                {renamingItem === item.name ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && renameFolder()}
                      className="flex-1 px-2 py-1 rounded bg-white/10 text-white text-sm border border-white/20 outline-none"
                    />
                    <button onClick={renameFolder} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded font-bold">OK</button>
                    <button onClick={() => setRenamingItem(null)} className="px-3 py-1 bg-white/10 text-white text-xs rounded">X</button>
                  </div>
                ) : (
                  <>
                    <div
                      onClick={() => setPath(prev => [...prev, item.name])}
                      className="flex items-center gap-3 cursor-pointer flex-1"
                    >
                      <FaFolder className="text-amber-400" size={18} />
                      <span className="text-white font-semibold text-sm">{item.name}</span>
                      <span className="text-white/40 text-xs">{(item.children || []).length} elementos</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setRenamingItem(item.name); setRenameValue(item.name) }} className="p-2 text-white/40 hover:text-white transition-colors" title="Renombrar"><FaPen size={12} /></button>
                      <button onClick={() => deleteFolder(item.name)} className="p-2 text-white/40 hover:text-red-400 transition-colors" title="Eliminar"><FaTrash size={12} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {files.map(item => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-3 flex-1">
                  <FaFile className="text-indigo-400" size={16} />
                  <span className="text-white text-sm">{item.name}</span>
                  <span className="text-white/40 text-xs">{(item.size / 1024).toFixed(0)} KB</span>
                </div>
                <button onClick={() => deleteFile(item.name)} className="p-2 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all" title="Eliminar"><FaTrash size={12} /></button>
              </div>
            ))}

            {folders.length === 0 && files.length === 0 && (
              <div className="text-center py-12 text-white/40 text-sm">
                Esta carpeta está vacía
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
