import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { Kitchen, TableRestaurant, People } from '@mui/icons-material';

const StaffHome = () => {
    return (
        <Box sx={{ padding: 4, backgroundColor: '#f4f4f4', minHeight: '100vh', textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 4, color: '#333' }}>
                Bienvenue à Bord!
            </Typography>

            <Typography variant="h5" sx={{ color: '#555', mb: 5 }}>
                Aujourd'hui, on assure!
            </Typography>

            {/* Quick Info Cards */}
            <Grid container spacing={4} justifyContent="center">
                {/* Orders Section */}
                <Grid item xs={12} md={4}>
                    <Card elevation={2} sx={{ padding: 2, borderRadius: '12px', textAlign: 'center', backgroundColor: '#fff' }}>
                        <CardContent>
                            <Kitchen sx={{ fontSize: 60, color: '#3f51b5', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Commandes
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                Restez au top des commandes.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Tables Section */}
                <Grid item xs={12} md={4}>
                    <Card elevation={2} sx={{ padding: 2, borderRadius: '12px', textAlign: 'center', backgroundColor: '#fff' }}>
                        <CardContent>
                            <TableRestaurant sx={{ fontSize: 60, color: '#ff9800', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Tables
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                Gardez un œil sur le service.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Teamwork Section */}
                <Grid item xs={12} md={4}>
                    <Card elevation={2} sx={{ padding: 2, borderRadius: '12px', textAlign: 'center', backgroundColor: '#fff' }}>
                        <CardContent>
                            <People sx={{ fontSize: 60, color: '#4caf50', mb: 2 }} />
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                Équipe
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                Travaillons ensemble, rapide et efficace.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Motivational Footer */}
            <Box sx={{ marginTop: 6, padding: 3, backgroundColor: '#e3f2fd', borderRadius: '8px', boxShadow: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#00796b' }}>
                    Chaque jour est une opportunité. Allons-y!
                </Typography>
            </Box>
        </Box>
    );
};

export default StaffHome;
