import { useState, useRef, useMemo } from 'react'
import JoditEditor from 'jodit-react'

const Editor = ({ initialValue, onSave, onClose, title }) => {
  const editor = useRef(null)
  const [content, setContent] = useState(initialValue)

  // Configuración completa para un editor moderno
  const config = useMemo(() => ({
    readonly: false, 
    height: 550,
    language: 'es',
    placeholder: 'Empieza a escribir o pega contenido desde Excel/Word aquí...',
    toolbarSticky: false,
    defaultActionOnPaste: 'insert_as_html', // Conserva el formato de Excel/Word al pegar
    buttons: [
      'source', '|',
      'bold', 'strikethrough', 'underline', 'italic', '|',
      'superscript', 'subscript', '|',
      'ul', 'ol', '|',
      'outdent', 'indent', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'table', 'link', '|',
      'align', 'undo', 'redo', '|',
      'hr', 'eraser', 'copyformat', '|',
      'fullsize'
    ],
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false
  }), [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        
        <header className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <h2 className="text-xl font-bold tracking-tight text-gray-800">
            Esta editando: <span className="text-blue-600 font-medium">{title}</span>
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full transition-all duration-200 shadow-sm"
            title="Cerrar"
          >
            ✕
          </button>
        </header>

        <section className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-black">
            <JoditEditor
              ref={editor}
              value={content}
              config={config}
              tabIndex={1} 
              onBlur={newContent => setContent(newContent)}
              onChange={newContent => {}} // Preferimos onChange vacío y usar onBlur para mayor rendimiento
            />
          </div>
        </section>

        <footer className="px-6 py-4 border-t border-gray-100 flex justify-end items-center bg-gray-50/80">
          <button
            onClick={() => onSave(content)}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-200 shadow-md shadow-blue-600/20 flex gap-2 items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Guardar Cambios
          </button>
        </footer>
        
      </div>
    </div>
  )
}

export default Editor
