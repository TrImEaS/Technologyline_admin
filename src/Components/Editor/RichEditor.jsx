import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const RichEditor = ({ initialValue, onSave, onClose, title }) => {
  const [content, setContent] = useState(initialValue);
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }]
    ],
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = `<img src="${e.target.result}" alt="Uploaded content" />`;
        setContent(prev => prev + img);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Editor de {title}</h2>
          <div className="space-x-2">
            <button
              onClick={() => setShowHtmlEditor(!showHtmlEditor)}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              {showHtmlEditor ? 'Editor Visual' : 'Editor HTML'}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        </header>

        <div className="p-4 flex-grow overflow-auto">
          {showHtmlEditor ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[400px] p-2 border rounded font-mono"
            />
          ) : (
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              className="h-[400px] mb-12"
            />
          )}
        </div>

        <footer className="p-4 border-t flex justify-between items-center bg-gray-50">
          {!showHtmlEditor &&
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
              >
                Subir Imagen
              </label>
            </div>
          }
          <button
            onClick={() => onSave(content)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Guardar Cambios
          </button>
        </footer>
      </div>
    </div>
  );
};

export default RichEditor;