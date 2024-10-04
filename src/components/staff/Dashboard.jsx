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

const TOTAL_TABLES = 18;

const Dashboard = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [payLaterOrders, setPayLaterOrders] = useState([]);
    const [payLaterDialogOpen, setPayLaterDialogOpen] = useState(false);
    const navigate = useNavigate();
    const { setSelectedOrder } = useOrder();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const pendingResponse = await axios.get(`${process.env.REACT_APP_API_URL}/Order/GetOrderByStatus/Pending`);
                setPendingOrders(pendingResponse.data);

                const payLaterResponse = await axios.get(`${process.env.REACT_APP_API_URL}/Order/GetOrderByStatus/Pay%20Later`);
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
        const existingOrder = pendingOrders.find(order => order.TableNumber === tableNumber.toString());
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
        setSelectedOrder(order);
        navigate('/staff/order', { state: { orderNumber: order.OrderNumber } });
    };

    const isTableOccupied = (tableNumber) => {
        return pendingOrders.some(order => order.TableNumber === tableNumber.toString());
    };

    const handlePayLaterDialogOpen = () => setPayLaterDialogOpen(true);
    const handlePayLaterDialogClose = () => setPayLaterDialogOpen(false);

    return (
        <Container maxWidth="xl" sx={{ paddingY: 4, height: '100vh', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h4" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold', color: '#2c387e' }}>
                Tableau de bord
            </Typography>

            {/* Notification Icon for Pay Later Orders */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
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

            <Grid container spacing={3} sx={{ flexGrow: 1 }}>
                {/* Table Status Section */}
                <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Paper
                        sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            borderRadius: 3,
                            padding: 3,
                            overflow: 'auto',
                        }}
                    >
                        <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#3949ab', mb: 2 }}>
                            Statut des tables
                        </Typography>
                        <Grid container spacing={2} columns={4}>
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
                    </Paper>
                </Grid>

                {/* Pending Orders Section */}
                <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Paper
                        sx={{
                            flexGrow: 1,
                            backgroundColor: '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            borderRadius: 3,
                            padding: 3,
                            overflow: 'auto',
                        }}
                    >
                        <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#3949ab', mb: 2 }}>
                            Commandes en attente
                        </Typography>
                        <Stack spacing={2}>
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
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                                            Commande N°{order.OrderNumber}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {order.Type} {order.TableNumber && `(Table: ${order.TableNumber})`}
                                        </Typography>
                                    </Box>
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
                                    </Box>
                                </Paper>
                            ))}
                        </Stack>
                    </Paper>

                    {/* Takeaway & Delivery Buttons */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
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

            {/* Dialog for Pay Later Orders */}
            <Dialog open={payLaterDialogOpen} onClose={handlePayLaterDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Commandes à Payer Plus Tard</DialogTitle>
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
                                }}
                            >
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                                    Commande N°{order.OrderNumber}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {order.Type} {order.TableNumber && `(Table: ${order.TableNumber})`}
                                </Typography>
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
