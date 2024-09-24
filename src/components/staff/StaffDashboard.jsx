import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios for API calls

const StaffDashboard = () => {
    const [user, setUser] = useState(null); // State to hold the user information
    const [orders, setOrders] = useState([]); // State to hold orders by status
    const [availableTables, setAvailableTables] = useState([]); // State to hold available tables
    const navigate = useNavigate();

    useEffect(() => {
        // Retrieve user information from cookie
        const storedUser = Cookies.get('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser)); // Parse the JSON string and set it to state
        }

        // Fetch orders by status and available tables
        fetchOrdersByStatus();
        fetchAvailableTables();
    }, []);

    // Fetch orders by status (e.g., Pending, Completed)
    const fetchOrdersByStatus = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/Order/GetOrderByStatus/Pending`);
            setOrders(response.data); // Assuming orders are returned as a list
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    // Fetch available tables
    const fetchAvailableTables = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/Table/GetAvailableTables`);
            setAvailableTables(response.data); // Assuming tables are returned as a list
        } catch (error) {
            console.error('Error fetching tables:', error);
        }
    };

    // Navigate to create a new order page
    const handleNewOrder = () => {
        navigate('/staff/new-order');
    };

    // Handle logout
    const handleLogout = () => {
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
                {/* Button to create a new order */}
                <div className="row mb-4">
                    <div className="col-md-12 text-center">
                        <button className="btn btn-primary btn-lg" onClick={handleNewOrder}>
                            Créer une Nouvelle Commande
                        </button>
                    </div>
                </div>

                {/* Orders section */}
                <div className="row">
                    <div className="col-md-12">
                        <h4>Commandes en Attente</h4>
                        {orders.length > 0 ? (
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Numéro de Commande</th>
                                        <th>Table</th>
                                        <th>Statut</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{order.OrderNumber}</td>
                                            <td>{order.TableNumber}</td>
                                            <td>{order.Status}</td>
                                            <td>{order.TotalPrice ? `${order.TotalPrice.toFixed(2)} €` : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>Aucune commande en attente.</p>
                        )}
                    </div>
                </div>

                {/* Available Tables section */}
                <div className="row mt-5">
                    <div className="col-md-12">
                        <h4>Tables Disponibles</h4>
                        {availableTables.length > 0 ? (
                            <ul className="list-group">
                                {availableTables.map((table, index) => (
                                    <li key={index} className="list-group-item">
                                        Table {table.TableNumber} - {table.Status}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Aucune table disponible.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
