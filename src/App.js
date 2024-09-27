import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import Login from './pages/Login';
import StaffPage from './pages/StaffPage';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext'; // Import OrderProvider

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
                <OrderProvider>
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
                        {/* Login route */}
                        <Route path="/login" element={<Login />} />

                        {/* Default route */}
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                </OrderProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
