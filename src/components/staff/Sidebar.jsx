import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Drawer, List, ListItemButton, ListItemIcon, Tooltip, Divider, Box, styled 
} from '@mui/material';
import { 
  HomeOutlined, SpaceDashboardOutlined, MonetizationOnOutlined, 
  CreditCardOutlined, HistoryToggleOffOutlined, Logout 
} from '@mui/icons-material'; // Import updated icons

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
    overflow: 'hidden',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  justifyContent: 'center',
  width: '60px',
  height: '60px',
  borderRadius: theme.shape.borderRadius,
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

const StyledLogoutButton = styled(ListItemButton)(({ theme }) => ({
  justifyContent: 'center',
  alignItems: 'center',
  width: '50px',
  height: '50px',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: '#d32f2f',
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#c62828',
    color: '#ffffff',
  },
}));

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeItem = location.pathname;

  const menuItems = [
    { title: 'Home', icon: <HomeOutlined />, path: '/staff/' },
    { title: 'Dashboard', icon: <SpaceDashboardOutlined />, path: '/staff/dashboard' },
    { title: 'Gestion du Gross', icon: <MonetizationOnOutlined />, path: '/staff/gross' },
    { title: 'Payments', icon: <CreditCardOutlined />, path: '/staff/payment' },
    { title: 'History', icon: <HistoryToggleOffOutlined />, path: '/staff/history' },
  ];

  const handleItemClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <StyledDrawer variant="permanent" anchor="left">
      <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%">
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
                {index < menuItems.length - 1 && <Divider sx={{ width: '70%', my: 1 }} />}
              </React.Fragment>
            ))}
          </List>
        </Box>

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
