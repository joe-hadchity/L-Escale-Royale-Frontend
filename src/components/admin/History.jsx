import React, { useState, useEffect } from 'react';
import { Form, Table, Button, InputGroup } from 'react-bootstrap';
import axios from 'axios';

const History = () => {
    const [history, setHistory] = useState([]);
    const [searchOrder, setSearchOrder] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [error, setError] = useState(null);

    // Fetch history when component mounts or when search filters change
    useEffect(() => {
        if (searchOrder || searchDate) {
            fetchFilteredHistory();
        }
    }, [searchOrder, searchDate]);

    // Fetch orders based on either order number or date
    const fetchFilteredHistory = async () => {
        try {
            let apiUrl = `${process.env.REACT_APP_API_URL}/Order/GetOrdersinProcess`; // Fallback for filtered orders
            if (searchOrder) {
                // If order number is searched, use the specific order number API
                apiUrl = `${process.env.REACT_APP_API_URL}/Order/GetOrderbyOrderNumber/${searchOrder}`;
            } else if (searchDate) {
                // If date is searched, use the specific date filter API
                apiUrl = `${process.env.REACT_APP_API_URL}/Order/GetOrderbyDay?date=${searchDate}`;
            }

            const response = await axios.get(apiUrl);
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching history:', error);
            setError('Failed to fetch orders.');
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

            {/* Display Error if Exists */}
            {error && <p className="text-danger">{error}</p>}

            {/* History Table */}
            <Table striped bordered hover responsive>
                <thead className="table-dark">
                    <tr>
                        <th>#</th>
                        <th>Action</th>
                        <th>Date</th>
                        <th>Numéro de commande</th>
                    </tr>
                </thead>
                <tbody>
                    {history.length > 0 ? (
                        history.map((entry, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{entry.action || 'N/A'}</td>
                                <td>{entry.dateofOrder || 'N/A'}</td>
                                <td>{entry.ordernumber || 'N/A'}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center">
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
