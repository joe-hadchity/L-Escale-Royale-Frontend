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
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/Order/GetOrderByStatus/Pending`);
                setPendingOrders(response.data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };

        fetchPendingOrders();
    }, []);

    // Handle order click to navigate to Order page
    const handleOrderClick = (order) => {
        setSelectedOrder(order); // Store selected order in context
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
                                                            {item.Name} x {item.Quantity} - {item.Price} CFA
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
