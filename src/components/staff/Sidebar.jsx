import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Drawer, List, ListItemButton, ListItemIcon, Tooltip, Divider, Box, styled } from '@mui/material';
import { Dashboard, AttachMoney, Home, Logout } from '@mui/icons-material';

// Styled Drawer to make the styles cleaner and reusable
const StyledDrawer = styled(Drawer)(({ theme }) => ({
    width: 80,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: 80,
        boxSizing: 'border-box',
        background: 'linear-gradient(145deg, #e0e0e0, #cfcfcf)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRight: 'none',
        overflow: 'hidden', // Remove scrollbars
        paddingTop: theme.spacing(2), // Add padding for spacing
        paddingBottom: theme.spacing(2), // Add padding for spacing
    },
}));

// Styled ListItemButton for consistent active and hover states
const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
    justifyContent: 'center',
    width: '60px', // Set a fixed width for square shape
    height: '60px', // Set height equal to width for a square shape
    borderRadius: theme.shape.borderRadius, // Optional rounded corners
    transition: 'background-color 0.3s',
    '&.Mui-selected': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        '& .MuiListItemIcon-root': {
            color: theme.palette.common.white,
        },
    },
    '&:hover': {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.common.white,
        '& .MuiListItemIcon-root': {
            color: theme.palette.common.white,
        },
    },
}));

// Styled ListItemButton for Logout
const StyledLogoutButton = styled(ListItemButton)(({ theme }) => ({
    justifyContent: 'center',
    alignItems: 'center',
    width: '50px', // Smaller width
    height: '50px', // Square shape
    borderRadius: theme.shape.borderRadius, // Rounded corners (optional)
    backgroundColor: '#d32f2f', // Red background
    color: '#ffffff',
    '&:hover': {
        backgroundColor: '#c62828',
        color: '#f',
    },
}));

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const activeItem = location.pathname;

    // Sidebar menu items
    const menuItems = [
        { title: 'Home', icon: <Home />, path: '/staff/' },
        { title: 'Dashboard', icon: <Dashboard />, path: '/staff/dashboard' },
        { title: 'Gestion du Gross', icon: <AttachMoney />, path: '/staff/gross' },
    ];

    // Handle item click
    const handleItemClick = (path) => {
        navigate(path);
    };

    // Handle Logout
    const handleLogout = () => {
        // Perform any necessary logout operations (e.g., clearing auth tokens)

        // Redirect to the login page
        navigate('/login');
    };

    return (
        <StyledDrawer variant="permanent" anchor="left">
            <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%">
                {/* Centered Menu Items */}
                <Box display="flex" flexDirection="column" alignItems="center" flexGrow={1} justifyContent="center">
                    <List>
                        {menuItems.map((item, index) => (
                            <React.Fragment key={item.title}>
                                <Tooltip title={item.title} placement="right">
                                    <StyledListItemButton
                                        onClick={() => handleItemClick(item.path)}
                                        selected={activeItem === item.path}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                justifyContent: 'center',
                                                color: activeItem === item.path ? '#ffffff' : '#3f51b5',
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                    </StyledListItemButton>
                                </Tooltip>
                                {/* Divider after each item except the last */}
                                {index < menuItems.length - 1 && <Divider sx={{ width: '70%', my: 1 }} />}
                            </React.Fragment>
                        ))}
                    </List>
                </Box>

                {/* Logout Button at Bottom */}
                <Tooltip title="Déconnexion" placement="right">
                    <StyledLogoutButton onClick={handleLogout}>
                        <ListItemIcon sx={{ color: '#ffffff', justifyContent: 'center' }}>
                            <Logout />
                        </ListItemIcon>
                    </StyledLogoutButton>
                </Tooltip>
            </Box>
        </StyledDrawer>
    );
};

export default Sidebar;
