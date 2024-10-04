import React, { useState, useEffect, useRef } from 'react';
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
    Alert,
} from '@mui/material';
import axios from 'axios';
import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';

const GrossPage = () => {
    const [grossStatus, setGrossStatus] = useState(null);
    const [grossTotal, setGrossTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [openingBalance, setOpeningBalance] = useState('');
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [error, setError] = useState(null);

    const reportRef = useRef();

    const fetchGrossDetails = async () => {
        try {
            console.log('Fetching Gross details...');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/Gross/GetLatestGross`);
            console.log('Response:', response.data);
            
            const latestGross = response.data;

            if (latestGross) {
                setGrossStatus(latestGross.Status);
                
                // Check if "TotalGross" exists, otherwise use "OpeningBalance"
                setGrossTotal(latestGross.TotalGross || latestGross.OpeningBalance || 0);
            } else {
                setGrossStatus(null);
                setGrossTotal(0);
            }
        } catch (error) {
            console.error('Error fetching Gross details:', error);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            }
            setError('Failed to fetch Gross details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchReport = async () => {
        setReportLoading(true);
        try {
            console.log('Fetching Gross report...');
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/Report/CreateReport`);
            console.log('Report Response:', response.data);
            setReportData(response.data);
        } catch (error) {
            console.error('Error fetching report data:', error);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            }
            setError('Failed to fetch report data. Please try again later.');
        } finally {
            setReportLoading(false);
        }
    };

    useEffect(() => {
        fetchGrossDetails();
        fetchReport();
    }, []);

    const handleCreateGross = async () => {
        try {
            console.log('Creating a new Gross with Opening Balance:', openingBalance);
            const payload = { Status: 'Open', OpeningBalance: parseFloat(openingBalance) || 0 };
            console.log('Payload:', payload);

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/Gross/CreateGross`, payload);
            console.log('Create Gross Response:', response.data);
            
            setGrossStatus('Open');
            setGrossTotal(parseFloat(openingBalance) || 0);
            setOpenDialog(false);
        } catch (error) {
            console.error('Error creating a new Gross:', error);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            }
            setError('Failed to create a new Gross. Please try again.');
        }
    };

    const handleCloseGross = async () => {
        try {
            console.log('Closing Gross...');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/Gross/GetLatestGross`);
            console.log('Fetched Latest Gross:', response.data);

            const latestGross = response.data;

            if (latestGross) {
                const grossNumber = latestGross.GrossNumber;
                console.log(`Updating Gross status to 'Closed' for GrossNumber: ${grossNumber}`);
                
                await axios.put(`${process.env.REACT_APP_API_URL}/Gross/UpdateGrossByGrossNumber/${grossNumber}`, { Status: 'Closed' });
                setGrossStatus('Closed');
                fetchReport();
            }
        } catch (error) {
            console.error('Error closing the Gross:', error);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Data:', error.response.data);
            }
            setError('Failed to close the Gross. Please try again.');
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

    const handlePrint = () => {
        const printContent = reportRef.current;
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write('<html><head><title>Print Report</title>');
        printWindow.document.write('</head><body >');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1976D2' }}>
                Gestion du Gross
            </Typography>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 4 }}>
                    {error}
                </Alert>
            )}

            <Paper elevation={3} sx={{ p: 4, borderRadius: '12px', mb: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            {grossStatus === null
                                ? 'Aucun gross ouvert pour aujourd\'hui'
                                : `Statut actuel du Gross: ${grossStatus}`}
                        </Typography>

                        {grossStatus && (
                            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'green' }}>
                                Total du Gross: {grossTotal.toFixed(2)} CFA
                            </Typography>
                        )}

                        <Divider sx={{ my: 3 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            {grossStatus === 'Open' ? (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleCloseGross}
                                    sx={{ fontWeight: 'bold', px: 4, py: 1.5, mb: 2 }}
                                >
                                    Fermer le Gross
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setOpenDialog(true)}
                                    sx={{ fontWeight: 'bold', px: 4, py: 1.5, mb: 2 }}
                                >
                                    Ouvrir un Nouveau Gross
                                </Button>
                            )}
                        </Box>

                        {grossStatus === 'Closed' && (
                            <Typography variant="h6" color="error" sx={{ fontWeight: 'bold', mt: 2 }}>
                                Le gross est fermé pour aujourd'hui.
                            </Typography>
                        )}
                    </>
                )}
            </Paper>

            {grossStatus === 'Closed' && (
                <Paper elevation={3} sx={{ p: 3, borderRadius: '12px', mt: 4, height: '450px', overflow: 'hidden' }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1976D2' }}>
                        Rapport du Gross
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handlePrint}
                            sx={{ fontWeight: 'bold' }}
                        >
                            Imprimer le Rapport
                        </Button>
                    </Box>
                    
                    <PerfectScrollbar
                        options={{ suppressScrollX: true }}
                        style={{ height: '350px', paddingRight: '16px' }}
                    >
                        <Box ref={reportRef}>
                            {reportLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                reportData ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Card elevation={2} sx={{ mb: 2 }}>
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
                                    </Box>
                                ) : (
                                    <Typography variant="body1" color="textSecondary">
                                        Aucune donnée de rapport disponible.
                                    </Typography>
                                )
                            )}
                        </Box>
                    </PerfectScrollbar>
                </Paper>
            )}

            <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setError(null); }} maxWidth="xs">
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Ajouter un Fonds de Caisse</DialogTitle>
                <DialogContent>
                    <Box
                        sx={{
                            textAlign: 'center',
                            mb: 3,
                            p: 1,
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                        }}
                    >
                        {formatAmount(openingBalance) || '0'}
                    </Box>
                    <Grid container spacing={2}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '00', '000'].map((num, index) => (
                            <Grid item xs={4} key={index}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => handleKeyPress(num.toString())}
                                    sx={{ fontSize: '1.8rem', py: 2, fontWeight: 'bold' }}
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
                                sx={{ fontSize: '1.8rem', py: 2, color: 'red', fontWeight: 'bold' }}
                            >
                                C
                            </Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => handleKeyPress('delete')}
                                sx={{ fontSize: '1.8rem', py: 2, color: 'red', fontWeight: 'bold' }}
                            >
                                &larr;
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-around', py: 2 }}>
                    <Button onClick={() => { setOpenDialog(false); setError(null); }} color="secondary" sx={{ fontWeight: 'bold' }}>
                        Annuler
                    </Button>
                    <Button onClick={handleCreateGross} color="primary" variant="contained" sx={{ fontWeight: 'bold' }}>
                        Confirmer
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default GrossPage;
