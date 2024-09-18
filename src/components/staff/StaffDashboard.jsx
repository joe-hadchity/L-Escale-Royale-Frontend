import React from 'react';
import OrderList from './OrderList';
import TableStatus from './TableStatus';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
    const navigate = useNavigate();

    const handleNewOrder = () => {
        // Redirect to the new order page
        navigate('/staff/new-order');
    };

    const handleLogout = () => {
        // Redirect to login page
        navigate('/login');
    };

    return (
        <div className="staff-dashboard">
            {/* Navigation bar */}
            <nav className="navbar navbar-light bg-light p-3 mb-4 shadow-sm">
                <span className="navbar-brand">
                    Bienvenue, Personnel
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

                {/* Section for ongoing orders and table status */}
                <div className="row">
                    <div className="col-md-6 mb-4">
                        <div className="card p-3 shadow-sm">
                            <h3 className="mb-3">Commandes Actuelles</h3>
                            <OrderList />
                        </div>
                    </div>

                    <div className="col-md-6 mb-4">
                        <div className="card p-3 shadow-sm">
                            <h3 className="mb-3">Status des Tables</h3>
                            <TableStatus />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
