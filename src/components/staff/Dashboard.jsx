import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Paper,
    Button,
    Box,
    Stack,
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PaymentIcon from '@mui/icons-material/Payment';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useOrder } from '../../context/OrderContext';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';

const TOTAL_TABLES = 18;

const Dashboard = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [tableNumber, setTableNumber] = useState(''); // Local state for tableNumber
    const navigate = useNavigate();
    const { setSelectedOrder } = useOrder(); // No setTableNumber needed here
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPendingOrders = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/Order/GetOrderByStatus/Pending`);
                setPendingOrders(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des commandes:', error);
                if (error.response) {
                    console.error('Détails de l\'erreur:', error.response.data);
                }
            }
        };
        fetchPendingOrders();
    }, []);

    const handleTableClick = (tableNumber) => {
        const existingOrder = pendingOrders.find(order => order.TableNumber === tableNumber.toString());
        if (existingOrder) {
            setSelectedOrder({
                ...existingOrder,
                TableNumber: tableNumber.toString(), // Ensure TableNumber is set
            });
            navigate('/staff/order', { state: { orderNumber: existingOrder.OrderNumber } });
        } else {
            const newOrder = {
                Type: 'Dine In',
                TableNumber: tableNumber.toString(), // Ensure TableNumber is set
                Items: [],
            };
            setSelectedOrder(newOrder);
            navigate('/staff/order');
        }
    };
    
    const handleTakeawayClick = () => {
        const takeawayOrder = {
            Type: 'TakeAway',
            Items: [],
        };
        setSelectedOrder(takeawayOrder);
        navigate('/staff/order');
    };

    const handleDeliveryClick = () => {
        const deliveryOrder = {
            Type: 'Delivery',
            Items: [],
        };
        setSelectedOrder(deliveryOrder);
        navigate('/staff/order');
    };

    const handleOrderClick = (order) => {
        setTableNumber(order.TableNumber); // Set table number from the order
        setSelectedOrder(order);
        navigate('/staff/order', { state: { orderNumber: order.OrderNumber } });
    };

    const handlePayLaterClick = async (order) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/Order/UpdateOrderByOrderNumber/${order.OrderNumber}`, {
                ...order,
                Status: 'Pay Later',
            });

            setPendingOrders(prevOrders =>
                prevOrders.map(o => o.OrderNumber === order.OrderNumber ? { ...o, Status: 'Pay Later' } : o)
            );
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la commande:', error);
        }
    };

    const isTableOccupied = (tableNumber) => {
        return pendingOrders.some(order => order.TableNumber === tableNumber.toString());
    };

    return (
        <Container maxWidth="xl" sx={{ height: '95vh', padding: 2, overflow: 'hidden', backgroundColor: '#f9f9f9' }}>
            <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
                Tableau de bord
            </Typography>

            <Grid container spacing={3} sx={{ height: 'calc(100% - 64px)' }}>
                {/* Table Status Section */}
                <Grid item xs={12} md={5} sx={{ height: '100%' }}>
                    <Paper
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h5" sx={{ padding: 3, textAlign: 'center', fontWeight: 'bold', color: '#555' }}>
                            Statut des tables
                        </Typography>
                        <PerfectScrollbar style={{ flex: 1 }}>
                            <Grid container spacing={2} columns={4} sx={{ padding: 3 }}>
                                {[...Array(TOTAL_TABLES)].map((_, index) => {
                                    const tableNumber = index + 1;
                                    const occupied = isTableOccupied(tableNumber);

                                    return (
                                        <Grid item xs={1} key={tableNumber} sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <Paper
                                                sx={{
                                                    width: '100%',
                                                    aspectRatio: '1/1',
                                                    padding: 1,
                                                    borderLeft: `6px solid ${occupied ? '#ff9800' : '#4caf50'}`,
                                                    backgroundColor: occupied ? '#ffe0b2' : '#c8e6c9',
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
                        </PerfectScrollbar>
                    </Paper>
                </Grid>

                {/* Pending Orders & Takeaway Button */}
                <Grid item xs={12} md={7} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Paper
                        sx={{
                            flexGrow: 1,
                            backgroundColor: '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                            borderRadius: 2,
                            padding: 2,
                        }}
                    >
                        <Typography variant="h5" sx={{ padding: 2, textAlign: 'center', fontWeight: 'bold', color: '#555' }}>
                            Commandes en attente
                        </Typography>
                        {/* Scrollable Pending Orders */}
                        <PerfectScrollbar style={{ height: '50vh' }}>
                            <Stack spacing={1} sx={{ padding: 2 }}>
                                {pendingOrders.map((order) => (
                                    <Paper
                                        key={order.OrderNumber}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: 2,
                                            borderRadius: 1,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            border: '1px solid #e0e0e0',
                                        }}
                                    >
                                        {/* Order Details */}
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                                                Commande N°{order.OrderNumber}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {order.Type} {order.TableNumber && `(Table: ${order.TableNumber})`}
                                            </Typography>
                                        </Box>
                                        {/* Action Buttons */}
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleOrderClick(order)}
                                                sx={{ textTransform: 'none', minWidth: '100px' }}
                                                startIcon={<VisibilityIcon />}
                                            >
                                                Voir
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => handlePayLaterClick(order)}
                                                sx={{ textTransform: 'none', minWidth: '100px' }}
                                                startIcon={<PaymentIcon />}
                                            >
                                                Payer plus tard
                                            </Button>
                                        </Box>
                                    </Paper>
                                ))}
                            </Stack>
                        </PerfectScrollbar>
                    </Paper>

                    {/* Takeaway & Delivery Buttons */}
                    <Box sx={{ padding: 2, display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            sx={{
                                flexGrow: 1,
                                padding: 1.5,
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                textTransform: 'none',
                                backgroundColor: '#f50057',
                                '&:hover': {
                                    backgroundColor: '#c51162',
                                },
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            }}
                            onClick={handleTakeawayClick}
                        >
                            <AddShoppingCartIcon />
                            Nouvelle commande à emporter
                        </Button>

                        {/* New Delivery Button */}
                        <Button
                            variant="contained"
                            sx={{
                                flexGrow: 1,
                                padding: 1.5,
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                textTransform: 'none',
                                backgroundColor: '#00c853',
                                '&:hover': {
                                    backgroundColor: '#009624',
                                },
                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                            }}
                            onClick={handleDeliveryClick}
                        >
                            <DeliveryDiningIcon />
                            Nouvelle commande de livraison
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;
