import React, { useState, useEffect } from 'react';
import { Form, Table, Button, InputGroup } from 'react-bootstrap';
import axios from 'axios';

const History = () => {
    const [history, setHistory] = useState([]);
    const [searchOrder, setSearchOrder] = useState('');
    const [searchDate, setSearchDate] = useState('');

    // Fetch history on component mount
    useEffect(() => {
        fetchHistory();
    }, []);

    // Fetch the history from the backend
    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/Order/GetOrderHistory`);
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    // Filter history by order number
    const filteredHistory = history.filter(entry => {
        const matchesOrder = entry.ordernumber.includes(searchOrder);
        const matchesDate = entry.dateofOrder.includes(searchDate);
        return matchesOrder && matchesDate;
    });

    return (
        <div className="container mx-auto p-4">
            <h1 className="mb-4">Historique des commandes</h1>
            
            {/* Search bar */}
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
                    <Button variant="primary" onClick={fetchHistory}>
                        Rechercher
                    </Button>
                </InputGroup>
            </div>

            {/* History table */}
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
                    {filteredHistory.length > 0 ? (
                        filteredHistory.map((entry, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{entry.action}</td>
                                <td>{entry.dateofOrder}</td>
                                <td>{entry.ordernumber}</td>
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
