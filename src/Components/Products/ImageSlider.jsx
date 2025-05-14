import React, { useState, useEffect, useCallback, memo } from "react";
import Spinner from "./Spinner.jsx";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";

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

  const handleFileUpload = (e) => {
    const files = e.target.files;
    const newImages = Array.from(files).map(file => ({
      previewUrl: URL.createObjectURL(file),
      remoteUrl: null,
      isNew: true,
      file: file  // Guardamos referencia al archivo original
    }));
    setLocalImages(prev => {
      const newImgs = [...prev, ...newImages];
      if (newImgs.length > MAX_IMAGES) {
        newImgs.splice(MAX_IMAGES, newImgs.length - MAX_IMAGES);
      }
      return newImgs;
    });
    setHasChanges(true);
  }

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
  } catch (error) {
    console.error('Error saving images:', error);
    setLoading(false);
    alert('Error al guardar los cambios');
  }
};
    
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-[300px] pt-5 relative w-full max-w-[688px]">
        {localImages.length > 0 && (
          <div className="flex items-center justify-center relative">
            <button {...navigationProps.prev}>◀</button>
            <div className="h-full flex items-center justify-center w-full">
              {loading ? (
                <Spinner />
              ) : (
                <img
                  src={localImages[currentIndex].previewUrl}
                  alt={`Image ${currentIndex + 1}`}
                  className="object-contain max-w-[510px] rounded-lg cursor-zoom-in min-h-[300px]"
                  onError={() => setLoading(false)}
                  onClick={() => handleZoomImage(localImages[currentIndex])}
                />
              )}
            </div>
            <button {...navigationProps.next}>▶</button>
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
            <label className="w-16 h-16 flex items-center justify-center border-dashed border-2 border-gray-500 rounded-lg cursor-pointer">
              +
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
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
          <button onClick={handleSaveChanges} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
            Guardar cambios
          </button>
        )}
      </div>
    </DndProvider>
  );
}
