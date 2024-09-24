import React, { useState } from 'react';
import { Form, Table, Button, InputGroup } from 'react-bootstrap';
import axios from 'axios';

const History = () => {
    const [history, setHistory] = useState([]);
    const [searchOrder, setSearchOrder] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Function to format the date as dd/MM/yyyy
    const formatDate = (date) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JS
        const year = d.getFullYear();

        return `${day}/${month}/${year}`; // Format the date as dd/MM/yyyy
    };

    // Fetch orders based on either order number or date
    const fetchFilteredHistory = async () => {
        console.log("Fetching history...");
        try {
            setLoading(true);
            setError(null); // Reset any previous errors

            let apiUrl = `${process.env.REACT_APP_API_URL}/Order/GetOrdersinProcess`; // Default fallback

            if (searchOrder) {
                console.log(`Searching by order number: ${searchOrder}`);
                apiUrl = `${process.env.REACT_APP_API_URL}/Order/GetOrderByOrderNumber/${searchOrder}`;
            } else if (searchDate) {
                const formattedDate = formatDate(searchDate); // Format the date before sending
                console.log(`Searching by date: ${formattedDate}`);
                apiUrl = `${process.env.REACT_APP_API_URL}/Order/GetOrderByDate?date=${formattedDate}`;
            } else {
                console.log("No search criteria provided.");
                setError('Please enter an order number or select a date to search.');
                setLoading(false);
                return;
            }

            console.log(`API URL: ${apiUrl}`);

            // Making API request
            const response = await axios.get(apiUrl);
            console.log('API response:', response.data);

            // Handle both array and single object response
            const responseData = Array.isArray(response.data) ? response.data : [response.data];
            setHistory(responseData);
        } catch (error) {
            console.error('Error fetching history:', error);
            setError('Failed to fetch orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="mb-4">Historique des commandes</h1>

            {/* Search Bar */}
            <div className="mb-4">
                <InputGroup className="mb-3">
                    <Form.Control
                        placeholder="Rechercher par numéro de commande"
                        value={searchOrder}
                        onChange={(e) => setSearchOrder(e.target.value)}
                    />
                    <Form.Control
                        type="date"
                        placeholder="Rechercher par date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                    />
                    <Button variant="primary" onClick={fetchFilteredHistory}>
                        Rechercher
                    </Button>
                </InputGroup>
            </div>

            {/* Display Loading State */}
            {loading && <p>Loading...</p>}

            {/* Display Error if Exists */}
            {error && <p className="text-danger">{error}</p>}

            {/* History Table */}
            <Table striped bordered hover responsive>
                <thead className="table-dark">
                    <tr>
                        <th>#</th>
                        <th>Créé par</th>
                        <th>Date de commande</th>
                        <th>Numéro de commande</th>
                        <th>Type</th>
                        <th>Statut</th>
                        <th>Table Number</th>
                        <th>Delivery Charge</th>
                        <th>Location</th>
                        <th>Total Price</th>
                        <th>Items</th>
                    </tr>
                </thead>
                <tbody>
                    {history.length > 0 ? (
                        history.map((order, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{order.Created_by || 'N/A'}</td>
                                <td>{order.DateOfOrder || 'N/A'}</td>
                                <td>{order.OrderNumber || 'N/A'}</td>
                                <td>{order.Type || 'N/A'}</td>
                                <td>{order.Status || 'N/A'}</td>
                                <td>{order.TableNumber || 'N/A'}</td>
                                <td>{order.DeleiveryCharge ? `${order.DeleiveryCharge.toFixed(2)} €` : 'N/A'}</td>
                                <td>{order.Location || 'N/A'}</td>
                                <td>{order.TotalPrice ? `${order.TotalPrice.toFixed(2)} €` : 'N/A'}</td>
                                <td>
                                    {order.Items && order.Items.length > 0 ? (
                                        <ul>
                                            {order.Items.map((item, i) => (
                                                <li key={i}>
                                                    {item.Quantity} x {item.Price} €
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        'No items'
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="11" className="text-center">
                                Aucune entrée trouvée
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </div>
    );
};

export default History;
