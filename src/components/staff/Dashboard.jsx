import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
    Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useOrder } from '../../context/OrderContext'; // Import useOrder

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
                console.log('Response status:', response.status); // Log the status code
                console.log('Response headers:', response.headers); // Log the headers

                // Set pending orders state
                setPendingOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
                // Log specific error details if available
                if (error.response) {
                    console.error('Error response data:', error.response.data);
                    console.error('Error response status:', error.response.status);
                    console.error('Error response headers:', error.response.headers);
                }
            }
        };

        fetchPendingOrders();
    }, []);

    // Handle order click to navigate to Order page
    const handleOrderClick = (order) => {
        console.log('Selected Order:', order); // Log the selected order
        setSelectedOrder(order); // Store selected order in context

        // Verify that setSelectedOrder worked, add a brief timeout to log the context value
        setTimeout(() => {
            console.log('Order set in context:', order);
        }, 100);

        navigate('/staff/order'); // Redirect to order page
    };

    return (
        <Container maxWidth="xl" sx={{ padding: 2 }}>
            <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
                Dashboard - Pending Orders
            </Typography>

            {pendingOrders.length === 0 ? (
                <Typography variant="body1" textAlign="center">
                    No pending orders found
                </Typography>
            ) : (
                <Paper sx={{ padding: 2, maxHeight: '75vh', overflowY: 'auto' }}>
                    <List>
                        {pendingOrders.map((order) => (
                            <React.Fragment key={order.OrderNumber}>
                                <ListItem 
                                    alignItems="flex-start"
                                    button
                                    onClick={() => handleOrderClick(order)}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                Order N°{order.OrderNumber}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" color="textSecondary">
                                                    <strong>Status:</strong> {order.Status}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    <strong>Type:</strong> {order.Type} {order.TableNumber && `(Table: ${order.TableNumber})`}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    <strong>Items:</strong>
                                                </Typography>
                                                <ul>
                                                    {order.Items.map((item, index) => (
                                                        <li key={index}>
                                                            {item.Name} x {item.Quantity} - {item.PriceDineIn || item.PriceDelivery || 'N/A'} CFA
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        }
                                    />
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}
        </Container>
    );
};

export default Dashboard;
