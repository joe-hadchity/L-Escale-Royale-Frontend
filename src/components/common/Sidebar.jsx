import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, List, ListItem, ListItemText, ListItemIcon, Divider, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import KitchenIcon from '@mui/icons-material/Kitchen'; // New Icon for "Gestion des Ingrédients"
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PaymentsIcon from '@mui/icons-material/Payments';
import HistoryIcon from '@mui/icons-material/History';
import logo from '../../assets/l-escale-royale-logo.png';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  const handleLogoClick = () => {
    navigate('/admin/');
  };

  const handleItemClick = (path) => {
    setActiveItem(path);
    navigate(path);
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Tableau de Bord', icon: <DashboardIcon /> },
    { path: '/admin/category-management', label: 'Gestion des Catégories', icon: <CategoryIcon /> },
    { path: '/admin/user-management', label: 'Gestion des Utilisateurs', icon: <PeopleIcon /> },
    { path: '/admin/ingredient-management', label: 'Gestion des Ingrédients', icon: <KitchenIcon /> }, // Updated Icon
    { path: '/admin/item-management', label: 'Gestion du Menu', icon: <RestaurantIcon /> },
    { path: '/admin/supplier-payments', label: 'Paiement Fournisseur', icon: <PaymentsIcon /> },
    { path: '/admin/history', label: 'Historique', icon: <HistoryIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: '270px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 5,
          paddingTop: '20px',
          paddingBottom: '20px',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          /* Minimalistic Scrollbar */
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#cccccc',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#aaaaaa',
          },
        }}
      >
        {/* Logo Section */}
        <Box
          sx={{
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
          onClick={handleLogoClick}
        >
          <img
            src={logo}
            alt="L'Escale Royale Logo"
            style={{
              width: '120px',
              objectFit: 'contain',
            }}
          />
        </Box>

        <Typography variant="h6" color="primary" sx={{ marginBottom: '20px' }}>
          Admin Panel
        </Typography>

        {/* Navigation Menu */}
        <List component="nav" sx={{ flexGrow: 1, width: '100%', paddingX: '15px' }}>
          {navItems.map((item, index) => (
            <ListItem
              button
              key={index}
              selected={activeItem === item.path}
              onClick={() => handleItemClick(item.path)}
              sx={{
                borderRadius: '8px',
                marginBottom: '12px',
                backgroundColor: activeItem === item.path ? '#90caf9' : '#ffffff', // Softer blue for active
                color: activeItem === item.path ? '#0d47a1' : 'text.primary', // Dark blue text for active
                boxShadow: activeItem === item.path ? 2 : 0,
                '&:hover': {
                  backgroundColor: activeItem === item.path ? '#64b5f6' : '#e3f2fd', // Lighter blue hover effect
                  color: '#0d47a1',
                },
                transition: 'all 0.2s ease-in-out',
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingTop: '12px',
                paddingBottom: '12px',
              }}
            >
              <ListItemIcon
                sx={{
                  color: activeItem === item.path ? '#0d47a1' : 'primary.main',
                  minWidth: '40px',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: activeItem === item.path ? 'bold' : 'normal',
                }}
              />
            </ListItem>
          ))}

          <Divider sx={{ margin: '20px 0' }} />

          {/* Logout Button */}
          <ListItem
            button
            onClick={() => handleItemClick('/admin/logout')}
            sx={{
              borderRadius: '8px',
              backgroundColor: activeItem === '/admin/logout' ? '#ef5350' : '#ffffff', // Softer red for logout
              color: activeItem === '/admin/logout' ? '#b71c1c' : 'error.main',
              border: '2px solid',
              borderColor: 'error.main',
              '&:hover': {
                backgroundColor: '#e57373',
                color: '#b71c1c',
              },
              transition: 'all 0.2s ease-in-out',
              paddingLeft: '20px',
              paddingRight: '20px',
              paddingTop: '12px',
              paddingBottom: '12px',
            }}
          >
            <ListItemIcon
              sx={{
                color: activeItem === '/admin/logout' ? '#b71c1c' : 'error.main',
                minWidth: '40px',
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Déconnexion"
              primaryTypographyProps={{
                fontWeight: activeItem === '/admin/logout' ? 'bold' : 'normal',
              }}
            />
          </ListItem>
        </List>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, marginLeft: '270px', padding: '20px', overflowY: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
