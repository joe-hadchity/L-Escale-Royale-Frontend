import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import axios from 'axios';

const ItemManagement = () => {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('Ajouter un article');
    const [currentItem, setCurrentItem] = useState(null);
    const [itemName, setItemName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [ingredients, setIngredients] = useState([]);
    const [type, setType] = useState('');
    const [ingredientInput, setIngredientInput] = useState('');
    const [loadingItems, setLoadingItems] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/Item/GetAllCategories`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchItemsByCategory = async (category) => {
        try {
            setLoadingItems(true);
            const apiUrl = `${process.env.REACT_APP_API_URL}/Item/GetItemsByCategory/${category}`;
            const response = await axios.get(apiUrl);
            setItems(response.data);
            setLoadingItems(false);
        } catch (error) {
            console.error('Error fetching items:', error);
            setLoadingItems(false);
        }
    };

    const handleCategoryChange = (event) => {
        const category = event.target.value;
        setSelectedCategory(category);
        if (category) {
            fetchItemsByCategory(category);
        } else {
            setItems([]);
        }
    };

    const handleShowModal = () => {
        setModalTitle('Ajouter un article');
        setCurrentItem(null);
        setItemName('');
        setDescription('');
        setPrice('');
        setIngredients([]);
        setType('');
        setShowModal(true);
    };

    const addIngredient = () => {
        if (ingredientInput) {
            setIngredients([...ingredients, ingredientInput]);
            setIngredientInput('');
        }
    };

    const handleSaveItem = async () => {
        try {
            const newItem = {
                ItemName: itemName,
                Category: selectedCategory,
                Description: description,
                price: parseFloat(price),
                Ingredients: ingredients,
                Type: type,
            };

            if (currentItem) {
                await axios.put(`${process.env.REACT_APP_API_URL}/Item/UpdateItem/${currentItem.name}`, newItem);
            } else {
                await axios.post(`${process.env.REACT_APP_API_URL}/Item/CreateItem`, newItem);
            }

            setShowModal(false);
            fetchItemsByCategory(selectedCategory);
        } catch (error) {
            console.error('Error saving item:', error);
        }
    };

    const handleDeleteItem = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/Item/DeleteItem/${id}`);
            fetchItemsByCategory(selectedCategory); // Refresh items after delete
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="row mb-4">
                <div className="col-md-12 d-flex justify-content-between align-items-center">
                    <h2>Gestion des Articles</h2>
                    <div>
                        <Form.Select
                            className="me-3"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            style={{ display: 'inline-block', width: 'auto' }}
                        >
                            <option value="">Sélectionner une catégorie</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </Form.Select>
                        {selectedCategory && (
                            <Button variant="success" onClick={handleShowModal}>
                                Ajouter un article
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Display items for the selected category */}
            {selectedCategory && (
                <div className="row">
                    <div className="col-md-12">
                        {loadingItems ? (
                            <p>Chargement des articles...</p>
                        ) : items.length > 0 ? (
                            <table className="table table-hover table-bordered" style={{ backgroundColor: '#f8f9fa' }}>
                                <thead className="table-dark">
                                    <tr>
                                        <th>#</th>
                                        <th>Nom de l'Article</th>
                                        <th>Catégorie</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td>{item.name}</td>
                                            <td>{item.category}</td>
                                            <td>
                                                <Button
                                                    variant="info"
                                                    className="me-2 text-white"
                                                    onClick={() => handleShowModal(item)}
                                                >
                                                    Mettre à jour
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleDeleteItem(item.id)}
                                                >
                                                    Supprimer
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>Aucun article trouvé pour cette catégorie.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Modal for Add/Update Item */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formItemCategory">
                            <Form.Label>Catégorie</Form.Label>
                            <Form.Select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                disabled
                            >
                                <option value="">Sélectionner une catégorie</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formItemName">
                            <Form.Label>Nom de l'Article</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Entrer le nom de l'article"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formDescription">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Entrer la description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formPrice">
                            <Form.Label>Prix</Form.Label>
                            <Form.Control
                                type="number"
                                placeholder="Entrer le prix"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formIngredients">
                            <Form.Label>Ingrédients</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Ajouter un ingrédient"
                                    value={ingredientInput}
                                    onChange={(e) => setIngredientInput(e.target.value)}
                                />
                                <Button variant="outline-secondary" onClick={addIngredient}>
                                    Ajouter
                                </Button>
                            </InputGroup>
                            <div>
                                {ingredients.length > 0 && (
                                    <ul>
                                        {ingredients.map((ingredient, index) => (
                                            <li key={index}>{ingredient}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formType">
                            <Form.Label>Type</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Entrer le type d'article"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Fermer
                    </Button>
                    <Button variant="primary" onClick={handleSaveItem}>
                        Enregistrer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ItemManagement;
