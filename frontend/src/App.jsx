import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Account from './pages/Account';
import MyListings from './pages/MyListings';
import ProtectedRoute from './components/ProtectedRoute';
import CreateProduct from './pages/CreateProduct';
import ProductShow from './pages/ProductShow';
import EditProduct from './pages/EditProduct';
import Cart from './pages/Cart';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-listings" 
            element={
              <ProtectedRoute>
                <MyListings />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/products/new" 
            element={
              <ProtectedRoute>
                <CreateProduct />
              </ProtectedRoute>
            } 
          />
          <Route path="/products/:id" element={<ProductShow />} />
          <Route
          path="/products/:id/edit"
          element={
            <ProtectedRoute>
            <EditProduct />
            </ProtectedRoute>
          }
          />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;