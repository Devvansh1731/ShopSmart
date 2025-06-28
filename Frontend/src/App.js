import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import NotFound from './components/NotFound';
import 'bootstrap/dist/css/bootstrap.css';
import Login from './components/Login';
import Registration from './components/Registration';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './admin_components/AdminProtectedRoute';
import Products from './components/products';
import Checkout from './components/Checkout';
import MyOrders from './components/MyOrders';
import History from './components/History';
import MyCart from './components/MyCart';
import Users from './admin_components/Users';
import Orders from './admin_components/Orders';
import AddCategory from './admin_components/AddCategory';
import AddProduct from './admin_components/AddProduct';
import AdminProducts from './admin_components/Products';
import AdminProductItem from './admin_components/ProductItem';
import UpdateProduct from './admin_components/Update';
import Dashboard from './admin_components/Dashoard';
import AdminLogin from './admin_components/AdminLogin';
import AdminSignup from './admin_components/AdminSignup';
import { AppProvider } from './context/context';

function App() {
  return (
    <AppProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Registration />} />
            <Route path='/alogin' element={<AdminLogin />} />
            <Route path='/asignup' element={<AdminSignup />} />
            <Route path="/" element={<Home />} />
            
            {/* Protected user routes */}
            <Route path='/shopping' element={<ProtectedRoute Component={Products} />} />
            <Route path='/order-details/:id' element={<ProtectedRoute Component={Checkout} />} />
            <Route path='/my-orders' element={<ProtectedRoute Component={MyOrders} />} />
            <Route path='/my-history' element={<ProtectedRoute Component={History} />} />
            <Route path='/my-cart' element={<ProtectedRoute Component={MyCart} />} />

            {/* Protected admin routes */}
            <Route path='/admin' element={<Navigate to="/admin/dashboard" replace />} />
            <Route path='/admin/dashboard' element={<AdminProtectedRoute Component={Dashboard} />} />
            <Route path='/admin/users' element={<AdminProtectedRoute Component={Users} />} />
            <Route path='/admin/orders' element={<AdminProtectedRoute Component={Orders} />} />
            <Route path='/admin/add-category' element={<AdminProtectedRoute Component={AddCategory} />} />
            <Route path='/admin/all-products' element={<AdminProtectedRoute Component={AdminProducts} />} />
            <Route path='/admin/product/:id' element={<AdminProtectedRoute Component={AdminProductItem} />} />
            <Route path='/admin/add-product' element={<AdminProtectedRoute Component={AddProduct} />} />
            <Route path='/admin/product-update/:id' element={<AdminProtectedRoute Component={UpdateProduct} />} />

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AppProvider>
  );
}

export default App;
