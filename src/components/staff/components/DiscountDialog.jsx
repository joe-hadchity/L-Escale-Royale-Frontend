// components/DiscountDialog.jsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { Backspace } from '@mui/icons-material';

const DiscountDialog = ({ open, onClose, onApplyDiscount }) => {
  const [step, setStep] = useState(1); // Step 1 for PIN, Step 2 for discount input
  const [pinStr, setPinStr] = useState('');
  const [discountStr, setDiscountStr] = useState('');

  // Handle PIN keypad presses
  const handlePinKeyPress = (key) => {
    if (key === 'C') {
      setPinStr('');
    } else if (key === 'delete') {
      setPinStr((prev) => prev.slice(0, -1));
    } else {
      if (pinStr.length < 6) {
        setPinStr((prev) => prev + key);
      }
    }
  };

  // Handle Discount keypad presses
  const handleDiscountKeyPress = (key) => {
    if (key === 'C') {
      setDiscountStr('');
    } else if (key === 'delete') {
      setDiscountStr((prev) => prev.slice(0, -1));
    } else {
      if (discountStr.length < 3 && !isNaN(Number(key))) {
        setDiscountStr((prev) => prev + key);
      }
    }
  };

  // Authorize based on the entered PIN
  const handleAuthorize = () => {
    const isAuthorized = pinStr === '123456'; // Replace with actual manager PIN
    if (isAuthorized) {
      setStep(2); // Proceed to discount input if authorized
    } else {
      alert('Incorrect PIN');
      setPinStr(''); // Reset the PIN input
    }
  };

  // Apply the discount after authorization
  const handleApplyDiscount = () => {
    const discountValue = Number(discountStr);
    if (discountValue >= 0 && discountValue <= 100) {
      onApplyDiscount(discountValue); // Apply the discount
      resetDialog(); // Reset the dialog
    } else {
      alert('Please enter a valid discount percentage (0-100).');
    }
  };

  // Reset the dialog state after applying or cancelling
  const resetDialog = () => {
    setPinStr('');
    setDiscountStr('');
    setStep(1);
    onClose();
  };

  return (
    <Dialog open={open} onClose={resetDialog} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1.4rem' }}>
        {step === 1 ? 'Manager Authorization' : 'Apply Discount'}
      </DialogTitle>

      <DialogContent dividers>
        {step === 1 ? (
          <>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                mb: 2,
                color: 'black',
                fontWeight: 'medium',
                letterSpacing: '0.3em',
              }}
            >
              {pinStr.replace(/./g, '•')}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Grid container spacing={2} sx={{ maxWidth: 250 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Grid item xs={4} key={num}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handlePinKeyPress(num.toString())}
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
                    onClick={() => handlePinKeyPress('C')}
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
                    onClick={() => handlePinKeyPress('0')}
                    sx={{
                      fontSize: '1.8rem',
                      py: 2,
                      fontWeight: 'bold',
                    }}
                  >
                    0
                  </Button>
                </Grid>

                <Grid item xs={4}>
                  <IconButton
                    onClick={() => handlePinKeyPress('delete')}
                    sx={{
                      fontSize: '1.8rem',
                      py: 2,
                      width: '100%',
                      height: '100%',
                      border: '1px solid rgba(0, 0, 0, 0.23)',
                      borderRadius: '4px',
                    }}
                  >
                    <Backspace fontSize="large" />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          </>
        ) : (
          <>
            <Typography
              variant="h6"
              sx={{
                textAlign: 'center',
                mb: 2,
                color: 'black',
                fontWeight: 'medium',
              }}
            >
              Discount: {discountStr ? `${discountStr}%` : '0%'}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Grid container spacing={2} sx={{ maxWidth: 250 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <Grid item xs={4} key={num}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handleDiscountKeyPress(num.toString())}
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
                    onClick={() => handleDiscountKeyPress('C')}
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
                    onClick={() => handleDiscountKeyPress('0')}
                    sx={{
                      fontSize: '1.8rem',
                      py: 2,
                      fontWeight: 'bold',
                    }}
                  >
                    0
                  </Button>
                </Grid>

                <Grid item xs={4}>
                  <IconButton
                    onClick={() => handleDiscountKeyPress('delete')}
                    sx={{
                      fontSize: '1.8rem',
                      py: 2,
                      width: '100%',
                      height: '100%',
                      border: '1px solid rgba(0, 0, 0, 0.23)',
                      borderRadius: '4px',
                    }}
                  >
                    <Backspace fontSize="large" />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', padding: 2 }}>
        {step === 1 ? (
          <>
            <Button
              onClick={resetDialog}
              color="inherit"
              variant="outlined"
              sx={{
                width: '48%',
                padding: '10px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAuthorize}
              variant="contained"
              color="primary"
              sx={{
                width: '48%',
                padding: '10px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
              }}
            >
              Authorize
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={resetDialog}
              color="inherit"
              variant="outlined"
              sx={{
                width: '48%',
                padding: '10px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyDiscount}
              variant="contained"
              color="primary"
              sx={{
                width: '48%',
                padding: '10px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
              }}
            >
              Apply
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DiscountDialog;
