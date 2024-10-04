import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Container, Typography, Box } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const Logout = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Helper function to delete cookies
    const deleteCookie = (name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    };

    const handleLogout = async () => {
        try {
            // Make API request to log out
            await axios.post(`${process.env.REACT_APP_API_URL}/Auth/LogOut`, {});

            // Clear the user context or token
            logout();

            // Delete authentication or session-related cookies
            deleteCookie('authToken'); // Example cookie name
            deleteCookie('session');   // Another example cookie name

            // Redirect to the login page after logout
            navigate('/login');
        } catch (error) {
            console.error("Error logging out:", error);
            // Optionally, handle error cases (e.g., show a notification)
        }
    };

    return (
        <Container
            maxWidth="sm"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                overflow: 'hidden',
            }}
        >
            {/* Logout Heading */}
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
                Déconnexion
            </Typography>

            {/* Logout Message */}
            <Typography variant="body1" sx={{ mb: 4, color: '#555', textAlign: 'center' }}>
                Êtes-vous sûr de vouloir vous déconnecter?
            </Typography>

            {/* Logout Button */}
            <Button
                variant="contained"
                color="secondary"
                onClick={handleLogout}
                startIcon={<ExitToAppIcon />}
                size="large"
                sx={{
                    padding: '10px 20px',
                    fontWeight: 'bold',
                    backgroundColor: '#ff5252',
                    ':hover': {
                        backgroundColor: '#ff1744',
                    },
                    borderRadius: '10px',
                }}
            >
                Déconnexion
            </Button>

            {/* Styling the container */}
            <Box
                sx={{
                    marginTop: 4,
                    padding: 2,
                    backgroundColor: '#f5f5f5',
                    borderRadius: '12px',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    maxWidth: '100%',
                }}
            >
                <Typography variant="body2" sx={{ color: '#888' }}>
                    Vous pouvez toujours vous reconnecter plus tard!
                </Typography>
            </Box>
        </Container>
    );
};

export default Logout;
