import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const isAuth = sessionStorage.getItem('admin_auth') === 'true';
  return isAuth ? children : <Navigate to="/login" replace />;
}
