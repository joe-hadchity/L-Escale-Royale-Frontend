import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import Login from './pages/Login';
import StaffPage from './pages/StaffPage';
import NewOrderPage from './components/staff/NewOrderPage'; // Import this
import { AuthProvider, AuthContext } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/login" />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Admin routes */}
                    <Route 
                        path="/admin/*" 
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminPage />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Staff routes */}
                    <Route 
                        path="/staff/*" 
                        element={
                            <ProtectedRoute allowedRoles={['staff']}>
                                <StaffPage />
                            </ProtectedRoute>
                        } 
                    />

                    {/* New order creation route */}
                    <Route 
                        path="/staff/new-order" 
                        element={
                            <ProtectedRoute allowedRoles={['staff']}>
                                <NewOrderPage />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Login route */}
                    <Route path="/login" element={<Login />} />

                    {/* Default route */}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
