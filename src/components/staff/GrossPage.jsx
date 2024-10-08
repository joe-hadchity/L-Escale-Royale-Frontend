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
    const [cashGross, setCashGross] = useState(0);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [openingBalance, setOpeningBalance] = useState('');
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [error, setError] = useState(null);

    const reportRef = useRef();

    const fetchGrossDetails = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/Gross/GetLatestGross`);
            const latestGross = response.data;

            if (latestGross) {
                setGrossStatus(latestGross.Status);
                setGrossTotal(latestGross.TotalGross || latestGross.OpeningBalance || 0);
                setCashGross(latestGross.CashGross || 0);
            } else {
                setGrossStatus(null);
                setGrossTotal(0);
                setCashGross(0);
            }
        } catch (error) {
            setError('Failed to fetch Gross details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchReport = async () => {
        setReportLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/Report/CreateReport`);
            setReportData(response.data);
        } catch (error) {
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
            const payload = { Status: 'Open', CashGross: parseFloat(openingBalance) || 0 };
            await axios.post(`${process.env.REACT_APP_API_URL}/Gross/CreateGross`, payload);
            
            setOpenDialog(false);
            await fetchGrossDetails();
        } catch (error) {
            setError('Failed to create a new Gross. Please try again.');
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
                fetchReport();
            }
        } catch (error) {
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
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: '#1976D2', textAlign: 'center' }}>
                Gestion du Gross
            </Typography>

            {error && (
                <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Paper elevation={4} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
                            {grossStatus === null
                                ? 'Aucun gross ouvert pour aujourd\'hui'
                                : `Statut actuel du Gross: ${grossStatus}`}
                        </Typography>

                        {grossStatus && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 3 }}>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'green' }}>
                                    Total Gross: {grossTotal.toFixed(2)} CFA
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'blue' }}>
                                    Cash Gross: {cashGross.toFixed(2)} CFA
                                </Typography>
                            </Box>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            {grossStatus === 'Open' ? (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleCloseGross}
                                    sx={{ fontWeight: 'bold', px: 4, py: 1.5 }}
                                >
                                    Fermer le Gross
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setOpenDialog(true)}
                                    sx={{ fontWeight: 'bold', px: 4, py: 1.5 }}
                                >
                                    Ouvrir un Nouveau Gross
                                </Button>
                            )}
                        </Box>

                        {grossStatus === 'Closed' && (
                            <Typography variant="h6" color="error" sx={{ fontWeight: 'bold', mt: 2, textAlign: 'center' }}>
                                Le gross est fermé pour aujourd'hui.
                            </Typography>
                        )}
                    </>
                )}
            </Paper>

            {grossStatus === 'Closed' && (
                <Paper elevation={4} sx={{ p: 3, borderRadius: 3, mt: 4, height: '450px', overflow: 'hidden' }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#1976D2', textAlign: 'center' }}>
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
