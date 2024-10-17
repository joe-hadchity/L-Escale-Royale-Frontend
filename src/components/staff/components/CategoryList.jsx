// components/CategoryList.jsx

import React from 'react';
import { Button, Box, Typography } from '@mui/material';

const CategoryList = ({ categories, selectedCategory, onSelectCategory }) => (
  <Box>
    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center' }}>
      Categories
    </Typography>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflowY: 'auto',
        height: '90vh',
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f0f0f0',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#c0c0c0',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#a0a0a0',
        },
      }}
    >
      {categories.map((category) => (
        <Button
          key={category._id || category.Name}
          variant={selectedCategory === category.Name ? 'contained' : 'outlined'}
          onClick={() => onSelectCategory(category.Name)}
          fullWidth
          sx={{
            padding: '10px',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '8px',
          }}
        >
          {category.Name}
        </Button>
      ))}
    </Box>
  </Box>
);

export default React.memo(CategoryList);
