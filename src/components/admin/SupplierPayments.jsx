import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Modal, Form, Table } from 'react-bootstrap';

const SupplierPayments = () => {
    const [payments, setPayments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [currentPayment, setCurrentPayment] = useState(null);
    const [type, setType] = useState('');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/Payment/GetAllPayments`);
            console.log('Fetched payments:', response.data);

            // Ensure response data is an array
            const fetchedPayments = Array.isArray(response.data) ? response.data : [];

            // Map over payments to ensure consistent data structure
            const paymentsList = fetchedPayments.map(payment => ({
                id: payment.Id || payment._id,
                type: payment.Type || payment.type,
                amount: payment.amount,
                reason: payment.reason,
                date: payment.date,
                grossnumber: payment.grossnumber,
            }));

            setPayments(paymentsList);
        } catch (error) {
            console.error('Error fetching payments:', error);
            setError('Failed to fetch payments.');
        }
    };

    const handleShowModal = (payment = null) => {
        if (payment) {
            setCurrentPayment(payment);
            setType(payment.type);
            setAmount(payment.amount);
            setReason(payment.reason);
        } else {
            setCurrentPayment(null);
            setType('');
            setAmount('');
            setReason('');
        }
        setShowModal(true);
    };

    const handleSavePayment = async () => {
        const paymentData = {
            Type: type,
            amount: parseFloat(amount),
            reason: reason,
            // 'date' and 'grossnumber' are set by the backend
        };

        try {
            if (currentPayment) {
                // Update payment
                await axios.put(`${process.env.REACT_APP_API_URL}/Payment/Update/${currentPayment.id}`, paymentData);
            } else {
                // Create payment
                await axios.post(`${process.env.REACT_APP_API_URL}/Payment/Create`, paymentData);
            }
            setShowModal(false);
            fetchPayments();
        } catch (error) {
            console.error('Error saving payment:', error);
            alert('Error saving payment. Please try again.');
        }
    };

    const handleDeletePayment = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) return;

        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/Payment/Delete/${id}`);
            fetchPayments();
        } catch (error) {
            console.error('Error deleting payment:', error);
            alert('Error deleting payment. Please try again.');
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="mb-4">Gestion des Paiements</h1>

            <Button variant="primary" onClick={() => handleShowModal()} className="mb-3">
                Ajouter un paiement
            </Button>

            {error && <p className="text-danger">{error}</p>}

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Type</th>
                        <th>Montant</th>
                        <th>Raison</th>
                        <th>Date</th>
                        <th>Numéro de Gross</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.length > 0 ? (
                        payments.map((payment, index) => (
                            <tr key={payment.id || index}>
                                <td>{index + 1}</td>
                                <td>{payment.type}</td>
                                <td>{payment.amount}</td>
                                <td>{payment.reason}</td>
                                <td>{payment.date}</td>
                                <td>{payment.grossnumber}</td>
                                <td>
                                    <Button variant="warning" onClick={() => handleShowModal(payment)} className="me-2">
                                        Modifier
                                    </Button>
                                    <Button variant="danger" onClick={() => handleDeletePayment(payment.id)}>
                                        Supprimer
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center">
                                Aucun paiement trouvé
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Modal for Add/Update Payment */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentPayment ? 'Mettre à jour le paiement' : 'Ajouter un paiement'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formPaymentType">
                            <Form.Label>Type</Form.Label>
                            <Form.Control
                                as="select"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="">Sélectionnez un type</option>
                                <option value="Income">Income</option>
                                <option value="Expense">Expense</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formPaymentAmount" className="mt-3">
                            <Form.Label>Montant</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                placeholder="Entrez le montant"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formPaymentReason" className="mt-3">
                            <Form.Label>Raison</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Entrez la raison"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Fermer
                    </Button>
                    <Button variant="primary" onClick={handleSavePayment}>
                        {currentPayment ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SupplierPayments;
