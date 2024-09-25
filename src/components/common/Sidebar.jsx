import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation
import { Box, List, ListItem, ListItemText, ListItemIcon, Button, Divider } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout'; // MUI icon for logout
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PaymentsIcon from '@mui/icons-material/Payments';
import HistoryIcon from '@mui/icons-material/History';
import logo from '../../assets/l-escale-royale-logo.png'; // Correct logo path

const Sidebar = () => {
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
    { path: '/admin/ingredient-management', label: 'Gestion des Ingrédients', icon: <RestaurantIcon /> },
    { path: '/admin/item-management', label: 'Gestion du Menu', icon: <RestaurantIcon /> },
    { path: '/admin/supplier-payments', label: 'Paiement Fournisseur', icon: <PaymentsIcon /> },
    { path: '/admin/history', label: 'Historique', icon: <HistoryIcon /> },
  ];

  return (
    <Box
      sx={{
        backgroundColor: '#f8f9fa',
        borderRadius: '15px',
        boxShadow: 3,
        height: '100vh',
        width: '250px',
        padding: '20px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          marginBottom: '30px',
          cursor: 'pointer',
        }}
        onClick={handleLogoClick}
      >
        <img
          src={logo}
          alt="L'Escale Royale Logo"
          style={{
            width: '150px',
            objectFit: 'contain',
          }}
        />
      </Box>

      {/* Navigation Menu */}
      <List component="nav" sx={{ padding: 0 }}>
        {navItems.map((item, index) => (
          <ListItem
            button
            key={index}
            selected={activeItem === item.path}
            onClick={() => handleItemClick(item.path)}
            sx={{
              borderRadius: '10px',
              marginBottom: '10px',
              backgroundColor: activeItem === item.path ? 'primary.main' : 'white',
              color: activeItem === item.path ? 'white' : 'black',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: activeItem === item.path ? 'white' : 'black',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}

        <Divider sx={{ margin: '20px 0' }} />

        {/* Logout Button */}
        <ListItem
          button
          onClick={() => handleItemClick('/admin/logout')}
          sx={{
            borderRadius: '10px',
            backgroundColor: activeItem === '/admin/logout' ? 'error.main' : 'white',
            color: activeItem === '/admin/logout' ? 'white' : 'error.main',
            border: '2px solid',
            borderColor: 'error.main',
            '&:hover': {
              backgroundColor: 'error.main',
              color: 'white',
            },
          }}
        >
          <ListItemIcon
            sx={{
              color: activeItem === '/admin/logout' ? 'white' : 'error.main',
            }}
          >
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Déconnexion" />
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
