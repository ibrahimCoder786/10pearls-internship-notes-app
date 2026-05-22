import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LOCAL_STORAGE_KEYS } from './utils/constants';

// Pages
import Login      from './pages/Auth/Login/Login';
import Signup     from './pages/Auth/Signup/Signup';
import Dashboard  from './pages/Dashboard/Dashboard';
import NoteEditor from './pages/NoteEditor/NoteEditor';
import Profile    from './pages/Profile/Profile';

// Components
import Loader from './components/common/Loader/Loader';

// Protected Route — sirf logged-in users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader fullScreen />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route — login/signup pe logged-in user redirect ho jaye
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader fullScreen />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const App = () => {
  // Theme initialize on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.THEME) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Routes */}
      <Route path="/login"  element={<PublicRoute><Login  /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

      {/* Protected Routes */}
      <Route path="/dashboard"       element={<ProtectedRoute><Dashboard  /></ProtectedRoute>} />
      <Route path="/notes/new"       element={<ProtectedRoute><NoteEditor /></ProtectedRoute>} />
      <Route path="/notes/:id/edit"  element={<ProtectedRoute><NoteEditor /></ProtectedRoute>} />
      <Route path="/profile"         element={<ProtectedRoute><Profile    /></ProtectedRoute>} />

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;