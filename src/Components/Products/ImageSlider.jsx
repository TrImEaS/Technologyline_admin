import React, { useState, useEffect, useCallback, memo } from "react";
import Spinner from "./Spinner.jsx";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_URL_PROD : import.meta.env.VITE_API_URL_DEV;
const MAX_IMAGES = 10;

const ImageThumbnail = memo(({ imgObj, index, currentIndex, onDelete, onSelect, moveImage }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "image",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: "image",
    hover: (item) => {
      if (item.index !== index) {
        moveImage(item.index, index);
        item.index = index;
      }
    }
  });

  return (
    <div ref={(node) => drag(drop(node))} className={`relative ${isDragging ? "opacity-50" : ""}`}>
      <img
        src={imgObj.previewUrl}
        alt={`Image ${index}`}
        className={`w-16 h-16 object-cover cursor-pointer rounded-lg ${index === currentIndex ? "border-2 border-blue-500" : ""}`}
        onClick={() => onSelect(index)}
      />
      <button
        onClick={() => onDelete(index)}
        className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded-full"
      >
        ×
      </button>
    </div>
  );
});

export default function ImageSlider({ loadedImages, setLoadedImages, id, sku }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localImages, setLocalImages] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (loadedImages.length > 0) {
      setLocalImages(loadedImages.map(url => ({
        previewUrl: url,
        remoteUrl: url,
        isNew: false
      })));
      setLoading(false);
    }
  }, [loadedImages]);

  const handleZoomImage = useCallback((imgObj) => {
    setZoomedImage(prev => {
      const newValue = prev ? null : imgObj?.previewUrl;
      document.body.style.overflowY = newValue ? "hidden" : "visible";
      return newValue;
    });
  }, []);

  const handleDelete = useCallback((index) => {
    setLocalImages(prev => {
      const newImgs = prev.filter((_, i) => i !== index);
      if (currentIndex >= newImgs.length) {
        setCurrentIndex(Math.max(0, newImgs.length - 1));
      }
      return newImgs;
    });
    setHasChanges(true);
  }, [currentIndex]);

  const moveImage = useCallback((dragIndex, hoverIndex) => {
    setLocalImages(prev => {
      const newImgs = [...prev];
      const [moved] = newImgs.splice(dragIndex, 1);
      newImgs.splice(hoverIndex, 0, moved);
      return newImgs;
    });
    setHasChanges(true);
  }, []);

  const navigationProps = {
    prev: {
      onClick: () => setCurrentIndex(prev => (prev - 1 + localImages.length) % localImages.length),
      className: "absolute left-0 bg-gray-800 text-white p-2 rounded-full z-10"
    },
    next: {
      onClick: () => setCurrentIndex(prev => (prev + 1) % localImages.length),
      className: "absolute right-0 bg-gray-800 text-white p-2 rounded-full z-10"
    }
  };

  const handleFiles = (files) => {
    const newImages = Array.from(files).map(file => ({
      previewUrl: URL.createObjectURL(file),
      remoteUrl: null,
      isNew: true,
      file: file
    }));
    setLocalImages(prev => {
      const newImgs = [...prev, ...newImages];
      if (newImgs.length > MAX_IMAGES) {
        newImgs.splice(MAX_IMAGES, newImgs.length - MAX_IMAGES);
      }
      return newImgs;
    });
    setHasChanges(true);
  };

  const handleFileUpload = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    
    // Si viene texto/html o una URI, es un arrastre interno del DOM (como reordenar imágenes).
    // Los archivos arrastrados desde el sistema operativo solo traen el tipo "Files".
    const types = e.dataTransfer.types ? Array.from(e.dataTransfer.types) : [];
    if (types.includes("text/html") || types.includes("text/uri-list")) {
      return; 
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const newImages = localImages.filter(img => img.isNew);
      
      for (let i = 0; i < newImages.length; i++) {
        const img = newImages[i];
        const formData = new FormData();
        formData.append('image', img.file);
        
        // Agregar sku e índice al FormData
        const realIndex = localImages.findIndex(localImg => localImg === img);
        formData.append('index', realIndex);
        formData.append('sku', sku);
        
        const uploadResponse = await axios.post(`${API_URL}/api/products/addImage`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        if (uploadResponse.data.imageUrl) {
          img.remoteUrl = uploadResponse.data.imageUrl;
        }
      }
      
      // Then update the product's images in the database
      const imageUrls = localImages.map(img => img.remoteUrl).filter(Boolean);
      await axios.patch(`${API_URL}/api/products/updateImages`, {
        sku: sku,
        images: imageUrls
      });
        setLoadedImages(imageUrls);
        setHasChanges(false);
        setLoading(false);
        
        Swal.fire({
          title: '¡Guardado!',
          text: 'Las imágenes se han actualizado correctamente.',
          icon: 'success',
          confirmButtonColor: '#3b82f6',
          timer: 2000,
          timerProgressBar: true
        });
      } catch (error) {
        console.error('Error saving images:', error);
        setLoading(false);
        
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron guardar los cambios. Por favor, reintenta.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    };
    
  return (
    <DndProvider backend={HTML5Backend}>
      <div 
        className="min-h-[300px] pt-5 relative w-full max-w-[688px]"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {localImages.length > 0 && (
          <div className="flex items-center justify-center relative w-full h-[450px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
            <button {...navigationProps.prev} className="absolute left-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full z-10 transition opacity-0 group-hover:opacity-100">◀</button>
            <div className="h-full w-full flex items-center justify-center">
              {loading ? (
                <Spinner />
              ) : (
                <img
                  src={localImages[currentIndex]?.previewUrl}
                  alt={`Image ${currentIndex + 1}`}
                  className="object-contain w-full h-full cursor-zoom-in transition-transform duration-300 hover:scale-105"
                  onError={() => setLoading(false)}
                  onClick={() => handleZoomImage(localImages[currentIndex])}
                />
              )}
            </div>
            <button {...navigationProps.next} className="absolute right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-3 rounded-full z-10 transition opacity-0 group-hover:opacity-100">▶</button>
          </div>
        )}
        
        <div className="flex justify-center mt-2 space-x-2">
          {localImages.map((imgObj, index) => (
            <ImageThumbnail
              key={`${imgObj.previewUrl}-${index}`}
              imgObj={imgObj}
              index={index}
              currentIndex={currentIndex}
              onDelete={handleDelete}
              onSelect={setCurrentIndex}
              moveImage={moveImage}
            />
          ))}
          {localImages.length < MAX_IMAGES && (
            <label className="w-16 h-16 flex flex-col items-center justify-center border-dashed border-2 border-blue-400 text-blue-500 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition">
              <span className="text-2xl font-light">+</span>
              <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
            </label>
          )}
        </div>

        {zoomedImage && (
          <section onClick={() => handleZoomImage(null)}>
            <article className="fixed flex p-5 items-center justify-center z-[9999] bg-black bg-opacity-80 h-screen w-screen top-0 right-0">
              <span className="absolute top-5 right-10 text-white font-bold text-4xl cursor-pointer">x</span>
              <img src={zoomedImage} alt="Zoomed" className="rounded-lg object-contain cursor-zoom-out w-[550px]" />
            </article>
          </section>
        )}

        {hasChanges && (
          <div className="fixed bottom-8 right-8 z-[99]">
            <button onClick={handleSaveChanges} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full shadow-2xl transition transform hover:scale-105 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Guardar cambios
            </button>
          </div>
        )}
      </div>
    </DndProvider>
  );
}
