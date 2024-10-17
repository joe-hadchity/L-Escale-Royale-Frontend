import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Box,
  Stack,
  Badge,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useOrder } from '../../context/OrderContext';

const TOTAL_TABLES = 24;

const Dashboard = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [payLaterOrders, setPayLaterOrders] = useState([]);
  const [payLaterDialogOpen, setPayLaterDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { setSelectedOrder } = useOrder();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch pending orders
        const pendingResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/Order/GetOrderByStatus/Pending`
        );
        const filteredPendingOrders = pendingResponse.data.filter(
          (order) => order.Type !== 'Dine In'
        );
        setPendingOrders(filteredPendingOrders);

        // Fetch pay later orders
        const payLaterResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/Order/GetOrderByStatus/Pay%20Later`
        );
        setPayLaterOrders(payLaterResponse.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        if (error.response) {
          console.error('Détails de l\'erreur:', error.response.data);
        }
      }
    };

    fetchOrders();
  }, []);

  const handleTableClick = (tableNumber) => {
    const existingOrder = pendingOrders.find(
      (order) => order.TableNumber === tableNumber.toString()
    );
    if (existingOrder) {
      setSelectedOrder({
        ...existingOrder,
        TableNumber: tableNumber.toString(),
      });
      navigate('/staff/order', { state: { orderNumber: existingOrder.OrderNumber } });
    } else {
      const newOrder = {
        Type: 'Dine In',
        TableNumber: tableNumber.toString(),
        Items: [],
      };
      setSelectedOrder(newOrder);
      navigate('/staff/order');
    }
  };

  const handleTakeawayClick = () => {
    const takeawayOrder = {
      Type: 'TakeAway',
      TableNumber: 'N/A', // Set TableNumber to "N/A" for TakeAway orders
      Items: [],
    };
    setSelectedOrder(takeawayOrder);
    navigate('/staff/order');
  };

  const handleDeliveryClick = () => {
    const deliveryOrder = {
      Type: 'Delivery',
      TableNumber: 'N/A', // Set TableNumber to "N/A" for Delivery orders (if applicable)
      Items: [],
    };
    setSelectedOrder(deliveryOrder);
    navigate('/staff/order');
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    navigate('/staff/order', { state: { orderNumber: order.OrderNumber } });
  };

  const isTableOccupied = (tableNumber) => {
    return pendingOrders.some(
      (order) => order.TableNumber === tableNumber.toString()
    );
  };

  const handlePayLaterDialogOpen = () => setPayLaterDialogOpen(true);
  const handlePayLaterDialogClose = () => setPayLaterDialogOpen(false);

  return (
    <Container
      maxWidth="xl"
      sx={{
        paddingY: 4,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Grid container spacing={1} sx={{ flexGrow: 1 }}>
        {/* Table Status Section */}
        <Grid
          item
          xs={12}
          md={8}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Paper
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: 3,
              padding: 3,
              overflow: 'hidden',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#3949ab',
                mb: 2,
              }}
            >
              Statut des tables
            </Typography>

            {/* Scrollable Box for Tables */}
            <Box
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
              }}
            >
              <Grid container spacing={2} columns={6}>
                {[...Array(TOTAL_TABLES)].map((_, index) => {
                  const tableNumber = index + 1;
                  const occupied = isTableOccupied(tableNumber);

                  return (
                    <Grid
                      item
                      xs={1}
                      key={tableNumber}
                      sx={{ display: 'flex', justifyContent: 'center' }}
                    >
                      <Paper
                        sx={{
                          width: '100%',
                          aspectRatio: '1/1',
                          padding: 1,
                          borderLeft: `6px solid ${occupied ? '#f44336' : '#66bb6a'}`,
                          backgroundColor: occupied ? '#ffcdd2' : '#c8e6c9',
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          borderRadius: 2,
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                          },
                        }}
                        onClick={() => handleTableClick(tableNumber)}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Table {tableNumber}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: '500' }}>
                            {occupied ? 'Occupée' : 'Disponible'}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Pending Orders Section */}
        <Grid
          item
          xs={12}
          md={4}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Paper
            sx={{
              flexGrow: 1,
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: 3,
              padding: 3,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#3949ab',
                  mb: 2,
                }}
              >
                Commandes en attente
              </Typography>
              {/* Notification Icon for Pay Later Orders */}
              <IconButton onClick={handlePayLaterDialogOpen}>
                <Badge
                  color="error"
                  variant="dot"
                  invisible={payLaterOrders.length === 0}
                >
                  <NotificationsIcon fontSize="large" />
                </Badge>
              </IconButton>
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                maxHeight: '350px',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f0f0f0',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#bdbdbd',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#9e9e9e',
                },
              }}
            >
              <Stack spacing={1} sx={{ paddingRight: '1px' }}>
                {pendingOrders.map((order) => (
                  <Paper
                    key={order.OrderNumber}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 2,
                      borderRadius: 2,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 'bold', color: '#333' }}
                      >
                        Commande N°{order.OrderNumber}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {order.Type}{' '}
                        {order.TableNumber && `(Table: ${order.TableNumber})`}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOrderClick(order)}
                      sx={{ textTransform: 'none', minWidth: '100px' }}
                      startIcon={<VisibilityIcon />}
                    >
                      Voir
                    </Button>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Paper>

          {/* Takeaway & Delivery Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              sx={{
                flexGrow: 1,
                padding: 2,
                fontWeight: 'bold',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                textTransform: 'none',
                background: 'linear-gradient(145deg, #ff1744, #d50000)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(145deg, #d50000, #b71c1c)',
                },
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                borderRadius: 3,
              }}
              onClick={handleTakeawayClick}
            >
              <AddShoppingCartIcon sx={{ fontSize: '2rem' }} />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'left',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Commande à Emporter
                </Typography>
              </Box>
            </Button>

            <Button
              variant="contained"
              sx={{
                flexGrow: 1,
                padding: 2,
                fontWeight: 'bold',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                textTransform: 'none',
                background: 'linear-gradient(145deg, #00e676, #00c853)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(145deg, #00c853, #009624)',
                },
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                borderRadius: 3,
              }}
              onClick={handleDeliveryClick}
            >
              <DeliveryDiningIcon sx={{ fontSize: '2rem' }} />
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'left',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Commande de Livraison
                </Typography>
              </Box>
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Dialog for Pay Later Orders */}
      <Dialog
        open={payLaterDialogOpen}
        onClose={handlePayLaterDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Commandes à Payer Plus Tard
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {payLaterOrders.map((order) => (
              <Paper
                key={order.OrderNumber}
                sx={{
                  padding: 2,
                  borderRadius: 1,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  border: '1px solid #e0e0e0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 'bold', color: '#333' }}
                  >
                    Commande N°{order.OrderNumber}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {order.Type}{' '}
                    {order.TableNumber && `(Table: ${order.TableNumber})`}
                  </Typography>
                  {/* Display note if available */}
                  {order.Note && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ fontStyle: 'italic', mt: 1 }}
                    >
                      Note: {order.Note}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleOrderClick(order)}
                  sx={{ textTransform: 'none', minWidth: '100px' }}
                  startIcon={<VisibilityIcon />}
                >
                  Voir
                </Button>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePayLaterDialogClose} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
