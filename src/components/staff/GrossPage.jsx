import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, CircularProgress, Paper } from '@mui/material';
import axios from 'axios';

const GrossPage = () => {
    const [grossStatus, setGrossStatus] = useState(null);
    const [grossTotal, setGrossTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    // Fetch the latest Gross on component mount
    useEffect(() => {
        const fetchGrossDetails = async () => {
            try {
                // Fetch the latest gross
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/Gross/GetLatestGross`);
                const latestGross = response.data;

                // Extract the status and total amount from the gross data
                setGrossStatus(latestGross.Status);
                setGrossTotal(latestGross.TotalGross || 0); // Assuming TotalGross is the field name for the gross total
            } catch (error) {
                console.error('Error fetching Gross details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGrossDetails();
    }, []);

    // Function to create a new Gross
    const handleCreateGross = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/Gross/CreateGross`, { Status: 'Open' });
            setGrossStatus('Open');
            setGrossTotal(0); // New Gross starts with a total of 0
        } catch (error) {
            console.error('Error creating a new Gross:', error);
        }
    };

    // Function to close the current Gross
    const handleCloseGross = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/Gross/GetLatestGross`);
            const latestGross = response.data;

            if (latestGross) {
                const grossNumber = latestGross.GrossNumber;
                await axios.put(`${process.env.REACT_APP_API_URL}/Gross/UpdateGrossByGrossNumber/${grossNumber}`, { Status: 'Closed' });
                setGrossStatus('Closed');
            }
        } catch (error) {
            console.error('Error closing the Gross:', error);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Gestion du Gross
            </Typography>

            <Paper elevation={3} sx={{ p: 3, borderRadius: '10px' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            {grossStatus === null
                                ? 'Aucun gross ouvert pour aujourd\'hui'
                                : `Statut actuel du Gross: ${grossStatus}`}
                        </Typography>

                        {/* Display the total for today's Gross */}
                        {grossStatus && (
                            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'green' }}>
                                Total du Gross: {grossTotal.toFixed(2)} €
                            </Typography>
                        )}

                        <Box sx={{ mt: 3 }}>
                            {grossStatus === 'Open' ? (
                                // Show "Close Gross" button when the status is Open
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleCloseGross}
                                    sx={{ fontWeight: 'bold', padding: '12px 24px', mb: 2 }}
                                >
                                    Fermer le Gross
                                </Button>
                            ) : (
                                // Show "Open New Gross" button when the status is Closed or not found
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleCreateGross}
                                    sx={{ fontWeight: 'bold', padding: '12px 24px', mb: 2 }}
                                >
                                    Ouvrir un Nouveau Gross
                                </Button>
                            )}
                        </Box>

                        {/* Display closed message if the gross is closed */}
                        {grossStatus === 'Closed' && (
                            <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
                                Le gross est fermé pour aujourd'hui.
                            </Typography>
                        )}
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default GrossPage;
