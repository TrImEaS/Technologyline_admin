import { useState } from 'react'

const API_URL = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_API_URL_PROD
  : import.meta.env.VITE_API_URL_DEV

export default function BrandsCarousel () {
  const [brands, setBrands] = useState([])

  useEffect(() => {
    axios.get(`${API_URL}/api/page/getBrandsForCarousel?t=${Math.random()}`)
      .then(res => setBrands(res.data.brands))
      .catch(err => console.error('Error fetching brands:', err))
  }, [])

  return (
    <div className="brands-carousel">
      {brands.map((brand, index) => (
        <div key={index} className="brand-item">
          <img src={brand.logo} alt={brand.name} />
          <h3>{brand.name}</h3>
        </div>
      ))}
    </div>
  )
}
