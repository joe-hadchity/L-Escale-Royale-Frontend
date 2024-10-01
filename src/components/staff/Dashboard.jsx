import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Divider,
    Paper,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useOrder } from '../../context/OrderContext';

const TOTAL_TABLES = 18;

const Dashboard = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const navigate = useNavigate();
    const { setSelectedOrder } = useOrder();

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
            setSelectedOrder(existingOrder);
            // Redirect with `OrderNumber` for editing
            navigate('/staff/order', { state: { orderNumber: existingOrder.OrderNumber } });
        } else {
            const newOrder = {
                Type: 'Sur place',
                TableNumber: tableNumber.toString(),
                Items: [],
            };
            setSelectedOrder(newOrder);
            navigate('/staff/order');
        }
    };

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
        // Redirect with `OrderNumber` for editing
        navigate('/staff/order', { state: { orderNumber: order.OrderNumber } });
    };

    const handleTakeawayClick = () => {
        const takeawayOrder = {
            Type: 'À emporter',
            Items: [],
        };
        setSelectedOrder(takeawayOrder);
        navigate('/staff/order');
    };

    const isTableOccupied = (tableNumber) => {
        return pendingOrders.some(order => order.TableNumber === tableNumber.toString());
    };

    return (
        <Container maxWidth="xl" sx={{ padding: 2, height: '100vh', backgroundColor: '#f7f7f7' }}>
            <Typography variant="h4" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
                Tableau de bord - Statut des tables & Commandes en attente
            </Typography>

            <Grid container spacing={2} sx={{ height: 'calc(100% - 64px)' }}>
                {/* Table Status Section */}
                <Grid item xs={12} md={8} sx={{ height: '100%' }}>
                    <Paper sx={{ padding: 2, height: '100%', overflowY: 'auto', backgroundColor: '#ffffff' }}>
                        <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
                            Statut des tables
                        </Typography>
                        <Grid container spacing={1}>
                            {[...Array(TOTAL_TABLES)].map((_, index) => {
                                const tableNumber = index + 1;
                                const occupied = isTableOccupied(tableNumber);

                                return (
                                    <Grid item xs={3} sm={3} md={2} lg={2} key={tableNumber}>
                                        <Card
                                            variant="outlined"
                                            sx={{
                                                padding: 1,
                                                borderLeft: `5px solid ${occupied ? '#ff9800' : '#4caf50'}`,
                                                backgroundColor: occupied ? '#ffccbc' : '#c8e6c9',
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s',
                                                '&:hover': { transform: 'scale(1.05)' },
                                            }}
                                            onClick={() => handleTableClick(tableNumber)}
                                        >
                                            <CardContent sx={{ textAlign: 'center' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                    Table {tableNumber}
                                                </Typography>
                                                <Typography variant="body2">
                                                    Statut: {occupied ? 'Occupée' : 'Disponible'}
                                                </Typography>
                                                {occupied && (
                                                    <Typography variant="body2" color="textSecondary">
                                                        Commande en attente: {pendingOrders.find(order => order.TableNumber === tableNumber.toString()).OrderNumber}
                                                    </Typography>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Pending Orders & Takeaway Button */}
                <Grid item xs={12} md={4} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Paper sx={{ padding: 2, flexGrow: 1, overflowY: 'auto', backgroundColor: '#ffffff' }}>
                        <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
                            Commandes en attente
                        </Typography>
                        <List>
                            {pendingOrders.map((order) => (
                                <React.Fragment key={order.OrderNumber}>
                                    <ListItem 
                                        alignItems="flex-start"
                                        button
                                        onClick={() => handleOrderClick(order)}
                                        sx={{ borderLeft: `5px solid #ff9800`, mb: 1 }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    Commande N°{order.OrderNumber} - {order.Type} {order.TableNumber && `(Table: ${order.TableNumber})`}
                                                </Typography>
                                            }
                                            secondary={
                                                <>
                                                    <Typography variant="body2" color="textSecondary">
                                                        <strong>Statut:</strong> {order.Status}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        <strong>Articles:</strong> {order.Items.length} articles
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    <Divider />
                                </React.Fragment>
                            ))}
                        </List>
                    </Paper>

                    {/* Takeaway Button */}
                    <Paper sx={{ marginTop: 2, padding: 2, backgroundColor: '#ff4081' }}>
                        <Button 
                            variant="contained" 
                            sx={{ padding: 1.5, fontWeight: 'bold', width: '100%', backgroundColor: '#ff4081', color: '#fff' }}
                            onClick={handleTakeawayClick}
                        >
                            Nouvelle commande à emporter
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Dashboard;
