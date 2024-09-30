import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Divider,
    Paper,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useOrder } from '../../context/OrderContext'; // Import useOrder

const TOTAL_TABLES = 20; // Total number of tables in the restaurant

const Dashboard = () => {
    const [pendingOrders, setPendingOrders] = useState([]);
    const navigate = useNavigate();
    const { setSelectedOrder } = useOrder(); // Destructure setSelectedOrder from OrderContext

    // Fetch pending orders on mount
    useEffect(() => {
        const fetchPendingOrders = async () => {
            try {
                console.log('Fetching pending orders...');
                
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/Order/GetOrderByStatus/Pending`);
                
                console.log('Response data:', response.data); // Log the full response data

                // Set pending orders state
                setPendingOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
                // Log specific error details if available
                if (error.response) {
                    console.error('Error response data:', error.response.data);
                    console.error('Error response status:', error.response.status);
                }
            }
        };

        fetchPendingOrders();
    }, []);

    // Handle click for dine-in orders
    const handleTableClick = (tableNumber) => {
        const existingOrder = pendingOrders.find(order => order.TableNumber === tableNumber.toString());

        if (existingOrder) {
            // If the table is occupied, set the existing order
            setSelectedOrder(existingOrder);
        } else {
            // If the table is available, create a new dine-in order
            const newOrder = {
                Type: 'Dine In',
                TableNumber: tableNumber.toString(),
                Items: [],
            };
            setSelectedOrder(newOrder);
        }
        navigate('/staff/order'); // Redirect to order page
    };

    // Handle click for takeaway orders
    const handleTakeawayClick = () => {
        const takeawayOrder = {
            Type: 'Takeaway',
            Items: [],
        };
        setSelectedOrder(takeawayOrder);
        navigate('/staff/order'); // Redirect to order page
    };

    // Check if a table is occupied based on pending orders
    const isTableOccupied = (tableNumber) => {
        return pendingOrders.some(order => order.TableNumber === tableNumber.toString());
    };

    return (
        <Container maxWidth="xl" sx={{ padding: 2 }}>
            <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
                Dashboard - Table Status & Pending Orders
            </Typography>

            {/* Table Status Section */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[...Array(TOTAL_TABLES)].map((_, index) => {
                    const tableNumber = index + 1;
                    const occupied = isTableOccupied(tableNumber);

                    return (
                        <Grid item xs={12} md={4} lg={3} key={tableNumber}>
                            <Card
                                variant="outlined"
                                sx={{
                                    padding: 2,
                                    borderLeft: `5px solid ${occupied ? '#ff9800' : '#4caf50'}`,
                                    backgroundColor: occupied ? '#ffccbc' : '#c8e6c9',
                                    cursor: 'pointer',
                                }}
                                onClick={() => handleTableClick(tableNumber)}
                            >
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        Table {tableNumber}
                                    </Typography>
                                    <Typography variant="body2">
                                        Status: {occupied ? 'Occupied' : 'Available'}
                                    </Typography>
                                    {occupied && (
                                        <Typography variant="body2" color="textSecondary">
                                            Pending Order: {pendingOrders.find(order => order.TableNumber === tableNumber.toString()).OrderNumber}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Takeaway button */}
            <Grid container justifyContent="center" sx={{ mb: 4 }}>
                <Button 
                    variant="contained" 
                    color="secondary" 
                    sx={{ padding: 2, fontWeight: 'bold' }}
                    onClick={handleTakeawayClick}
                >
                    New Takeaway Order
                </Button>
            </Grid>

            {/* Pending Orders Section */}
            <Typography variant="h5" sx={{ mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
                Pending Orders
            </Typography>
            <Paper sx={{ padding: 2, maxHeight: '50vh', overflowY: 'auto', marginBottom: 4 }}>
                <List>
                    {pendingOrders.map((order) => (
                        <React.Fragment key={order.OrderNumber}>
                            <ListItem 
                                alignItems="flex-start"
                                button
                                onClick={() => handleTableClick(order.TableNumber)}
                            >
                                <ListItemText
                                    primary={
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            Order N°{order.OrderNumber} - {order.Type} {order.TableNumber && `(Table: ${order.TableNumber})`}
                                        </Typography>
                                    }
                                    secondary={
                                        <>
                                            <Typography variant="body2" color="textSecondary">
                                                <strong>Status:</strong> {order.Status}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                <strong>Items:</strong> {order.Items.length} items
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
        </Container>
    );
};

export default Dashboard;
