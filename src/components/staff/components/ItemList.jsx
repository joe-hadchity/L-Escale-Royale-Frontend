// components/ItemList.jsx

import React from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';

const ItemList = ({ items, loading, error, onItemClick, calculateItemPrice }) => {
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="body1" color="error" textAlign="center">
        {error}
      </Typography>
    );
  }

  return (
    <Grid
      container
      spacing={1}
      sx={{
        maxHeight: '70vh',
        overflowY: 'auto',
        paddingRight: '8px',
      }}
    >
      {items.map((item) => (
        <Grid item xs={2.4} key={item._id}>
          <Card
            elevation={1}
            sx={{
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: '#F9FAFB',
              height: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              transition: 'background-color 0.2s',
              '&:hover': {
                backgroundColor: '#E8F0FE',
              },
            }}
            onClick={() => onItemClick(item)}
          >
            <CardContent
              sx={{
                textAlign: 'center',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontWeight: '500',
                  fontSize: '1rem',
                  color: '#212121',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  maxWidth: '100%',
                }}
              >
                {item.Name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: '400',
                  color: '#616161',
                  marginTop: '4px',
                }}
              >
                {calculateItemPrice(item)} CFA
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default React.memo(ItemList);
