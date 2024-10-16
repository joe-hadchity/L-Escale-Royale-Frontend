import React, { useState, useEffect } from 'react';
import {
    TableContainer,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import axios from 'axios';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('Ajouter une catégorie');
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [location, setLocation] = useState(''); // NEW: Location state

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
            setLocation(category.Location || ''); // NEW: Pre-fill location if available
        } else {
            setModalTitle('Ajouter une catégorie');
            setCurrentCategory(null);
            setCategoryName('');
            setCategoryDescription('');
            setLocation(''); // Reset location
        }
        setShowModal(true);
    };

    const handleSaveCategory = async () => {
        if (!categoryName) {
            alert('Le nom de la catégorie est obligatoire.');
            return;
        }

        try {
            const categoryData = {
                Name: categoryName,
                Description: categoryDescription,
                Location: location 
            };

            if (currentCategory && currentCategory.Name) {
                const updateUrl = `${process.env.REACT_APP_API_URL}/Category/UpdateCategoryByName/${encodeURIComponent(currentCategory.Name)}`;
                await axios.put(updateUrl, categoryData);
            } else {
                const createUrl = `${process.env.REACT_APP_API_URL}/Category/CreateCategory`;
                await axios.post(createUrl, categoryData);
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
                            <TableCell>Lieu</TableCell> {/* NEW: Location column */}
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
                                    <TableCell>{category.Location || 'Non spécifié'}</TableCell> {/* Display location */}
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
                                <TableCell colSpan={5} align="center">
                                    Aucune catégorie trouvée
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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
                        {/* NEW: Select location */}
                        <FormControl fullWidth>
                            <InputLabel>Lieu</InputLabel>
                            <Select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            >
                                <MenuItem value="Kitchen">Cuisine</MenuItem>
                                <MenuItem value="Oven">Four à pizza</MenuItem>
                                <MenuItem value="No Kitchen">Aucun</MenuItem>
                            </Select>
                        </FormControl>
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
