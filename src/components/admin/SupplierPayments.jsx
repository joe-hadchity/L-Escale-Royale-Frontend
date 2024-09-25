import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
} from '@mui/material';

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
      setPayments(response.data);
    } catch (error) {
      setError('Échec de la récupération des paiements.');
    }
  };

  // Show modal for adding or updating payment
  const handleShowModal = (payment = null) => {
    if (payment) {
      setCurrentPayment(payment);
      setType(payment.Type);
      setAmount(payment.Amount);
      setReason(payment.Reason);
    } else {
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
    return isNaN(parsedValue) ? 0.0 : parsedValue;
  };

  // Save payment (add or update)
  const handleSavePayment = async () => {
    const paymentData = {
      Type: type,
      Amount: convertToDouble(amount),
      Reason: reason,
    };

    try {
      if (currentPayment) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/Payment/UpdatePaymentByPaymentNumber/${currentPayment.PaymentNumber}`,
          paymentData
        );
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/Payment/CreatePayment`, paymentData);
      }
      setShowModal(false);
      fetchPayments();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement du paiement.');
    }
  };

  // Delete payment
  const handleDeletePayment = async (paymentNumber) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce paiement ?')) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/Payment/DeletePaymentBYPaymentNumber/${paymentNumber}`);
      fetchPayments();
    } catch (error) {
      alert('Erreur lors de la suppression du paiement.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gestion des paiements</h1>

      <Button
        variant="contained" // Changed to contained for a solid button
        color="primary"
        onClick={() => handleShowModal()}
        style={{ marginBottom: '20px' }}
      >
        Ajouter un nouveau paiement
      </Button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Raison</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Numéro brut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <TableRow key={payment.PaymentNumber || index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{payment.Type}</TableCell>
                  <TableCell>{payment.Amount}</TableCell>
                  <TableCell>{payment.Reason}</TableCell>
                  <TableCell>{payment.DateOfPayment}</TableCell>
                  <TableCell>{payment.GrossNumber}</TableCell>
                  <TableCell>
                    {/* Update Button */}
                    <Button
                      variant="outlined"
                      color="info"
                      onClick={() => handleShowModal(payment)}
                      style={{ marginRight: '10px' }}
                    >
                      Mettre à jour
                    </Button>
                    {/* Delete Button */}
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeletePayment(payment.PaymentNumber)}
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Aucun paiement trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Add/Update Payment */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>{currentPayment ? 'Mettre à jour le paiement' : 'Ajouter un paiement'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Type"
            select
            value={type}
            onChange={(e) => setType(e.target.value)}
            fullWidth
            margin="normal"
          >
            <MenuItem value="">Sélectionnez un type</MenuItem>
            <MenuItem value="Income">Revenu</MenuItem>
            <MenuItem value="Expense">Dépense</MenuItem>
          </TextField>
          <TextField
            label="Montant"
            type="number"
            fullWidth
            margin="normal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <TextField
            label="Raison"
            fullWidth
            margin="normal"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)} color="secondary" variant="outlined">
            Fermer
          </Button>
          <Button onClick={handleSavePayment} variant="contained" color="primary">
            {currentPayment ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SupplierPayments;
