// components/AuthorizationDialog.jsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  IconButton,
} from '@mui/material';
import { Backspace } from '@mui/icons-material';

const AuthorizationDialog = ({ open, onClose, onAuthorize }) => {
  const [pinStr, setPinStr] = useState('');

  const handleKeyPress = (key) => {
    if (key === 'C') {
      setPinStr('');
    } else if (key === 'delete') {
      setPinStr((prev) => prev.slice(0, -1));
    } else {
      if (pinStr.length < 6) { // Assuming a maximum PIN length of 6 digits
        setPinStr((prev) => prev + key);
      }
    }
  };

  const handleAuthorize = () => {
    // Replace with your actual authorization logic
    const isAuthorized = pinStr === '123456'; // Example PIN

    if (isAuthorized) {
      onAuthorize();
      setPinStr('');
    } else {
      alert('Incorrect PIN');
      setPinStr('');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1.4rem' }}
      >
        Manager Authorization Required
      </DialogTitle>

      <DialogContent dividers>
        <Typography
          variant="h5"
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
                onClick={() => handleKeyPress('0')}
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
                onClick={() => handleKeyPress('delete')}
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
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', padding: 2 }}>
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
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(AuthorizationDialog);
