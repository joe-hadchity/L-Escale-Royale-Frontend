import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const IngredientManagement = () => {
    const [ingredients, setIngredients] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [currentIngredient, setCurrentIngredient] = useState(null);
    const [ingredientName, setIngredientName] = useState('');
    const [ingredientItems, setIngredientItems] = useState(['']);
    const [isEditing, setIsEditing] = useState(false);

    // Fetch ingredients on component mount
    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/Ingredients`);
            console.log('Ingredients data:', response.data);
            setIngredients(response.data);
        } catch (error) {
            console.error('Error fetching ingredients:', error);
        }
    };

    // Handle opening the modal to add or modify an ingredient
    const handleShowModal = (ingredient = null) => {
        if (ingredient) {
            setModalTitle('Modifier l\'ingrédient');
            setCurrentIngredient(ingredient);
            setIngredientName(getIngredientName(ingredient));
            setIngredientItems([...getIngredientItemsArray(ingredient)]);
            setIsEditing(true);
        } else {
            setModalTitle('Ajouter un ingrédient');
            setCurrentIngredient(null);
            setIngredientName('');
            setIngredientItems(['']);
            setIsEditing(false);
        }
        setShowModal(true);
    };

    // Get the name of the ingredient
    const getIngredientName = (ingredient) => Object.keys(ingredient)[0] || 'Unknown Name';

    // Get the ingredient items as an array
    const getIngredientItemsArray = (ingredient) => {
        const key = Object.keys(ingredient)[0];
        return ingredient[key] || [];
    };

    // Handle saving (add or modify) an ingredient
    const handleSaveIngredient = async () => {
        const newIngredient = { [ingredientName]: ingredientItems };
    
        try {
            if (isEditing && currentIngredient) {
                // Update existing ingredient
                await axios.post(`${process.env.REACT_APP_API_URL}/Ingredients/UpdateASpecifiedIngredient`, {
                    type_of_Ingredient: getIngredientName(currentIngredient),
                    name: ingredientItems // Send array of items
                });
            } else {
                // Add new ingredient
                await axios.post(`${process.env.REACT_APP_API_URL}/Ingredients/Create`, {
                    Ingredient: newIngredient
                });
            }
            fetchIngredients(); // Refresh the ingredient list
            setShowModal(false);
        } catch (error) {
            console.error('Error saving ingredient:', error);
        }
    };
    

    // Handle deleting an ingredient
    const handleDeleteIngredient = async (ingredientName) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/Ingredients/Remove`, {
                [ingredientName]: []
            });
            fetchIngredients(); // Refresh the ingredient list
        } catch (error) {
            console.error('Error deleting ingredient:', error);
        }
    };

    // Handle deleting an item within the ingredient's array
    const handleDeleteItem = (index) => {
        const updatedItems = ingredientItems.filter((_, i) => i !== index);
        setIngredientItems(updatedItems);
    };

    // Handle adding a new item to the ingredient's array
    const handleAddNewItem = () => {
        setIngredientItems([...ingredientItems, '']);
    };

    // Handle form input change for ingredient items
    const handleItemChange = (index, value) => {
        const updatedItems = ingredientItems.map((item, i) => (i === index ? value : item));
        setIngredientItems(updatedItems);
    };

    return (
        <div className="container mx-auto p-6">
            <h2 className="fw-bold mb-4">Gestion des Ingrédients</h2>
            <Button variant="success" className="mb-3" onClick={() => handleShowModal()}>
                Ajouter un ingrédient
            </Button>
            <Table striped bordered hover className="shadow-sm" responsive>
                <thead className="table-dark">
                    <tr>
                        <th>#</th>
                        <th>Nom de l'ingrédient</th>
                        <th>Items</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {ingredients.length > 0 ? (
                        ingredients.map((ingredient, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{getIngredientName(ingredient)}</td>
                                <td>{getIngredientItemsArray(ingredient).join(', ') || 'No items'}</td>
                                <td>
                                    <Button variant="warning" className="me-2" onClick={() => handleShowModal(ingredient)}>
                                        Modifier
                                    </Button>
                                    <Button variant="danger" onClick={() => handleDeleteIngredient(getIngredientName(ingredient))}>
                                        Supprimer
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center">Aucun ingrédient trouvé</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Modal for adding/updating an ingredient */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Nom de l'ingrédient</Form.Label>
                            <Form.Control
                                type="text"
                                value={ingredientName}
                                onChange={(e) => setIngredientName(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Items</Form.Label>
                            {ingredientItems.map((item, index) => (
                                <div key={index} className="d-flex mb-2">
                                    <Form.Control
                                        type="text"
                                        value={item}
                                        onChange={(e) => handleItemChange(index, e.target.value)}
                                        className="me-2"
                                    />
                                    <Button variant="danger" onClick={() => handleDeleteItem(index)}>
                                        Supprimer
                                    </Button>
                                </div>
                            ))}
                            <Button variant="secondary" onClick={handleAddNewItem}>
                                Ajouter un item
                            </Button>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Fermer
                    </Button>
                    <Button variant="primary" onClick={handleSaveIngredient}>
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default IngredientManagement;
