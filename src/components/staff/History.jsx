import React, { useState, useEffect } from 'react';
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
  ListItemText,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const History = () => {
  const [history, setHistory] = useState([]);
  const [searchOrder, setSearchOrder] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Printing state
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [availablePrinters, setAvailablePrinters] = useState([]);
  const [orderToPrint, setOrderToPrint] = useState(null);

  // Fetch printers when the component mounts
  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const printers = await window.electronAPI.getPrinters();
        setAvailablePrinters(printers);
        console.log('Available Printers:', printers);
      } catch (error) {
        console.error('Error fetching printers:', error);
      }
    };

    fetchPrinters();
  }, []);

  // Function to format the date as dd/MM/yyyy
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JS
    const year = d.getFullYear();

    return `${day}/${month}/${year}`; // Format the date as dd/MM/yyyy
  };

  // Fetch orders based on either order number or date
  const fetchFilteredHistory = async (pageNumber = 1, pageSize = rowsPerPage) => {
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
        apiUrl = `${process.env.REACT_APP_API_URL}/Order/GetOrderByDate?date=${formattedDate}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
      } else {
        setError('Veuillez entrer un numéro de commande ou sélectionner une date pour rechercher.');
        setLoading(false);
        return;
      }

      // Make the API request
      const response = await axios.get(apiUrl);

      // Handle both array and single object response
      const responseData = Array.isArray(response.data) ? response.data : [response.data];

      // If no data is found, set an appropriate error message
      if (responseData.length === 0) {
        setError('Aucune commande trouvée pour les critères donnés.');
        setHistory([]);
      } else {
        setHistory(responseData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      setError('Échec de la récupération des commandes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    fetchFilteredHistory(newPage + 1, rowsPerPage);
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to the first page
    fetchFilteredHistory(1, newRowsPerPage);
  };

  // Handle print order
  const handlePrintOrder = (order) => {
    setOrderToPrint(order);
    setOpenPrintDialog(true);
  };

  // Handle confirm print
  const handleConfirmPrint = async () => {
    if (!selectedPrinter) {
      alert('Veuillez sélectionner une imprimante.');
      return;
    }

    // Close the dialog
    setOpenPrintDialog(false);

    // Determine the print format based on the printer name
    if (selectedPrinter === 'POS-80C-Cashier') {
      // Print as receipt
      await printReceipt(orderToPrint);
    } else {
      // Print as A4 invoice
      await printA4Invoice(orderToPrint);
    }
  };

  // Function to print receipt
  const printReceipt = async (order) => {
    // Generate the receipt content
    const printData = generateReceiptPrintData(order);

    const printOptions = {
      preview: false,
      printerName: selectedPrinter,
      copies: 1,
      timeOutPerLine: 400,
      silent: true,
    };

    try {
      const response = await window.electronAPI.printOrder(printData, printOptions);
      if (response.success) {
        alert('Le reçu a été imprimé avec succès.');
      } else {
        alert('Échec de l\'impression du reçu.');
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
      alert('Erreur lors de l\'impression du reçu.');
    }
  };

  // Function to generate receipt print data
  const generateReceiptPrintData = (order) => {
    const printData = [
      // Header
      {
        type: 'text',
        value: 'L\'Escale Royale',
        style: { textAlign: 'center', fontWeight: 'bold', fontSize: '26px' },
      },
      {
        type: 'text',
        value: '123 Royal Street, Paris, France',
        style: { textAlign: 'center', fontSize: '14px' },
      },
      {
        type: 'text',
        value: 'Téléphone: +33 1 23 45 67 89',
        style: { textAlign: 'center', fontSize: '14px' },
      },
      {
        type: 'text',
        value: '----------------------------------------',
        style: { textAlign: 'center' },
      },
      // Order Information
      {
        type: 'text',
        value: `Commande N°: ${order.OrderNumber}`,
        style: { textAlign: 'left', fontSize: '14px', fontWeight: 'bold' },
      },
      {
        type: 'text',
        value: `Date: ${order.DateOfOrder}`,
        style: { textAlign: 'left', fontSize: '14px' },
      },
      {
        type: 'text',
        value: `Table: ${order.TableNumber || 'N/A'}`,
        style: { textAlign: 'left', fontSize: '14px' },
      },
      {
        type: 'text',
        value: '----------------------------------------',
        style: { textAlign: 'center' },
      },
      // Items Header
      {
        type: 'text',
        value: 'Article                    Qté     Prix',
        style: { textAlign: 'left', fontSize: '14px', fontWeight: 'bold', fontFamily: 'monospace' },
      },
    ];

    // Items
    order.Items.forEach(item => {
      const name = item.Name.padEnd(25, ' ');
      const quantity = item.Quantity.toString().padStart(3, ' ');
      const price = (item.Quantity * item.Price).toFixed(2).padStart(8, ' ');

      printData.push({
        type: 'text',
        value: `${name}${quantity}${price} CFA`,
        style: { textAlign: 'left', fontSize: '14px', fontFamily: 'monospace' },
      });
    });

    // Total
    printData.push(
      {
        type: 'text',
        value: '----------------------------------------',
        style: { textAlign: 'center' },
      },
      {
        type: 'text',
        value: `Total: ${order.TotalPrice.toFixed(2)} CFA`,
        style: { textAlign: 'right', fontSize: '16px', fontWeight: 'bold' },
      },
      {
        type: 'text',
        value: '----------------------------------------',
        style: { textAlign: 'center' },
      },
      // Footer
      {
        type: 'text',
        value: 'Merci pour votre commande!',
        style: { textAlign: 'center', fontSize: '14px', fontStyle: 'italic' },
      },
    );

    return printData;
  };

  // Function to print A4 invoice
  const printA4Invoice = async (order) => {
    // Generate the HTML content
    const invoiceHtml = generateInvoiceHtml(order);

    const printOptions = {
      preview: false,
      printerName: selectedPrinter,
      copies: 1,
      timeOutPerLine: 400,
      silent: true,
    };

    const printData = [
      {
        type: 'html',
        format: 'plain',
        value: invoiceHtml,
      },
    ];

    try {
      const response = await window.electronAPI.printOrder(printData, printOptions);
      if (response.success) {
        alert('La facture a été imprimée avec succès.');
      } else {
        alert('Échec de l\'impression de la facture.');
      }
    } catch (error) {
      console.error('Error printing invoice:', error);
      alert('Erreur lors de l\'impression de la facture.');
    }
  };

  // Function to generate invoice HTML
  const generateInvoiceHtml = (order) => {
    const itemsRows = order.Items.map(item => `
      <tr>
        <td>${item.Name}</td>
        <td>${item.Quantity}</td>
        <td>${item.Price.toFixed(2)} CFA</td>
        <td>${(item.Quantity * item.Price).toFixed(2)} CFA</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
      <head>
        <title>Facture</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2, h3 { text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #dddddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { text-align: right; margin-top: 20px; font-size: 1.2em; }
        </style>
      </head>
      <body>
        <h1>L'Escale Royale</h1>
        <p><strong>Adresse:</strong> 123 Royal Street, Paris, France</p>
        <p><strong>Téléphone:</strong> +33 1 23 45 67 89</p>
        <hr>
        <h2>Facture</h2>
        <p><strong>Date:</strong> ${order.DateOfOrder}</p>
        <p><strong>Numéro de commande:</strong> ${order.OrderNumber}</p>
        <p><strong>Table:</strong> ${order.TableNumber || 'N/A'}</p>
        <table>
          <thead>
            <tr>
              <th>Article</th>
              <th>Quantité</th>
              <th>Prix Unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>
        <p class="total"><strong>Total: ${order.TotalPrice.toFixed(2)} CFA</strong></p>
        <hr>
        <p style="text-align: center;">Merci pour votre visite!</p>
      </body>
      </html>
    `;

    return htmlContent;
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
        <Button
          variant="contained"
          onClick={() => fetchFilteredHistory()}
          sx={{
            padding: '8px 24px',
            fontSize: '16px',
            minWidth: '120px',
            textAlign: 'center',
            borderRadius: '8px',
          }}
        >
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
                <TableCell>Actions</TableCell> {/* New Actions Column */}
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((order, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
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
                  <TableCell>
                    <Button variant="outlined" onClick={() => handlePrintOrder(order)}>
                      Imprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Pagination component */}
          <TablePagination
            component="div"
            count={-1} // Indeterminate count to handle unknown total
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            labelRowsPerPage="Commandes par page"
          />
        </TableContainer>
      )}

      {/* Display message if no history found */}
      {!loading && history.length === 0 && !error && (
        <Typography variant="body1" color="textSecondary" gutterBottom>
          Aucun résultat trouvé.
        </Typography>
      )}

      {/* Printer Selection Dialog */}
      <Dialog open={openPrintDialog} onClose={() => setOpenPrintDialog(false)}>
        <DialogTitle>Sélectionner une imprimante</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Imprimante</InputLabel>
            <Select
              value={selectedPrinter}
              onChange={(e) => setSelectedPrinter(e.target.value)}
            >
              {availablePrinters.map((printer, index) => (
                <MenuItem key={index} value={printer.name}>
                  {printer.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrintDialog(false)} color="secondary">
            Annuler
          </Button>
          <Button onClick={handleConfirmPrint} variant="contained" color="primary">
            Imprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default History;
