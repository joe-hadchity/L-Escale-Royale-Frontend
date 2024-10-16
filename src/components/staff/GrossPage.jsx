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

    // Fetch gross details and report data
    useEffect(() => {
        fetchGrossDetails();
    }, []);

    useEffect(() => {
        if (grossStatus === 'Closed') {
            fetchReport();
        }
    }, [grossStatus]);

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
            console.error('Error fetching Gross details:', error);
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
            console.error('Error fetching report data:', error);
            setError('Failed to fetch report data. Please try again later.');
        } finally {
            setReportLoading(false);
        }
    };

    const handleCreateGross = async () => {
        try {
            const payload = { Status: 'Open', CashGross: parseFloat(openingBalance) || 0 };
            await axios.post(`${process.env.REACT_APP_API_URL}/Gross/CreateGross`, payload);

            setOpenDialog(false);
            await fetchGrossDetails();
        } catch (error) {
            console.error('Error creating Gross:', error);
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
                await fetchReport(); // Fetch the report after closing the gross
            }
        } catch (error) {
            console.error('Error closing Gross:', error);
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

    // Implement handlePrintReport function
    const handlePrintReport = async () => {
        try {
            if (!reportData) {
                setError('No report data to print.');
                return;
            }

            const printData = generateReportPrintData(reportData);

            const printOptions = {
                preview: false,
                printerName: 'POS-80C-Cashier', // Replace with your actual printer name
                copies: 1,
                timeOutPerLine: 400,
                silent: true,
            };

            const response = await window.electronAPI.printOrder(printData, printOptions);
            if (response.success) {
                alert('Le rapport a été imprimé avec succès.');
            } else {
                alert('Échec de l\'impression du rapport.');
            }
        } catch (error) {
            console.error('Error printing report:', error);
            setError('Erreur lors de l\'impression du rapport.');
        }
    };

    // Updated generateReportPrintData function with null checks and console logs
    const generateReportPrintData = (reportData) => {
        // Determine the maximum line width of your printer (adjust if necessary)
        const lineWidth = 42;

        const printData = [
            // Header
            {
                type: 'text',
                value: 'L\'Escale Royale',
                style: { textAlign: 'center', fontWeight: 'bold', fontSize: '22px' },
            },
            {
                type: 'text',
                value: '123 Royal Street, Paris, France',
                style: { textAlign: 'center', fontSize: '12px' },
            },
            {
                type: 'text',
                value: 'Téléphone: +33 1 23 45 67 89',
                style: { textAlign: 'center', fontSize: '12px' },
            },
            {
                type: 'text',
                value: '-'.repeat(lineWidth),
                style: { textAlign: 'center' },
            },
            // Report Title
            {
                type: 'text',
                value: `Rapport du Gross N° ${reportData.ReportNumber}`,
                style: { textAlign: 'center', fontSize: '16px', fontWeight: 'bold' },
            },
            {
                type: 'text',
                value: `Date: ${new Date(reportData.Date).toLocaleDateString('fr-FR')}`,
                style: { textAlign: 'center', fontSize: '12px' },
            },
            {
                type: 'text',
                value: '-'.repeat(lineWidth),
                style: { textAlign: 'center' },
            },
            // Total Sales
            {
                type: 'text',
                value: `Total des Ventes: ${grossTotal.toFixed(2)} CFA`,
                style: { textAlign: 'left', fontSize: '12px', fontWeight: 'bold' },
            },
            {
                type: 'text',
                value: '-'.repeat(lineWidth),
                style: { textAlign: 'center' },
            },
        ];

        // Items Data
        if (Array.isArray(reportData.ItemReport)) {
            console.log('ItemReport is an array with length:', reportData.ItemReport.length);
            reportData.ItemReport.forEach((item, index) => {
                console.log(`Processing ItemReport[${index}]:`, item);

                const itemId = item._id;
                console.log('item._id:', itemId);

                const itemName = String(itemId?.ItemName || item.ItemName || 'Inconnu');
                console.log('itemName:', itemName);

                const name = itemName.slice(0, 14).padEnd(14, ' ');

                const totalCount = item.totalCount ?? 0;
                const quantity = totalCount.toString().padStart(3, ' ');

                const calculatedPrice = item.CalculatedPrice ?? 0;
                const salesPerc = calculatedPrice.toFixed(1).padStart(5, ' ');

                const percentageCount = item.PercentageCount ?? 0;
                const qtyPerc = percentageCount.toFixed(1).padStart(5, ' ');

                printData.push({
                    type: 'text',
                    value: `${name}${quantity} ${salesPerc}% ${qtyPerc}%`,
                    style: { textAlign: 'left', fontSize: '12px', fontFamily: 'monospace' },
                });
            });
        } else {
            console.log('ItemReport is not an array or is undefined:', reportData.ItemReport);
            // Handle the case where ItemReport is not an array
            printData.push({
                type: 'text',
                value: 'Aucun article dans le rapport.',
                style: { textAlign: 'center', fontSize: '12px' },
            });
        }

        // Separator
        printData.push({
            type: 'text',
            value: '-'.repeat(lineWidth),
            style: { textAlign: 'center' },
        });

        // Category Data
        if (Array.isArray(reportData.CategoryReport)) {
            // Category Header
            printData.push({
                type: 'text',
                value: '--- Rapport par Catégorie ---',
                style: { textAlign: 'center', fontSize: '14px', fontWeight: 'bold' },
            });

            // Category Data Header
            printData.push({
                type: 'text',
                value: 'Catégorie       Qté  %Vente %Qté',
                style: { textAlign: 'left', fontSize: '12px', fontWeight: 'bold', fontFamily: 'monospace' },
            });

            reportData.CategoryReport.forEach((category, index) => {
                console.log(`Processing CategoryReport[${index}]:`, category);

                const categoryId = category._id;
                console.log('category._id:', categoryId);

                const categoryName = String(categoryId?.CategoryName || category.CategoryName || 'Inconnu');
                console.log('categoryName:', categoryName);

                const name = categoryName.slice(0, 14).padEnd(14, ' ');

                const totalCount = category.totalCount ?? 0;
                const quantity = totalCount.toString().padStart(3, ' ');

                const calculatedPrice = category.CalculatedPrice ?? 0;
                const salesPerc = calculatedPrice.toFixed(1).padStart(5, ' ');

                const percentageCount = category.PercentageCount ?? 0;
                const qtyPerc = percentageCount.toFixed(1).padStart(5, ' ');

                printData.push({
                    type: 'text',
                    value: `${name}${quantity} ${salesPerc}% ${qtyPerc}%`,
                    style: { textAlign: 'left', fontSize: '12px', fontFamily: 'monospace' },
                });
            });
        } else {
            console.log('CategoryReport is not an array or is undefined:', reportData.CategoryReport);
            // Handle the case where CategoryReport is not an array
            printData.push({
                type: 'text',
                value: 'Aucune catégorie dans le rapport.',
                style: { textAlign: 'center', fontSize: '12px' },
            });
        }

        // Footer
        printData.push(
            {
                type: 'text',
                value: '-'.repeat(lineWidth),
                style: { textAlign: 'center' },
            },
            {
                type: 'text',
                value: 'Fin du Rapport',
                style: { textAlign: 'center', fontSize: '12px', fontStyle: 'italic' },
            }
        );

        console.log('Final printData:', printData);

        return printData;
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
                            onClick={handlePrintReport}
                            sx={{ fontWeight: 'bold' }}
                        >
                            Imprimer le Rapport
                        </Button>
                    </Box>

                    <PerfectScrollbar
                        options={{ suppressScrollX: true }}
                        style={{ height: '350px', paddingRight: '16px' }}
                    >
                        <Box>
                            {reportLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                reportData ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        {/* Total Sales Section */}
                                        <Card elevation={2} sx={{ mb: 2 }}>
                                            <CardContent>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    Total des Ventes: {grossTotal.toFixed(2)} CFA
                                                </Typography>
                                            </CardContent>
                                        </Card>

                                        {/* Report by Article */}
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
                                                                    primary={`Article: ${item._id?.ItemName || item.ItemName || 'Inconnu'}`}
                                                                    secondary={
                                                                        <>
                                                                            <Typography>Quantité: {item.totalCount}</Typography>
                                                                            <Typography>Prix Total: {item.ItemPrice?.toFixed(2) || '0.00'} CFA</Typography>
                                                                            <Typography>Pourcentage des Ventes: {item.CalculatedPrice?.toFixed(2) || '0.00'}%</Typography>
                                                                            <Typography>Pourcentage de la Quantité: {item.PercentageCount?.toFixed(2) || '0.00'}%</Typography>
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

                                        {/* Report by Category */}
                                        <Card elevation={2} sx={{ mb: 2 }}>
                                            <CardContent>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    Rapport par Catégorie
                                                </Typography>
                                                <List>
                                                    {reportData.CategoryReport.map((category, index) => (
                                                        <Box key={index}>
                                                            <ListItem>
                                                                <ListItemText
                                                                    primary={`Catégorie: ${category._id?.CategoryName || category.CategoryName || 'Inconnu'}`}
                                                                    secondary={
                                                                        <>
                                                                            <Typography>Quantité: {category.totalCount}</Typography>
                                                                            <Typography>Prix Total: {category.ItemPrice?.toFixed(2) || '0.00'} CFA</Typography>
                                                                            <Typography>Pourcentage des Ventes: {category.CalculatedPrice?.toFixed(2) || '0.00'}%</Typography>
                                                                            <Typography>Pourcentage de la Quantité: {category.PercentageCount?.toFixed(2) || '0.00'}%</Typography>
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
