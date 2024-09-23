import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import axios from 'axios';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('Ajouter une catégorie');
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState(''); // Added for Description

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch all categories from backend
    const fetchCategories = async () => {
        try {
            console.log('Fetching categories from backend...');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/Category/GetAllCategories`);
            console.log('Fetched categories:', response.data);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Handle modal opening for new or existing category
    const handleShowModal = (category = null) => {
        if (category) {
            setModalTitle('Mettre à jour la catégorie');
            setCurrentCategory(category);
            setCategoryName(category.Name); // Assuming 'Name' is the correct field in the API response
            setCategoryDescription(category.Description || ''); // Set the Description field
            console.log('Editing category:', category);
        } else {
            setModalTitle('Ajouter une catégorie');
            setCurrentCategory(null);
            setCategoryName('');
            setCategoryDescription(''); // Reset description
            console.log('Adding a new category');
        }
        setShowModal(true);
    };

    // Handle adding or updating a category
    const handleSaveCategory = async () => {
        if (!categoryName) {
            alert('Category name is required.');
            return;
        }

        try {
            if (currentCategory && currentCategory.Name) {
                // Update category: Convert the name to lowercase and encode it to ensure it works
                const updateUrl = `${process.env.REACT_APP_API_URL}/Category/UpdateCategoryByName/${encodeURIComponent(currentCategory.Name)}`;
                console.log(`Updating category: ${currentCategory.Name}`);
                console.log(`PUT request URL: ${updateUrl}`);
                await axios.put(updateUrl, {
                    Name: categoryName,
                    Description: categoryDescription // Add description in update
                });
                console.log(`Category updated: ${categoryName}`);
            } else {
                // Add new category
                console.log(`Adding new category: ${categoryName}`);
                const createUrl = `${process.env.REACT_APP_API_URL}/Category/CreateCategory`;
                console.log(`POST request URL: ${createUrl}`);
                await axios.post(createUrl, {
                    Name: categoryName,
                    Description: categoryDescription // Add description in create
                });
                console.log(`Category created: ${categoryName}`);
            }

            setShowModal(false);
            fetchCategories(); // Refresh categories list after add/update
        } catch (error) {
            console.error('Error saving category:', error);
            alert(`Failed to save category: ${error.response?.data || error.message}`);
        }
    };

    // Handle deleting a category (using encodeURIComponent and converting to lowercase)
    const handleDeleteCategory = async (name) => {
        if (!window.confirm(`Are you sure you want to delete the category '${name}'?`)) {
            return;
        }

        try {
            const deleteUrl = `${process.env.REACT_APP_API_URL}/Category/DeleteCategoryByName/${encodeURIComponent(name)}`;
            console.log(`Deleting category: ${name}`);
            console.log(`DELETE request URL: ${deleteUrl}`);
            await axios.delete(deleteUrl);
            console.log(`Category deleted: ${name}`);
            fetchCategories(); // Refresh categories list after deletion
        } catch (error) {
            console.error('Error deleting category:', error);
            alert(`Failed to delete category: ${error.response?.data || error.message}`);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="row mb-4">
                <div className="col-md-12 d-flex justify-content-between align-items-center">
                    <h2 className="fw-bold">Gestion des Catégories</h2>
                    <Button variant="success" onClick={() => handleShowModal()}>
                        Ajouter une catégorie
                    </Button>
                </div>
            </div>

            <div className="row">
                <div className="col-md-12">
                    <Table striped bordered hover className="shadow-sm" responsive>
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Nom de la Catégorie</th>
                                <th>Description</th> {/* Added Description Column */}
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length > 0 ? (
                                categories.map((category, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{category.Name || 'Nom indisponible'}</td> {/* Match field name with your backend */}
                                        <td>{category.Description || 'Aucune description'}</td> {/* Added Description display */}
                                        <td className="text-center">
                                            <Button
                                                variant="warning"
                                                className="me-2"
                                                onClick={() => handleShowModal(category)}
                                            >
                                                Modifier
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleDeleteCategory(category.Name)}
                                            >
                                                Supprimer
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center">
                                        Aucune catégorie trouvée
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>

            {/* Modal for Add/Update Category */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formCategoryName">
                            <Form.Label>Nom de la Catégorie</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Entrer le nom de la catégorie"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formCategoryDescription"> {/* Added Description field */}
                            <Form.Label>Description de la Catégorie</Form.Label>
                            <Form.Control
                                as="textarea"
                                placeholder="Entrer la description de la catégorie"
                                value={categoryDescription}
                                onChange={(e) => setCategoryDescription(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Fermer
                    </Button>
                    <Button variant="primary" onClick={handleSaveCategory}>
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CategoryManagement;
