import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, Tooltip, Divider } from '@mui/material';
import { Dashboard, RestaurantMenu, AttachMoney, Home } from '@mui/icons-material';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const activeItem = location.pathname;

    // Handle item click and set active item
    const handleItemClick = (path) => {
        navigate(path);
    };

    return (
        <Drawer
            variant="permanent"
            anchor="left"
            sx={{
                width: '80px',
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: '80px',
                    boxSizing: 'border-box',
                    background: 'linear-gradient(145deg, #e0e0e0, #cfcfcf)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
            }}
        >
            {/* Centered Sidebar Content */}
            <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 0 }}>
                
                {/* Home Icon */}
                <Tooltip title="Home" placement="right">
                    <ListItem
                        button // Use this to treat ListItem as a button
                        onClick={() => handleItemClick('/staff/')}
                        selected={activeItem === '/staff/'}
                        sx={{
                            justifyContent: 'center',
                            width: '100%',
                            '&.Mui-selected': {
                                backgroundColor: '#0056b3',
                                color: '#ffffff',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ justifyContent: 'center', color: activeItem === '/staff/' ? '#ffffff' : '#3f51b5' }}>
                            <Home />
                        </ListItemIcon>
                    </ListItem>
                </Tooltip>

                {/* Divider for separation */}
                <Divider sx={{ width: '70%', my: 2 }} />

                {/* Order Icon */}
                <Tooltip title="Order" placement="right">
                    <ListItem
                        button // Use this to treat ListItem as a button
                        onClick={() => handleItemClick('/staff/order')}
                        selected={activeItem === '/staff/order'}
                        sx={{
                            justifyContent: 'center',
                            width: '100%',
                            '&.Mui-selected': {
                                backgroundColor: '#0056b3',
                                color: '#ffffff',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ justifyContent: 'center', color: activeItem === '/staff/order' ? '#ffffff' : '#3f51b5' }}>
                            <RestaurantMenu />
                        </ListItemIcon>
                    </ListItem>
                </Tooltip>

                {/* Divider for separation */}
                <Divider sx={{ width: '70%', my: 2 }} />

                {/* Dashboard Icon */}
                <Tooltip title="Dashboard" placement="right">
                    <ListItem
                        button // Use this to treat ListItem as a button
                        onClick={() => handleItemClick('/staff/dashboard')}
                        selected={activeItem === '/staff/dashboard'}
                        sx={{
                            justifyContent: 'center',
                            width: '100%',
                            '&.Mui-selected': {
                                backgroundColor: '#0056b3',
                                color: '#ffffff',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ justifyContent: 'center', color: activeItem === '/staff/dashboard' ? '#ffffff' : '#3f51b5' }}>
                            <Dashboard />
                        </ListItemIcon>
                    </ListItem>
                </Tooltip>

                {/* Divider for separation */}
                <Divider sx={{ width: '70%', my: 2 }} />

                {/* Gross Management Icon */}
                <Tooltip title="Gestion du Gross" placement="right">
                    <ListItem
                        button // Use this to treat ListItem as a button
                        onClick={() => handleItemClick('/staff/gross')}
                        selected={activeItem === '/staff/gross'}
                        sx={{
                            justifyContent: 'center',
                            width: '100%',
                            '&.Mui-selected': {
                                backgroundColor: '#28a745',
                                color: '#ffffff',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ justifyContent: 'center', color: activeItem === '/staff/gross' ? '#ffffff' : '#3f51b5' }}>
                            <AttachMoney />
                        </ListItemIcon>
                    </ListItem>
                </Tooltip>
            </List>
        </Drawer>
    );
};

export default Sidebar;
