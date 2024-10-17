// OnScreenKeyboard.jsx

import React from 'react';
import { Box, Button, Grid } from '@mui/material';

const keys = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ['Space', 'Backspace', 'Enter'],
];

const OnScreenKeyboard = ({ value, onChange, onClose }) => {
  const handleKeyPress = (key) => {
    if (key === 'Backspace') {
      onChange(value.slice(0, -1));
    } else if (key === 'Space') {
      onChange(value + ' ');
    } else if (key === 'Enter') {
      onClose();
    } else {
      onChange(value + key);
    }
  };

  return (
    <Box sx={{ mt: 2, backgroundColor: '#f0f0f0', padding: 2, borderRadius: 2, boxShadow: 3 }}>
      {/* Map through each row */}
      {keys.map((row, rowIndex) => (
        <Grid container key={rowIndex} spacing={1} sx={{ justifyContent: 'center', mb: 1 }}>
          {row.map((key) => (
            <Grid item key={key}>
              <Button
                variant={key === 'Enter' || key === 'Backspace' || key === 'Space' ? 'contained' : 'outlined'}
                color={key === 'Enter' ? 'primary' : key === 'Backspace' ? 'error' : 'default'}
                onClick={() => handleKeyPress(key)}
                sx={{
                  minWidth: key === 'Space' ? 180 : 50,
                  minHeight: 50,
                  mx: 0.5,
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  backgroundColor: key === 'Space' ? '#e0e0e0' : undefined,
                }}
              >
                {key === 'Space' ? '␣' : key}
              </Button>
            </Grid>
          ))}
        </Grid>
      ))}
    </Box>
  );
};

export default OnScreenKeyboard;
