import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * A wrapper component that protects routes requiring authentication.
 * Renders its children if the user is authenticated; otherwise, redirects to the sign-in page.
 * Renders nothing while the authentication state is loading.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The components to render if authenticated
 * @returns {JSX.Element|null} The protected content, a redirect, or null during loading
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  return user ? children : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;