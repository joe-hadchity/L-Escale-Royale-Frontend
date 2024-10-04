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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
    try {
      setLoading(true);
      setError(null); // Reset any previous errors

      let apiUrl = `${process.env.REACT_APP_API_URL}/Order/GetOrdersinProcess`; // Default fallback

      // Search by order number
      if (searchOrder) {
        apiUrl = `${process.env.REACT_APP_API_URL}/Order/GetOrderByOrderNumber/${searchOrder}`;
      }
      // Search by date
      else if (searchDate) {
        const formattedDate = formatDate(searchDate); // Format the date as dd/MM/yyyy
        apiUrl = `${process.env.REACT_APP_API_URL}/Order/GetOrderByDate?date=${formattedDate}`;
      } else {
        setError('Veuillez entrer un numéro de commande ou sélectionner une date pour rechercher.');
        setLoading(false);
        return;
      }

      // Make the API request with a timeout of 10 seconds
      const source = axios.CancelToken.source();
      const timeout = setTimeout(() => {
        source.cancel('La requête a expiré. Veuillez réessayer.');
      }, 10000);

      const response = await axios.get(apiUrl, { cancelToken: source.token });
      clearTimeout(timeout);

      // Handle both array and single object response
      const responseData = Array.isArray(response.data) ? response.data : [response.data];
      
      // If no data is found, set an appropriate error message
      if (responseData.length === 0) {
        setError('Aucune commande trouvée pour les critères donnés.');
      } else {
        setHistory(responseData);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.error('Request canceled:', error.message);
        setError('La requête a expiré. Veuillez réessayer.');
      } else {
        console.error('Erreur lors de la récupération de l\'historique:', error);
        setError('Échec de la récupération des commandes. Veuillez réessayer.');
      }
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
      {!loading && history.length > 0 && (
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
                <TableCell>Prix total (CFA)</TableCell>
                <TableCell>Articles</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((order, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{order.Created_by || 'N/A'}</TableCell>
                  <TableCell>{order.DateOfOrder || 'N/A'}</TableCell>
                  <TableCell>{order.OrderNumber || 'N/A'}</TableCell>
                  <TableCell>{order.Type || 'N/A'}</TableCell>
                  <TableCell>{order.Status || 'N/A'}</TableCell>
                  <TableCell>{order.TableNumber || 'N/A'}</TableCell>
                  <TableCell>
                    {order.DeleiveryCharge ? `${order.DeleiveryCharge.toFixed(2)} ` : 'N/A'}
                  </TableCell>
                  <TableCell>{order.Location || 'N/A'}</TableCell>
                  <TableCell>
                    {order.TotalPrice ? `${order.TotalPrice.toFixed(2)} ` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {/* Accordion for displaying items */}
                    {order.Items && order.Items.length > 0 ? (
                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Voir les articles ({order.Items.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List>
                            {order.Items.map((item, i) => (
                              <ListItem key={i}>
                                <ListItemText
                                  primary={`Nom: ${item.Name || 'Nom indisponible'}`}
                                  secondary={`Quantité: ${item.Quantity}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    ) : (
                      'Aucun article'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Display message if no history found */}
      {!loading && history.length === 0 && !error && (
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Aucun résultat trouvé.
        </Typography>
      )}
    </Box>
  );
};

export default History;
