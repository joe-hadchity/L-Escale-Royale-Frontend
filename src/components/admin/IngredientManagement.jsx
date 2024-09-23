import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const IngredientManagement = () => {
  const [ingredients, setIngredients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState(null);
  const [ingredientName, setIngredientName] = useState('');
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchIngredients();
  }, []);

  // Fetch all ingredients
  const fetchIngredients = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/Ingredients`);
      console.log('Fetched ingredients:', response.data);

      // Parse the ingredient data if it is in string format
      const parsedIngredients = response.data.map(ingredient => {
        const key = Object.keys(ingredient)[0]; // Get the ingredient name (e.g., 'dsdsdsd', 'Sauce')
        const items = ingredient[key].map(item => {
          if (typeof item === 'string') {
            return JSON.parse(item); // Parse the stringified object
          }
          return item; // Return the item as is if it's already an object
        });
        return { [key]: items }; // Return the parsed ingredients
      });

      setIngredients(parsedIngredients);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      setError('Failed to fetch ingredients.');
    }
  };

  // Show modal to add or update ingredient
  const handleShowModal = (ingredient = null) => {
    if (ingredient) {
      const name = Object.keys(ingredient)[0];
      setCurrentIngredient(name);
      setIngredientName(name);
      setItems(ingredient[name]);
    } else {
      setCurrentIngredient(null);
      setIngredientName('');
      setItems([]);
    }
    setShowModal(true);
  };

  // Save or update ingredient
  const handleSaveIngredient = async () => {
    try {
      const ingredientData = { [ingredientName]: items };

      if (currentIngredient) {
        console.log('Updating ingredient:', currentIngredient);
        console.log('PUT URL:', `${process.env.REACT_APP_API_URL}/Ingredients/UpdateIngredient/${currentIngredient}`);
        console.log('Request body:', ingredientData);

        // Update existing ingredient
        await axios.put(
          `${process.env.REACT_APP_API_URL}/Ingredients/UpdateIngredient/${currentIngredient}`,
          ingredientData
        );
      } else {
        console.log('Creating new ingredient');
        console.log('Request body:', ingredientData);

        // Create new ingredient
        await axios.post(`${process.env.REACT_APP_API_URL}/Ingredients/CreateIngredient`, ingredientData);
      }

      setShowModal(false);
      fetchIngredients();
    } catch (error) {
      console.error('Error saving ingredient:', error);
    }
  };

  // Delete an ingredient
  const handleDeleteIngredient = async (ingredientName) => {
    try {
      if (window.confirm('Are you sure you want to delete this ingredient?')) {
        await axios.delete(`${process.env.REACT_APP_API_URL}/Ingredients/DeleteIngredient/${ingredientName}`);
        fetchIngredients(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting ingredient:', error);
    }
  };

  // Add a new item to the ingredient
  const handleAddItem = () => {
    if (itemName && itemPrice) {
      const newItem = { Name: itemName, Price: parseFloat(itemPrice) };
      setItems([...items, newItem]);
      setItemName('');
      setItemPrice('');
    }
  };

  // Remove an item from the ingredient
  const handleRemoveItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-4">Ingredient Management</h1>

      <Button variant="primary" onClick={() => handleShowModal()} className="mb-3">
        Add New Ingredient
      </Button>

      {error && <p className="text-danger">{error}</p>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Ingredient Name</th>
            <th>Items</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.length > 0 ? (
            ingredients.map((ingredient, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <strong>{Object.keys(ingredient)[0]}</strong>
                </td>
                <td>
                  <ul>
                    {ingredient[Object.keys(ingredient)[0]].map((item, i) => (
                      <li key={i}>
                        <strong>{item.Name}</strong> - {item.Price ? parseFloat(item.Price).toFixed(2) : 'N/A'} €
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <Button variant="warning" onClick={() => handleShowModal(ingredient)} className="me-2">
                    Update
                  </Button>
                  <Button variant="danger" onClick={() => handleDeleteIngredient(Object.keys(ingredient)[0])}>
                    Delete
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

      {/* Modal for Add/Update Ingredient */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{currentIngredient ? 'Update Ingredient' : 'Add New Ingredient'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formIngredientName">
              <Form.Label>Ingredient Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter ingredient name"
                value={ingredientName}
                onChange={(e) => setIngredientName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Items</Form.Label>
              <div>
                {items.map((item, index) => (
                  <div key={index} className="d-flex align-items-center mb-2">
                    <span className="me-2">
                      {item.Name} - {item.Price} €
                    </span>
                    <Button variant="danger" onClick={() => handleRemoveItem(index)}>
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
                  Add Item
                </Button>
              </Form.Group>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveIngredient}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default IngredientManagement;
