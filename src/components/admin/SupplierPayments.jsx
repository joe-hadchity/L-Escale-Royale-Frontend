import React, { useState, useEffect } from 'react';
import {
    TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper,
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Box, Select, MenuItem, InputLabel, FormControl, TablePagination
} from '@mui/material';
import axios from 'axios';

const SupplierPayments = () => {
    const [payments, setPayments] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('Ajouter un paiement');
    const [currentPayment, setCurrentPayment] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentReason, setPaymentReason] = useState('');
    const [paymentType, setPaymentType] = useState('');

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchPayments();
    }, [page, rowsPerPage]);

    const fetchPayments = async () => {
        try {
            // Include pagination parameters
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/Payment/GetAllPayment`, {
                params: {
                    pageNumber: page + 1, // Page number starts at 1 in the backend
                    pageSize: rowsPerPage
                }
            });
            setPayments(response.data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    const handleShowModal = (payment = null) => {
        if (payment) {
            setModalTitle('Mettre à jour le paiement');
            setCurrentPayment(payment);
            setPaymentAmount(payment.Amount || '');
            setPaymentReason(payment.Reason || '');
            setPaymentType(payment.Type || '');
        } else {
            setModalTitle('Ajouter un paiement');
            setCurrentPayment(null);
            setPaymentAmount('');
            setPaymentReason('');
            setPaymentType('');
        }
        setShowModal(true);
    };

    const handleSavePayment = async () => {
        if (!paymentAmount || !paymentType || !paymentReason) {
            alert('Tous les champs sont obligatoires.');
            return;
        }
    
        try {
            const paymentData = {
                Amount: parseFloat(paymentAmount),
                Type: paymentType,
                Reason: paymentReason,
            };
    
            // Print the data being sent to the backend
            console.log('Payment data:', paymentData);
    
            if (currentPayment && currentPayment.PaymentNumber) {
                const updateUrl = `${process.env.REACT_APP_API_URL}/Payment/UpdatePaymentByPaymentNumber/${encodeURIComponent(currentPayment.PaymentNumber)}`;
                await axios.put(updateUrl, paymentData);
            } else {
                const createUrl = `${process.env.REACT_APP_API_URL}/Payment/CreatePayment`;
                await axios.post(createUrl, paymentData);
            }
    
            setShowModal(false);
            fetchPayments();
        } catch (error) {
            console.error('Error saving payment:', error);
            alert(`Erreur lors de la sauvegarde du paiement: ${error.response?.data || error.message}`);
        }
    };
    

    const handleDeletePayment = async (paymentNumber) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le paiement numéro '${paymentNumber}'?`)) {
            return;
        }

        try {
            const deleteUrl = `${process.env.REACT_APP_API_URL}/Payment/DeletePaymentBYPaymentNumber/${encodeURIComponent(paymentNumber)}`;
            await axios.delete(deleteUrl);
            fetchPayments();
        } catch (error) {
            console.error('Error deleting payment:', error);
            alert(`Erreur lors de la suppression du paiement: ${error.response?.data || error.message}`);
        }
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to the first page
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                Gestion des Paiements
            </Typography>

            {/* Button under title */}
            <Box sx={{ marginBottom: 4 }}>
                <Button variant="contained" color="primary" onClick={() => handleShowModal()}>
                    Ajouter un paiement
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Numéro de Paiement</TableCell>
                            <TableCell>Montant</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Raison</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments.length > 0 ? (
                            payments.map((payment, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                                    <TableCell>{payment.PaymentNumber}</TableCell>
                                    <TableCell>{payment.Amount}</TableCell>
                                    <TableCell>{payment.Type}</TableCell>
                                    <TableCell>{payment.Reason}</TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="outlined"
                                            color="info"
                                            sx={{ marginRight: 2 }}
                                            onClick={() => handleShowModal(payment)}
                                        >
                                            Modifier
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleDeletePayment(payment.PaymentNumber)}
                                        >
                                            Supprimer
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    Aucun paiement trouvé
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                {/* Pagination controls */}
                <TablePagination
                    component="div"
                    count={-1} // Unknown total count; adjust if you have a total count
                    page={page}
                    onPageChange={handlePageChange}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    labelRowsPerPage="Paiements par page"
                />
            </TableContainer>

            {/* Modal for Add/Update Payment */}
            <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{modalTitle}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Montant du Paiement"
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Type de Paiement</InputLabel>
                            <Select
                                value={paymentType}
                                onChange={(e) => setPaymentType(e.target.value)}
                                label="Type de Paiement"
                            >
                                <MenuItem value="revenue">Revenue</MenuItem>
                                <MenuItem value="income">Depense</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Raison du Paiement"
                            value={paymentReason}
                            onChange={(e) => setPaymentReason(e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowModal(false)} color="secondary">
                        Fermer
                    </Button>
                    <Button onClick={handleSavePayment} variant="contained" color="primary">
                        Enregistrer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SupplierPayments;
