import React, { useState, useEffect } from 'react';
import { TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, Box } from '@mui/material';
import axios from 'axios';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('Ajouter une catégorie');
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/Category/GetAllCategories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleShowModal = (category = null) => {
        if (category) {
            setModalTitle('Mettre à jour la catégorie');
            setCurrentCategory(category);
            setCategoryName(category.Name || '');
            setCategoryDescription(category.Description || '');
        } else {
            setModalTitle('Ajouter une catégorie');
            setCurrentCategory(null);
            setCategoryName('');
            setCategoryDescription('');
        }
        setShowModal(true);
    };

    const handleSaveCategory = async () => {
        if (!categoryName) {
            alert('Le nom de la catégorie est obligatoire.');
            return;
        }

        try {
            if (currentCategory && currentCategory.Name) {
                const updateUrl = `${process.env.REACT_APP_API_URL}/Category/UpdateCategoryByName/${encodeURIComponent(currentCategory.Name)}`;
                await axios.put(updateUrl, {
                    Name: categoryName,
                    Description: categoryDescription
                });
            } else {
                const createUrl = `${process.env.REACT_APP_API_URL}/Category/CreateCategory`;
                await axios.post(createUrl, {
                    Name: categoryName,
                    Description: categoryDescription
                });
            }

            setShowModal(false);
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert(`Erreur lors de la sauvegarde de la catégorie: ${error.response?.data || error.message}`);
        }
    };

    const handleDeleteCategory = async (name) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie '${name}'?`)) {
            return;
        }

        try {
            const deleteUrl = `${process.env.REACT_APP_API_URL}/Category/DeleteCategoryByName/${encodeURIComponent(name)}`;
            await axios.delete(deleteUrl);
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert(`Erreur lors de la suppression de la catégorie: ${error.response?.data || error.message}`);
        }
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                Gestion des Catégories
            </Typography>

            {/* Button under title */}
            <Box sx={{ marginBottom: 4 }}>
                <Button variant="contained" color="primary" onClick={() => handleShowModal()}>
                    Ajouter une catégorie
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Nom de la Catégorie</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.length > 0 ? (
                            categories.map((category, index) => (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{category.Name || 'Nom indisponible'}</TableCell>
                                    <TableCell>{category.Description || 'Aucune description'}</TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="outlined"
                                            color="info"
                                            sx={{ marginRight: 2 }}
                                            onClick={() => handleShowModal(category)}
                                        >
                                            Modifier
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleDeleteCategory(category.Name)}
                                        >
                                            Supprimer
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    Aucune catégorie trouvée
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal for Add/Update Category */}
            <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{modalTitle}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Nom de la Catégorie"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            label="Description de la Catégorie"
                            value={categoryDescription}
                            onChange={(e) => setCategoryDescription(e.target.value)}
                            fullWidth
                            multiline
                            rows={4}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowModal(false)} color="secondary">
                        Fermer
                    </Button>
                    <Button onClick={handleSaveCategory} variant="contained" color="primary">
                        Enregistrer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CategoryManagement;
