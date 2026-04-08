import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Brands from '../pages/Brands';
import Products from '../pages/Products';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/brands" element={<Brands />} />
      <Route path="/products" element={<Products />} />
    </Routes>
  );
}
