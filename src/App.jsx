import { Route, Routes, useLocation } from "react-router-dom";
import { useState, useEffect } from 'react';
import Login from './Components/Login';
import Home from './Pages/Home.jsx';
import ArticleEditor from './Pages/ArticleEditor.jsx';
import Nav from './Components/Nav.jsx';
import Products from './Pages/Products.jsx';
import Error from './Pages/Error.jsx';
import Queries from './Pages/Queries.jsx';
import Banners from './Pages/Banners.jsx';
import Orders from './Pages/Orders.jsx';
import AddProduct from './Pages/AddProduct.jsx';
import { ProductsProvider } from './Context/ProductsContext.jsx';
import { PageProvider, usePage } from './Context/PageContext.jsx';

export default function App() {
  return (
    <PageProvider>
      <ProductsProvider>
        <AppContent />
      </ProductsProvider>
    </PageProvider>
  );
}

function AppContent() {
  const { login } = usePage();

  return (
    login === false
      ? <Login />
      : (
        <main className='relative flex flex-col items-center bg-gradient-to-br from-[#232c3d] to-[#10443e] min-h-screen h-full font-consolas'>
          <ScrollToTopOnLocationChange />
          <Nav />
          <Routes>
            <Route path="/admin/page/" element={<Home />} />
            <Route path="/admin/page/article_editor" element={<ArticleEditor />} />
            <Route path="/admin/page/products" element={<Products />} />
            <Route path='/admin/page/queries' element={<Queries />} />
            <Route path='/admin/page/banners' element={<Banners />} />
            <Route path='/admin/page/orders' element={<Orders />} />
            <Route path="/admin/page/add_product" element={<AddProduct />} />
            <Route path="/admin/page/error" element={<Error />} />
          </Routes>
        </main>
      )
  );
}

function ScrollToTopOnLocationChange() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}
