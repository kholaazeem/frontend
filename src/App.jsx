import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard if unauthorized for this role
    if (user.role === 'customer') return <Navigate to="/customer/dashboard" replace />;
    if (user.role === 'worker') return <Navigate to="/worker/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Temporary route placeholders for Chunk 3 */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <div className="p-8 text-center glass-panel m-10 rounded-2xl">
                  <h1 className="text-2xl font-bold">👤 Customer Dashboard (Coming in Chunk 3)</h1>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/worker/dashboard"
            element={
              <ProtectedRoute allowedRoles={['worker']}>
                <div className="p-8 text-center glass-panel m-10 rounded-2xl">
                  <h1 className="text-2xl font-bold">👷 Worker Dashboard (Coming in Chunk 3)</h1>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="p-8 text-center glass-panel m-10 rounded-2xl">
                  <h1 className="text-2xl font-bold">🛡️ Admin Dashboard (Coming in Chunk 3)</h1>
                </div>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
