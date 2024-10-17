// components/CashPaymentDialog.jsx

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
} from '@mui/material';

const CashPaymentDialog = ({
  open,
  onClose,
  calculateTotalPrice,
  amountPaid,
  amountPaidStr,
  changeDue,
  handleKeyPress,
  handleConfirmCashPayment,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle
        sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1.6rem' }}
      >
        Paiement en Espèces
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
          Total à Payer : {calculateTotalPrice().toFixed(2)} CFA
        </Typography>

        <Typography
          variant="h5"
          sx={{
            textAlign: 'center',
            mb: 2,
            color: 'green',
            fontWeight: 'medium',
          }}
        >
          Montant Reçu : {amountPaid.toFixed(2)} CFA
        </Typography>

        <Typography
          variant="h5"
          sx={{
            textAlign: 'center',
            mb: 2,
            color: 'blue',
            fontWeight: 'medium',
          }}
        >
          Monnaie à Rendre : {changeDue.toFixed(2)} CFA
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Grid container spacing={2} sx={{ maxWidth: 350 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '00', '000'].map((num, index) => (
              <Grid item xs={4} key={index}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleKeyPress(num.toString())}
                  sx={{
                    fontSize: '1.8rem',
                    py: 2,
                    fontWeight: 'bold',
                  }}
                >
                  {num}
                </Button>
              </Grid>
            ))}
            <Grid item xs={4}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleKeyPress('C')}
                sx={{
                  fontSize: '1.8rem',
                  py: 2,
                  color: 'red',
                  fontWeight: 'bold',
                }}
              >
                C
              </Button>
            </Grid>

            <Grid item xs={4}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleKeyPress('delete')}
                sx={{
                  fontSize: '1.8rem',
                  py: 2,
                  color: 'red',
                  fontWeight: 'bold',
                }}
              >
                &larr;
              </Button>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', padding: 3 }}>
        <Button
          onClick={onClose}
          color="secondary"
          variant="outlined"
          sx={{
            fontWeight: 'bold',
            fontSize: '1.2rem',
            padding: '10px 20px',
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleConfirmCashPayment}
          variant="contained"
          color="primary"
          sx={{
            fontWeight: 'bold',
            fontSize: '1.2rem',
            padding: '10px 20px',
          }}
          disabled={amountPaid < calculateTotalPrice()}
        >
          Confirmer le Paiement
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(CashPaymentDialog);
