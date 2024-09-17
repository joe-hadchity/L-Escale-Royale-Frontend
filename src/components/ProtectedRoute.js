import React from 'react';
import { Navigate } from 'react-router-dom';

// Get user authentication info (example with sessionStorage)
const isAuthenticated = () => {
    return sessionStorage.getItem('userRole') !== null;  // You can use localStorage or cookies
};

const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/" />;  // Redirect to login if not authenticated
    }
    
    return children;
};

export default ProtectedRoute;
