import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Helper function to delete cookies
    const deleteCookie = (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    };

    const handleLogout = () => {
        // Call the logout function from context
        logout();

        // Delete authentication or session-related cookies
        deleteCookie('authToken');  // Example cookie name
        deleteCookie('session');    // Another example cookie name

        // Redirect to the login page after logout
        navigate('/login');
    };

    return (
        <div>
            <h1>Déconnexion</h1>
            <button onClick={handleLogout}>Déconnexion</button>
        </div>
    );
};

export default Logout;
