import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

const History = () => {
  const [history, setHistory] = useState([]);
  const [searchOrder, setSearchOrder] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to format the date as dd/MM/yyyy
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JS
    const year = d.getFullYear();

    return `${day}/${month}/${year}`; // Format the date as dd/MM/yyyy
  };

  // Fetch orders based on either order number or date
  const fetchFilteredHistory = async () => {
    console.log('Fetching history...');
    try {
      setLoading(true);
      setError(null); // Reset any previous errors

      let apiUrl = `${process.env.REACT_APP_API_URL}/Order/GetOrdersinProcess`; // Default fallback

      if (searchOrder) {
        console.log(`Searching by order number: ${searchOrder}`);
        apiUrl = `${process.env.REACT_APP_API_URL}/Order/GetOrderByOrderNumber/${searchOrder}`;
      } else if (searchDate) {
        const formattedDate = formatDate(searchDate); // Format the date before sending
        console.log(`Searching by date: ${formattedDate}`);
        apiUrl = `${process.env.REACT_APP_API_URL}/Order/GetOrderByDate?date=${formattedDate}`;
      } else {
        console.log('No search criteria provided.');
        setError('Please enter an order number or select a date to search.');
        setLoading(false);
        return;
      }

      console.log(`API URL: ${apiUrl}`);

      // Making API request
      const response = await axios.get(apiUrl);
      console.log('API response:', response.data);

      // Handle both array and single object response
      const responseData = Array.isArray(response.data) ? response.data : [response.data];
      setHistory(responseData);
    } catch (error) {
      console.error('Error fetching history:', error);
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Historique des commandes
      </Typography>

      {/* Search Bar */}
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 4 }}>
        <TextField
          label="Rechercher par numéro de commande"
          value={searchOrder}
          onChange={(e) => setSearchOrder(e.target.value)}
          fullWidth
        />
        <TextField
          label="Rechercher par date"
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <Button variant="contained" onClick={fetchFilteredHistory}>
          Rechercher
        </Button>
      </Box>

      {/* Display Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      )}

      {/* Display Error if Exists */}
      {error && (
        <Typography variant="body1" color="error" gutterBottom>
          {error}
        </Typography>
      )}

      {/* History Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Créé par</TableCell>
              <TableCell>Date de commande</TableCell>
              <TableCell>Numéro de commande</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Numéro de table</TableCell>
              <TableCell>Frais de livraison</TableCell>
              <TableCell>Emplacement</TableCell>
              <TableCell>Prix total</TableCell>
              <TableCell>Articles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.length > 0 ? (
              history.map((order, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{order.Created_by || 'N/A'}</TableCell>
                  <TableCell>{order.DateOfOrder || 'N/A'}</TableCell>
                  <TableCell>{order.OrderNumber || 'N/A'}</TableCell>
                  <TableCell>{order.Type || 'N/A'}</TableCell>
                  <TableCell>{order.Status || 'N/A'}</TableCell>
                  <TableCell>{order.TableNumber || 'N/A'}</TableCell>
                  <TableCell>
                    {order.DeleiveryCharge ? `${order.DeleiveryCharge.toFixed(2)} €` : 'N/A'}
                  </TableCell>
                  <TableCell>{order.Location || 'N/A'}</TableCell>
                  <TableCell>
                    {order.TotalPrice ? `${order.TotalPrice.toFixed(2)} €` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {order.Items && order.Items.length > 0 ? (
                      <ul>
                        {order.Items.map((item, i) => (
                          <li key={i}>
                            {item.Quantity} x {item.Price} €
                          </li>
                        ))}
                      </ul>
                    ) : (
                      'No items'
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  Aucune entrée trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default History;
