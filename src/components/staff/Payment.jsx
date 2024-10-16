import React, { useState } from 'react';
import {
  Button, TextField, Typography, Box, Select, MenuItem, InputLabel, FormControl, Snackbar, Alert,
} from '@mui/material';
import axios from 'axios';

const SupplierPayments = () => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentReason, setPaymentReason] = useState('');
  const [paymentType, setPaymentType] = useState('');

  // Snackbar state for user feedback
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // 'success' or 'error'

  const handleSavePayment = async () => {
    if (!paymentAmount || !paymentType || !paymentReason) {
      setSnackbarMessage('Tous les champs sont obligatoires.');
      setSnackbarSeverity('warning');
      setOpenSnackbar(true);
      return;
    }

    try {
      const paymentData = {
        Amount: parseFloat(paymentAmount),
        Type: paymentType,
        Reason: paymentReason,
      };

      console.log('Payment data:', paymentData);

      const createUrl = `${process.env.REACT_APP_API_URL}/Payment/CreatePayment`;
      await axios.post(createUrl, paymentData);

      // Clear the form fields after successful submission
      setPaymentAmount('');
      setPaymentReason('');
      setPaymentType('');

      setSnackbarMessage('Paiement ajouté avec succès!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);

      // Trigger receipt printing
      printReceipt(paymentData);
    } catch (error) {
      console.error('Error saving payment:', error);
      setSnackbarMessage(`Erreur lors de la sauvegarde du paiement: ${error.response?.data || error.message}`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  // Function to print the receipt using electron-pos-printer
  const printReceipt = async (paymentData) => {
    const printData = [
      {
        type: 'text',
        value: 'Reçu de Paiement',
        style: { textAlign: 'center', fontWeight: 'bold', fontSize: '22px' },
      },
      {
        type: 'text',
        value: '------------------------------------------',
        style: { textAlign: 'center' },
      },
      {
        type: 'text',
        value: `Montant: ${paymentData.Amount.toFixed(2)} €`,
        style: { textAlign: 'left', fontSize: '16px' },
      },
      {
        type: 'text',
        value: `Type: ${paymentData.Type === 'income' ? 'Revenu' : 'Dépense'}`,
        style: { textAlign: 'left', fontSize: '16px' },
      },
      {
        type: 'text',
        value: `Raison: ${paymentData.Reason}`,
        style: { textAlign: 'left', fontSize: '16px' },
      },
      {
        type: 'text',
        value: `Date: ${new Date().toLocaleString('fr-FR')}`,
        style: { textAlign: 'left', fontSize: '14px' },
      },
      {
        type: 'text',
        value: '------------------------------------------',
        style: { textAlign: 'center' },
      },
      {
        type: 'text',
        value: 'Merci pour votre confiance.',
        style: { textAlign: 'center', fontSize: '12px', fontStyle: 'italic' },
      },
    ];

    const printOptions = {
      preview: false, // Set to true to preview the receipt before printing
      printerName: 'POS-80C-Cashier', // Replace with your printer name
      copies: 1,
      timeOutPerLine: 400,
      silent: true,
    };

    try {
      const response = await window.electronAPI.printOrder(printData, printOptions);
      if (response.success) {
        console.log('Receipt printed successfully!');
      } else {
        console.error('Failed to print receipt.');
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 4, textAlign: 'center' }}>
        Ajouter un Paiement
      </Typography>

      <Box
        component="form"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          maxWidth: 600,
          margin: '0 auto',
        }}
      >
        <TextField
          label="Montant du Paiement"
          type="number"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          fullWidth
          required
        />
        <FormControl fullWidth required>
          <InputLabel>Type de Paiement</InputLabel>
          <Select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            label="Type de Paiement"
          >
            <MenuItem value="income">Revenu</MenuItem>
            <MenuItem value="expense">Dépense</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Raison du Paiement"
          value={paymentReason}
          onChange={(e) => setPaymentReason(e.target.value)}
          fullWidth
          multiline
          rows={3}
          required
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSavePayment}
          sx={{ alignSelf: 'flex-end', paddingX: 4, paddingY: 1 }}
        >
          Enregistrer le Paiement
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SupplierPayments;
