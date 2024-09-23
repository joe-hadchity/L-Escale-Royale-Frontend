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

  // Fetch payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  // Fetch all payments
  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/Payment/GetAllPayment`);
      console.log('Fetched payments:', response.data);
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to fetch payments.');
    }
  };

  // Show modal for adding or updating payment
  const handleShowModal = (payment = null) => {
    if (payment) {
      console.log('Editing payment:', payment);
      setCurrentPayment(payment);
      setType(payment.Type);
      setAmount(payment.Amount);
      setReason(payment.Reason);
    } else {
      console.log('Creating new payment');
      setCurrentPayment(null);
      setType('');
      setAmount('');
      setReason('');
    }
    setShowModal(true);
  };

  // Convert amount to double
  const convertToDouble = (value) => {
    const parsedValue = parseFloat(value);
    if (isNaN(parsedValue)) {
      return 0.0;
    }
    return parsedValue;
  };

  // Save payment (add or update)
  const handleSavePayment = async () => {
    const paymentData = {
      Type: type,
      Amount: convertToDouble(amount), // Convert to double
      Reason: reason,
    };

    console.log('Request body:', paymentData);

    try {
      if (currentPayment) {
        console.log('Updating payment with ID:', currentPayment.PaymentNumber);
        await axios.put(`${process.env.REACT_APP_API_URL}/Payment/UpdatePaymentByPaymentNumber/${currentPayment.PaymentNumber}`, paymentData);
      } else {
        console.log('Creating new payment');
        await axios.post(`${process.env.REACT_APP_API_URL}/Payment/CreatePayment`, paymentData);
      }
      setShowModal(false);
      fetchPayments();
    } catch (error) {
      console.error('Error saving payment:', error);
      console.log('Error response data:', error.response?.data);
      console.log('Error status:', error.response?.status);
      console.log('Error headers:', error.response?.headers);
      alert('Error saving payment. Please check the console for more details.');
    }
  };

  // Delete payment
  const handleDeletePayment = async (paymentNumber) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;

    try {
      console.log('Deleting payment with ID:', paymentNumber);
      await axios.delete(`${process.env.REACT_APP_API_URL}/Payment/DeletePaymentBYPaymentNumber/${paymentNumber}`);
      fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('Error deleting payment. Please check the console for more details.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-4">Payment Management</h1>

      <Button variant="primary" onClick={() => handleShowModal()} className="mb-3">
        Add New Payment
      </Button>

      {error && <p className="text-danger">{error}</p>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Reason</th>
            <th>Date</th>
            <th>Gross Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.length > 0 ? (
            payments.map((payment, index) => (
              <tr key={payment.PaymentNumber || index}>
                <td>{index + 1}</td>
                <td>{payment.Type}</td>
                <td>{payment.Amount}</td>
                <td>{payment.Reason}</td>
                <td>{payment.DateOfPayment}</td>
                <td>{payment.GrossNumber}</td>
                <td>
                  {/* <Button variant="warning" onClick={() => handleShowModal(payment)} className="me-2">
                    Update
                  </Button> */}
                  <Button variant="danger" onClick={() => handleDeletePayment(payment.PaymentNumber)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No payments found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal for Add/Update Payment */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentPayment ? 'Update Payment' : 'Add Payment'}</Modal.Title>
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
                <option value="">Select a type</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formPaymentAmount" className="mt-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formPaymentReason" className="mt-3">
              <Form.Label>Reason</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSavePayment}>
            {currentPayment ? 'Update' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SupplierPayments;
