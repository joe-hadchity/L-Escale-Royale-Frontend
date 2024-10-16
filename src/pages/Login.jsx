import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Container, Alert } from '@mui/material';
import axios from 'axios';
import logo from '../assets/l-escale-royale-logo.png';
import Cookies from 'js-cookie'; 

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: '', pin: '' });
    const [error, setError] = useState(null);

    const apiUrl = `${process.env.REACT_APP_API_URL}/auth/login`;

    const handleInputChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const extractValueFromResponse = (responseString, key) => {
        const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`);
        const match = responseString.match(regex);
        return match ? match[1] : null;
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(apiUrl, {
                Username: credentials.username,
                Pin: credentials.pin,
            });

            if (response.status === 200) {
                const responseString = response.data;
                const username = extractValueFromResponse(responseString, "Username");
                const role = extractValueFromResponse(responseString, "Role");

                Cookies.set('user', JSON.stringify({ username, role }), { expires: 1 });

                if (role === 'admin') {
                    navigate('/admin', { replace: true });
                } else if (role === 'staff') {
                    navigate('/staff', { replace: true });
                }
            } else {
                setError('Identifiants incorrects');
            }
        } catch (err) {
            setError(err.response?.data?.Message || 'An error occurred. Please try again.');
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    padding: 4,
                    borderRadius: 2,
                    boxShadow: 3,
                }}
            >
                {/* Logo and Title */}
                <img src={logo} alt="L'Escale Royale" style={{ width: '200px', marginBottom: '20px' }} />
               

                {/* Form */}
                <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
                    <TextField
                        margin="normal"
                        fullWidth
                        id="username"
                        label="Nom d'utilisateur"
                        name="username"
                        autoComplete="username"
                        value={credentials.username}
                        onChange={handleInputChange}
                        autoFocus
                        required
                    />
                    <TextField
                        margin="normal"
                        fullWidth
                        name="pin"
                        label="PIN"
                        type="password"
                        id="pin"
                        autoComplete="current-pin"
                        value={credentials.pin}
                        onChange={handleInputChange}
                        required
                    />
                    {/* Error Message */}
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Connexion
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;
