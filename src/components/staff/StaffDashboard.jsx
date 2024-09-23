import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
    const [user, setUser] = useState(null); // State to hold the user information
    const navigate = useNavigate();

    useEffect(() => {
        // Retrieve user information from cookie
        const storedUser = Cookies.get('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser)); // Parse the JSON string and set it to state
        }
    }, []);

    const handleNewOrder = () => {
        navigate('/staff/new-order');
    };

    const handleLogout = () => {
        // Clear the cookie on logout
        Cookies.remove('user');
        navigate('/login');
    };

    return (
        <div className="staff-dashboard">
            {/* Navigation bar */}
            <nav className="navbar navbar-light bg-light p-3 mb-4 shadow-sm">
                <span className="navbar-brand">
                    Bienvenue, {user ? user.username : 'Personnel'}
                </span>
                <div className="d-flex align-items-center">
                    <h5 className="mr-3">Tableau de Bord du Personnel</h5>
                    <button className="btn btn-danger" onClick={handleLogout}>
                        Déconnexion
                    </button>
                </div>
            </nav>

            <div className="container">
                {/* Button to redirect to the order creation page at the top */}
                <div className="row mb-4">
                    <div className="col-md-12 text-center">
                        <button className="btn btn-primary btn-lg" onClick={handleNewOrder}>
                            Créer une Nouvelle Commande
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
