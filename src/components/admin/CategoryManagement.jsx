import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import axios from 'axios';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('Ajouter une catégorie');
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch all categories from backend
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/Item/GetAllCategories`);
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
            setCategoryName(category.name); // Ensure 'name' is being used correctly after parsing
        } else {
            setModalTitle('Ajouter une catégorie');
            setCurrentCategory(null);
            setCategoryName('');
        }
        setShowModal(true);
    };

    // Handle adding or updating a category
    const handleSaveCategory = async () => {
        try {
            if (currentCategory) {
                // Update category
                await axios.put(`${process.env.REACT_APP_API_URL}/Item/UpdateCategory/${currentCategory.name}`, {
                    name: categoryName,
                });
            } else {
                // Add new category
                await axios.post(`${process.env.REACT_APP_API_URL}/Item/CreateCategory`, {
                    name: categoryName,
                });
            }
            setShowModal(false);
            fetchCategories(); // Refresh categories list after add/update
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    // Handle deleting a category
    const handleDeleteCategory = async (name) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/Item/DeleteCategoryByName/${name}`);
            fetchCategories(); // Refresh categories list after deletion
        } catch (error) {
            console.error('Error deleting category:', error);
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
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length > 0 ? (
                                categories.map((category, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{category.name || 'Nom indisponible'}</td> {/* Check if name exists */}
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
                                                onClick={() => handleDeleteCategory(category.name)}
                                            >
                                                Supprimer
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="text-center">
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
