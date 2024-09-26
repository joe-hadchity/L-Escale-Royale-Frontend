// src/components/sidebar/Sidebar.jsx

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, IconButton, Tooltip } from '@mui/material';
import { Dashboard, RestaurantMenu, AttachMoney } from '@mui/icons-material';
import logo from '../../assets/l-escale-royale-logo.png'; // Correct logo path

const Sidebar = () => {
    const navigate = useNavigate(); // Initialize navigation
    const location = useLocation(); // Get the current route
    const activeItem = location.pathname; // Track the active item

    // Handle logo click to redirect to homeStaff
    const handleLogoClick = () => {
        navigate('/staff/');
    };

    // Handle item click and set active item
    const handleItemClick = (path) => {
        navigate(path); // Navigate to the clicked path
    };

    return (
        <Drawer
            variant="permanent"
            anchor="left"
            sx={{
                width: '80px', // Slim width for the sidebar
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: '80px', // Slim width for the drawer paper
                    boxSizing: 'border-box',
                    background: 'linear-gradient(145deg, #ffffff, #f0f0f0)', // Subtle gradient background
                },
            }}
        >
            {/* Sidebar Content */}
            <List sx={{ p: 2 }}>
                {/* Logo */}
                <ListItem sx={{ justifyContent: 'center', mb: 2 }}>
                    <IconButton onClick={handleLogoClick}>
                        <img
                            src={logo}
                            alt="L'Escale Royale Logo"
                            style={{
                                maxWidth: '40px',
                                cursor: 'pointer',
                                borderRadius: '0%', // Keep it square or customize as needed
                            }}
                        />
                    </IconButton>
                </ListItem>

                {/* Order Icon */}
                <Tooltip title="Order" placement="right">
                    <ListItem
                        button
                        onClick={() => handleItemClick('/staff/order')}
                        selected={activeItem === '/staff/order'}
                        sx={{
                            justifyContent: 'center',
                            '&.Mui-selected': {
                                backgroundColor: '#007bff',
                                color: '#fff',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ justifyContent: 'center' }}>
                            <RestaurantMenu sx={{ color: activeItem === '/staff/order' ? '#fff' : '#000' }} />
                        </ListItemIcon>
                    </ListItem>
                </Tooltip>

                {/* Dashboard Icon */}
                <Tooltip title="Dashboard" placement="right">
                    <ListItem
                        button
                        onClick={() => handleItemClick('/staff/dashboard')}
                        selected={activeItem === '/staff/dashboard'}
                        sx={{
                            justifyContent: 'center',
                            '&.Mui-selected': {
                                backgroundColor: '#007bff',
                                color: '#fff',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ justifyContent: 'center' }}>
                            <Dashboard sx={{ color: activeItem === '/staff/dashboard' ? '#fff' : '#000' }} />
                        </ListItemIcon>
                    </ListItem>
                </Tooltip>

                {/* Gross Management Icon */}
                <Tooltip title="Gestion du Gross" placement="right">
                    <ListItem
                        button
                        onClick={() => handleItemClick('/staff/gross')}
                        selected={activeItem === '/staff/gross'}
                        sx={{
                            justifyContent: 'center',
                            '&.Mui-selected': {
                                backgroundColor: '#00ef34',
                                color: '#ef4ff3',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ justifyContent: 'center' }}>
                            <AttachMoney sx={{ color: activeItem === '/staff/gross' ? '#fff' : '#000' }} />
                        </ListItemIcon>
                    </ListItem>
                </Tooltip>
            </List>
        </Drawer>
    );
};

export default Sidebar;
