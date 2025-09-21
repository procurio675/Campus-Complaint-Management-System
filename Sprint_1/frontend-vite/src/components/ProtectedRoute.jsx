import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) {
    // User not logged in
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    // User does not have the required role, redirect to their own dashboard
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;