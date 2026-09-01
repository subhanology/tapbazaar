import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
// import { CartProvider } from './context/CartContext'; // Uncomment when ready
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
// import Cart from './pages/Cart'; // Uncomment when ready

function App() {
  return (
    <AuthProvider>
      {/* <CartProvider> */}
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          {/* <Route path="/cart" element={<Cart />} /> */}
        </Routes>
      {/* </CartProvider> */}
    </AuthProvider>
  );
}

export default App;