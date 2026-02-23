import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Check for JWT access token instead of old sessionStorage flag
  const isAuth = !!localStorage.getItem('admin_access_token');
  return isAuth ? children : <Navigate to="/login" replace />;
}