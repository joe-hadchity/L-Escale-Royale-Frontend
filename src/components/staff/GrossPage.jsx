import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Button,
    Box,
    CircularProgress,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    List,
    ListItem,
    Divider,
    ListItemText,
    Card,
    CardContent,
} from '@mui/material';
import axios from 'axios';

const GrossPage = () => {
    const [grossStatus, setGrossStatus] = useState(null);
    const [grossTotal, setGrossTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [openingBalance, setOpeningBalance] = useState('');
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);

    useEffect(() => {
        const fetchGrossDetails = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/Gross/GetLatestGross`);
                const latestGross = response.data;
                setGrossStatus(latestGross.Status);
                setGrossTotal(latestGross.TotalGross || 0);
            } catch (error) {
                console.error('Error fetching Gross details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchGrossDetails();
    }, []);

    const handleCreateGross = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/Gross/CreateGross`, { Status: 'Open', OpeningBalance: parseFloat(openingBalance) || 0 });
            setGrossStatus('Open');
            setGrossTotal(parseFloat(openingBalance) || 0);
            setOpenDialog(false);
        } catch (error) {
            console.error('Error creating a new Gross:', error);
        }
    };

    const handleCloseGross = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/Gross/GetLatestGross`);
            const latestGross = response.data;

            if (latestGross) {
                const grossNumber = latestGross.GrossNumber;
                await axios.put(`${process.env.REACT_APP_API_URL}/Gross/UpdateGrossByGrossNumber/${grossNumber}`, { Status: 'Closed' });
                setGrossStatus('Closed');
                fetchReport(); // Fetch report after closing gross
            }
        } catch (error) {
            console.error('Error closing the Gross:', error);
        }
    };

    const fetchReport = async () => {
        setReportLoading(true);
        try {
            // Create the report using the backend endpoint
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/Report/CreateReport`);
            setReportData(response.data);
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setReportLoading(false);
        }
    };

    const handleKeyPress = (value) => {
        if (value === 'clear') {
            setOpeningBalance('');
        } else if (value === 'delete') {
            setOpeningBalance(openingBalance.slice(0, -1));
        } else {
            setOpeningBalance((prev) => prev + value);
        }
    };

    const formatAmount = (value) => {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    return (
        <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Gestion du Gross
            </Typography>

            <Paper elevation={3} sx={{ p: 3, borderRadius: '10px', mb: 4 }}>
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

                        {grossStatus && (
                            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'green' }}>
                                Total du Gross: {grossTotal.toFixed(2)} CFA
                            </Typography>
                        )}

                        <Box sx={{ mt: 3 }}>
                            {grossStatus === 'Open' ? (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleCloseGross}
                                    sx={{ fontWeight: 'bold', padding: '12px 24px', mb: 2 }}
                                >
                                    Fermer le Gross
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setOpenDialog(true)}
                                    sx={{ fontWeight: 'bold', padding: '12px 24px', mb: 2 }}
                                >
                                    Ouvrir un Nouveau Gross
                                </Button>
                            )}
                        </Box>

                        {grossStatus === 'Closed' && (
                            <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
                                Le gross est fermé pour aujourd'hui.
                            </Typography>
                        )}
                    </>
                )}
            </Paper>

            {/* Reporting Section - Only visible when the gross is closed */}
            {grossStatus === 'Closed' && (
                <Paper elevation={3} sx={{ p: 3, borderRadius: '10px', mt: 4 }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Rapport du Gross
                    </Typography>

                    {reportLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        reportData ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {/* Report by Items */}
                                <Card elevation={2}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            Rapport par Article
                                        </Typography>
                                        <List>
                                            {reportData.ItemReport.map((item, index) => (
                                                <Box key={index}>
                                                    <ListItem>
                                                        <ListItemText
                                                            primary={`Article: ${item._id.ItemName}`}
                                                            secondary={
                                                                <>
                                                                    <Typography>Quantité: {item.totalCount}</Typography>
                                                                    <Typography>Prix Total: {item.ItemPrice.toFixed(2)} CFA</Typography>
                                                                    <Typography>Pourcentage des Ventes: {item.CalculatedPrice.toFixed(2)}%</Typography>
                                                                    <Typography>Pourcentage de la Quantité: {item.PercentageCount.toFixed(2)}%</Typography>
                                                                </>
                                                            }
                                                        />
                                                    </ListItem>
                                                    <Divider />
                                                </Box>
                                            ))}
                                        </List>
                                    </CardContent>
                                </Card>
                                
                                {/* Add more sections for CategoryReport and TypeReport as needed */}
                            </Box>
                        ) : (
                            <Typography variant="body1" color="textSecondary">
                                Aucune donnée de rapport disponible.
                            </Typography>
                        )
                    )}
                </Paper>
            )}

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="xs">
                <DialogTitle>Ajouter un Fonds de Caisse</DialogTitle>
                <DialogContent>
                    <Box
                        sx={{
                            textAlign: 'center',
                            mb: 2,
                            p: 1,
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                        }}
                    >
                        {formatAmount(openingBalance) || '0'}
                    </Box>
                    <Grid container spacing={1}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '00', 0].map((num, index) => (
                            <Grid item xs={4} key={index}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => handleKeyPress(num.toString())}
                                    sx={{ fontSize: '1.8rem', padding: '15px', minWidth: '60px', fontWeight: 'bold' }}
                                >
                                    {num}
                                </Button>
                            </Grid>
                        ))}
                        <Grid item xs={4}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => handleKeyPress('clear')}
                                sx={{ fontSize: '1.8rem', padding: '15px', minWidth: '60px', color: 'red', fontWeight: 'bold' }}
                            >
                                C
                            </Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => handleKeyPress('delete')}
                                sx={{ fontSize: '1.8rem', padding: '15px', minWidth: '60px', color: 'red', fontWeight: 'bold' }}
                            >
                                &larr;
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="secondary">
                        Annuler
                    </Button>
                    <Button onClick={handleCreateGross} color="primary" variant="contained">
                        Confirmer
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default GrossPage;
