import React from 'react';
import { Container, Typography, Paper, Box, Grid } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';

const AdminHome = () => {
    return (
        <Container
            maxWidth="md"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                overflow: 'hidden',
                padding: 4,
            }}
        >
            {/* Welcome Message */}
            <Paper
                elevation={2}
                sx={{
                    padding: 3,
                    textAlign: 'center',
                    borderRadius: '12px',
                    backgroundColor: '#f5f5f5',
                    maxWidth: '100%',
                }}
            >
                <AdminPanelSettingsIcon
                    sx={{ fontSize: 60, color: '#3f51b5', mb: 2 }}
                />
                <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold', color: '#3f51b5' }}>
                    Bienvenue, Administrateur
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, color: '#333' }}>
                    Vous êtes connecté en tant qu'administrateur du système de gestion du restaurant.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, color: '#555' }}>
                    Sur cette plateforme, vous pouvez gérer les commandes, les utilisateurs, les produits et bien plus encore. Explorez les différentes sections pour suivre l'évolution des activités et effectuer les tâches administratives.
                </Typography>
                <Typography variant="body1" sx={{ mt: 4, fontWeight: 'bold', color: '#3f51b5' }}>
                    Merci pour votre dévouement et votre travail acharné pour maintenir le bon fonctionnement du restaurant.
                </Typography>
                <Typography variant="h6" sx={{ mt: 3, color: '#333' }}>
                    Nous vous souhaitons une excellente journée !
                </Typography>
            </Paper>

            {/* Quick Info Section */}
            <Grid container spacing={3} sx={{ mt: 4 }}>
                {/* Orders Management */}
                <Grid item xs={12} sm={4}>
                    <Paper
                        elevation={3}
                        sx={{
                            padding: 2,
                            textAlign: 'center',
                            borderRadius: '12px',
                            backgroundColor: '#e3f2fd',
                        }}
                    >
                        <RestaurantMenuIcon sx={{ fontSize: 50, color: '#1e88e5', mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e88e5' }}>
                            Commandes
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#555' }}>
                            Gérez toutes les commandes en cours.
                        </Typography>
                    </Paper>
                </Grid>

                {/* User Management */}
                <Grid item xs={12} sm={4}>
                    <Paper
                        elevation={3}
                        sx={{
                            padding: 2,
                            textAlign: 'center',
                            borderRadius: '12px',
                            backgroundColor: '#e8f5e9',
                        }}
                    >
                        <PeopleIcon sx={{ fontSize: 50, color: '#43a047', mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#43a047' }}>
                            Utilisateurs
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#555' }}>
                            Suivez et gérez les utilisateurs.
                        </Typography>
                    </Paper>
                </Grid>

                {/* Products Management */}
                <Grid item xs={12} sm={4}>
                    <Paper
                        elevation={3}
                        sx={{
                            padding: 2,
                            textAlign: 'center',
                            borderRadius: '12px',
                            backgroundColor: '#fffde7',
                        }}
                    >
                        <AssignmentIcon sx={{ fontSize: 50, color: '#fdd835', mb: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#fdd835' }}>
                            Produits
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#555' }}>
                            Mettez à jour et gérez les produits.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default AdminHome;
