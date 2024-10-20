
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
} from '@mui/material';
import {
  Money,
  CreditCard,
  MobileFriendly,
  Replay,
  Print,
  Discount,
} from '@mui/icons-material';

const PaymentDialog = ({
  open,
  onClose,
  onPaymentMethodSelect,
  onPrintOrder,
  onApplyDiscount,
  note,
  setNote,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{ maxHeight: '90vh' }}
    >
      <DialogTitle
        sx={{
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: '1.4rem',
          padding: '10px 0',
        }}
      >
        Mode de Paiement
      </DialogTitle>

      <DialogContent dividers={false} sx={{ paddingY: 2 }}>
        {/* Payment Method Options */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          <Button
            variant="contained"
            color="primary"
            sx={{
              width: '100%',
              padding: '12px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}
            onClick={() => onPaymentMethodSelect('Cash')}
            startIcon={<Money sx={{ fontSize: 30 }} />}
          >
            Espèces
          </Button>

          <Button
            variant="contained"
            color="secondary"
            sx={{
              width: '100%',
              padding: '12px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}
            onClick={() => onPaymentMethodSelect('Card')}
            startIcon={<CreditCard sx={{ fontSize: 30 }} />}
          >
            Carte
          </Button>

          <Button
            variant="contained"
            color="success"
            sx={{
              width: '100%',
              padding: '12px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}
            onClick={() => onPaymentMethodSelect('Airtel')}
            startIcon={<MobileFriendly sx={{ fontSize: 30 }} />}
          >
            Airtel
          </Button>

          <Button
            variant="contained"
            color="warning"
            sx={{
              width: '100%',
              padding: '12px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}
            onClick={() => onPaymentMethodSelect('Pay Later')}
            startIcon={<Replay sx={{ fontSize: 30 }} />}
          >
            Payer Plus Tard
          </Button>
        </Box>

        {/* Top Action Buttons: Print Order and Apply Discount */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 1.5,
            mt: 2,
          }}
        >
          <Button
            variant="outlined"
            color="info"
            sx={{
              width: '48%',
              padding: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
            }}
            onClick={onPrintOrder}
            startIcon={<Print sx={{ fontSize: 25 }} />}
          >
            Imprimer
          </Button>

          <Button
            variant="outlined"
            color="success"
            sx={{
              width: '48%',
              padding: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
            }}
            onClick={onApplyDiscount}
            startIcon={<Discount sx={{ fontSize: 25 }} />}
          >
            Rabais
          </Button>
        </Box>

        {/* Optional Note Input */}
        <TextField
          label="Ajouter une Note (Optionnel)"
          fullWidth
          variant="outlined"
          value={note}
          onFocus={() => setNote(note)}
          onChange={(e) => setNote(e.target.value)}
          sx={{ mt: 2, mb: 2 }}
        />
      </DialogContent>

      {/* Proceed and Cancel Buttons */}
      <DialogActions
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 1.5,
          paddingY: 2,
        }}
      >
        <Button
          onClick={() => onPaymentMethodSelect('Proceed')}
          variant="contained"
          color="primary"
          sx={{
            width: '48%',
            padding: '10px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}
        >
          Procéder
        </Button>

        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          sx={{
            width: '48%',
            padding: '10px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}
        >
          Annuler
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(PaymentDialog);