import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CommitteeDashboard from './pages/CommitteeDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="container">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/student/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/committee/dashboard" element={<ProtectedRoute roles={['committee']}><CommitteeDashboard /></ProtectedRoute>} />

            {/* Redirect logic */}
            <Route path="/" element={<HomeRedirect />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// This component handles the initial redirect after login
const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" />;
    case 'student':
      return <Navigate to="/student/dashboard" />;
    case 'committee':
      return <Navigate to="/committee/dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
};

export default App;