import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Brands from '../pages/Brands';
import Products from '../pages/Products';
import CustomerTypes from '../pages/CustomerTypes';
import Areas from '../pages/Areas';
import Customers from '../pages/Customers';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/brands" element={<Brands />} />
      <Route path="/products" element={<Products />} />
      <Route path="/customer-types" element={<CustomerTypes />} />
      <Route path="/areas" element={<Areas />} />
      <Route path="/customers" element={<Customers />} />
    </Routes>
  );
}
