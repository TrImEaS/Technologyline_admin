import React, { useState, useEffect, useRef } from "react"
import Slider from "react-slick"
import Spinner from './Spinner.jsx'
import page_icon from '../../Assets/page-icon.jpeg'

export default function ImageSlider({ loadedImages }) {
  const [nav1, setNav1] = useState(null)
  const [nav2, setNav2] = useState(null)
  const [zoomedImage, setZoomedImage] = useState(null)
  const [showSecondSlider, setShowSecondSlider] = useState(true)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  let sliderRef1 = useRef(null)
  let sliderRef2 = useRef(null)

  useEffect(() => {
    setNav1(sliderRef1)
    setNav2(sliderRef2)
  }, [])

  useEffect(() => {
    if (loadedImages.length === 1) {
      setShowSecondSlider(false) 
      setLoading(false)
    } else {
      setShowSecondSlider(true)
    }
  }, [loadedImages])

  const handleZoomImage = (image) => {
    if (!zoomedImage) {
      setZoomedImage(image)
      document.body.style.overflowY = 'hidden'
      return
    }

    setZoomedImage(null)
    document.body.style.overflowY = 'visible'
  }
  
  const handleImageError = () => {
    setError(true)
    setLoading(false)
  }

  return (
    <div className=" min-h-[300px]">
      {loadedImages.length === 1 
      ? (
        <div className="h-full flex items-center justify-center" onClick={() => handleZoomImage(loadedImages[0])}>
          {loading 
          ? <Spinner />
          : <img
              src={error ? page_icon : loadedImages[0]}
              onError={handleImageError}
              loading="eager"
              alt="Image 1"
              className="object-contain rounded-lg cursor-zoom-in min-h-[300px]"
            />
        }
        </div>
      ) 
      : (
        <div className="slider-container">
          <Slider
            asNavFor={showSecondSlider ? nav2 : null}
            ref={(slider) => (sliderRef1 = slider)}
            arrows={false}
            beforeChange={(oldIndex, newIndex) => {
              setLoading(true);
              setError(false);
            }}
            afterChange={(currentSlide) => {
              setLoading(false);
            }}
          >
            {loadedImages.map((image, index) => (
              <div key={index} onClick={() => handleZoomImage(image)}>
                <img
                  src={image}
                  loading="eager"
                  alt={`Image ${index + 1}`}
                  className="object-cover rounded-lg max-w-[450px] w-full cursor-pointer"
                />
              </div>
            ))}
          </Slider>
        </div>
      )}

      {showSecondSlider && (
        <div className="slider-container">
          <Slider
            asNavFor={nav1}
            ref={(slider) => (sliderRef2 = slider)}
            slidesToShow={3}
            swipeToSlide={true}
            focusOnSelect={true}
            arrows={false}
            dots={true}
            className="dots-slider"
          >
            {loadedImages.map((image, index) => (
              <div className="cursor-pointer border border-black rounded-3xl" key={index}>
                <img
                  src={image}
                  loading="eager"
                  alt={`Image ${index + 1}`}
                  className="object-contain rounded-lg"
                />
              </div>
            ))}
          </Slider>
        </div>
      )}

      {zoomedImage && (
        <section onClick={() => handleZoomImage(null)}>
          <article className="fixed flex p-5 items-center justify-center z-[9999999] bg-black bg-opacity-75 h-screen w-screen top-0 right-[0] max-sm:min-w-[390px] max-sm:min-h-[650px]">
            <span className="absolute top-5 right-10 text-white font-bold text-4xl cursor-pointer">x</span>
            <img src={zoomedImage} className="rounded-lg object-contain cursor-zoom-in w-[550px]" />
          </article>
        </section>
      )}
    </div>
  )
}
