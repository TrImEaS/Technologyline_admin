import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.MODE === 'production' ? import.meta.env.VITE_API_URL_PROD : import.meta.env.VITE_API_URL_DEV;

export const ProductsContext = createContext();
export const useProducts = () => useContext(ProductsContext);

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/products?all=1`)
      .then(res => {
        setProducts(res.data)
        setLoading(false)
      })
      .catch(e => setError(e))
  }, [])

  return (
    <ProductsContext.Provider value={{ products, loading, setLoading, error }}>
      {children}
    </ProductsContext.Provider>
  )
}
