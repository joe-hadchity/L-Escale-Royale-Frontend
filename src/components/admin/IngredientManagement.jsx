import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const IngredientManagement = () => {
  const [ingredients, setIngredients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentIngredientCategory, setCurrentIngredientCategory] = useState('');
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/Ingredients`);
      console.log('API response:', response.data); // Log the full API response for debugging

      // Ensure response.data exists and is an array
      if (response.data && Array.isArray(response.data)) {
        const parsedIngredients = response.data.map(ingredient => {
          const key = Object.keys(ingredient)[0];
          
          // Ensure the ingredient[key] exists and is an array
          const items = Array.isArray(ingredient[key])
            ? ingredient[key].map(item => {
                // Parse if the item is stringified JSON
                if (typeof item === 'string') {
                  try {
                    return JSON.parse(item);
                  } catch (parseError) {
                    console.error('Error parsing item:', parseError);
                    return item; // Return original item if parsing fails
                  }
                }
                return item;
              })
            : []; // If ingredient[key] isn't an array, return an empty array

          return { [key]: items };
        });

        setIngredients(parsedIngredients);
      } else {
        console.error('Unexpected response format:', response.data);
        setError('Failed to fetch ingredients. Unexpected response format.');
      }

    } catch (error) {
      console.error('Error fetching ingredients:', error);
      setError('Failed to fetch ingredients.');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (ingredient = null) => {
    if (ingredient) {
      const category = Object.keys(ingredient)[0];
      setCurrentIngredientCategory(category);
      setItems(ingredient[category]);
    } else {
      setCurrentIngredientCategory('');
      setItems([]);
    }
    setShowModal(true);
  };

  const handleAddItem = async () => {
    if (itemName && itemPrice) {
      try {
        const newItem = {
          type_of_Ingredient: currentIngredientCategory,
          Name: itemName,
          Price: parseFloat(itemPrice),
        };

        await axios.post(`${process.env.REACT_APP_API_URL}/Ingredients/AddanIngredientToALiSt`, newItem);
        console.log('Item added:', newItem);
        setItems([...items, newItem]);
        setItemName('');
        setItemPrice('');
        fetchIngredients();
      } catch (error) {
        console.error('Error adding item:', error.response ? error.response.data : error.message);
      }
    } else {
      alert('Please provide both an item name and price.');
    }
  };

  // Remove an entire category
  const handleRemoveCategory = async (category) => {
    if (window.confirm(`Are you sure you want to delete the entire category: ${category}?`)) {
      try {
        const data = {
          [category]: [] // Send empty array for the category you want to remove
        };

        await axios.delete(`${process.env.REACT_APP_API_URL}/Ingredients/RemoveACategory`, {
          data
        });

        console.log('Category removed:', category);
        fetchIngredients(); // Refresh the ingredients list
      } catch (error) {
        console.error('Error removing category:', error.response ? error.response.data : error.message);
      }
    }
  };

  const handleRemoveItem = async (index, item) => {
    try {
      const itemToRemove = {
        type_of_Ingredient: currentIngredientCategory,
        Name: item.Name,
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/Ingredients/removeASpecifiedIngredientFromTheList`, itemToRemove);
      console.log('Item removed:', itemToRemove);

      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
      fetchIngredients();
    } catch (error) {
      console.error('Error removing item:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-4 text-center">Ingredient Management</h1>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="primary" onClick={() => handleShowModal()}>
          Add New Ingredient Category
        </Button>
        {error && <Alert variant="danger">{error}</Alert>}
      </div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Ingredient Category</th>
              <th>Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(ingredients) && ingredients.length > 0 ? (
              ingredients.map((ingredient, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>{Object.keys(ingredient)[0]}</strong>
                  </td>
                  <td>
                    <ul>
                      {Array.isArray(ingredient[Object.keys(ingredient)[0]]) &&
                        ingredient[Object.keys(ingredient)[0]].map((item, i) => (
                          <li key={i}>
                            <strong>{item.Name}</strong> - {item.Price !== undefined && item.Price !== null ? `${parseFloat(item.Price).toFixed(2)} €` : 'N/A'}
                          </li>
                        ))}
                    </ul>
                  </td>
                  <td>
                    <Button variant="warning" onClick={() => handleShowModal(ingredient)} className="me-2">
                      Update
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleRemoveCategory(Object.keys(ingredient)[0])}
                    >
                      Remove Category
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No ingredients found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Modal for Add/Update Ingredient */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentIngredientCategory ? 'Update Ingredient' : 'Add New Ingredient'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formIngredientCategory">
              <Form.Label>Ingredient Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter ingredient category"
                value={currentIngredientCategory}
                onChange={(e) => setCurrentIngredientCategory(e.target.value)}
                disabled={currentIngredientCategory !== ''}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Items</Form.Label>
              <div>
                {items.map((item, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <span className="me-2">
                      {item.Name} - {item.Price !== undefined && item.Price !== null ? `${parseFloat(item.Price).toFixed(2)} €` : 'N/A'}
                    </span>
                    <Button variant="danger" size="sm" onClick={() => handleRemoveItem(index, item)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              <Form.Group className="d-flex mb-3">
                <Form.Control
                  type="text"
                  placeholder="Item name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="me-2"
                />
                <Form.Control
                  type="number"
                  placeholder="Item price"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  className="me-2"
                />
                <Button variant="primary" onClick={handleAddItem}>
                  Save Changes
                </Button>
              </Form.Group>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default IngredientManagement;
