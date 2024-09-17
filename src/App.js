import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import AdminHome from './pages/admin/AdminHome';
import StaffHome from './pages/staff/StaffHome';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                
                {/* Protected routes for admin and staff */}
                <Route 
                    path="/admin-home" 
                    element={
                        <ProtectedRoute>
                            <AdminHome />
                        </ProtectedRoute>
                    }
                />
                <Route 
                    path="/staff-home" 
                    element={
                        <ProtectedRoute>
                            <StaffHome />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
};

export default App;
