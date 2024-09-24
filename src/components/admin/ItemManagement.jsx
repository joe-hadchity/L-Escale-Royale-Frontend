import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  InputGroup,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import axios from "axios";

const ItemManagement = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ingredientsCategories, setIngredientsCategories] = useState([]); // Fetch ingredients categories
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("Ajouter un article");
  const [currentItem, setCurrentItem] = useState(null);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(""); // Dine-in price
  const [pricedel, setPriceDelivery] = useState(""); // Delivery price
  const [ingredients, setIngredients] = useState([]); // Selected ingredients
  const [availableIngredients, setAvailableIngredients] = useState([]); // List of available ingredients
  const [selectedIngredientCategory, setSelectedIngredientCategory] = useState("");
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchIngredients(); // Fetch all ingredient categories
  }, []);

  // Fetch categories for the item
  const fetchCategories = async () => {
    try {
      console.log("Fetching categories...");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/Category/GetAllCategories`);
      console.log("Fetched categories:", response.data);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch ingredients and parse the nested arrays
  const fetchIngredients = async () => {
    try {
      console.log("Fetching ingredients...");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/Ingredients/GetAllIngredients`);
      console.log("Fetched ingredients:", response.data);
      
      // Safely parse the ingredients, handling undefined cases
      const parsedIngredients = parseIngredients(response.data); 
      console.log("Parsed ingredients categories:", parsedIngredients);
      setIngredientsCategories(parsedIngredients);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  // Helper function to parse ingredients data structure with safety checks
  const parseIngredients = (data) => {
    return data.map((categoryObj, index) => {
      // Check if 'Ingredient' exists and is an object
      if (categoryObj && categoryObj.Ingredient && typeof categoryObj.Ingredient === 'object') {
        const categoryKey = Object.keys(categoryObj.Ingredient)[0];
        const ingredientsArray = categoryObj.Ingredient[categoryKey];
        
        if (Array.isArray(ingredientsArray)) {
          return {
            category: categoryKey,
            ingredients: ingredientsArray.map((ingredientObj) =>
              typeof ingredientObj === "string" ? JSON.parse(ingredientObj) : ingredientObj
            ),
          };
        } else {
          console.warn(`No ingredients array for category: ${categoryKey}`);
          return {
            category: categoryKey,
            ingredients: [], // Fallback if no ingredients array
          };
        }
      } else {
        console.warn(`Invalid data structure at index ${index}:`, categoryObj);
        return {
          category: "Unknown",
          ingredients: [], // Fallback for malformed data
        };
      }
    });
  };

  // Fetch items based on the selected category
  const fetchItemsByCategory = async (category) => {
    try {
      console.log(`Fetching items for category: ${category}`);
      setLoadingItems(true);
      const apiUrl = `${process.env.REACT_APP_API_URL}/Item/GetItemsByCategory/${category}`;
      const response = await axios.get(apiUrl);
      console.log(`Fetched items for category ${category}:`, response.data);
      setItems(response.data);
      setLoadingItems(false);
    } catch (error) {
      console.error("Error fetching items:", error);
      setLoadingItems(false);
    }
  };

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    console.log("Selected category:", category);
    setSelectedCategory(category);
    if (category) {
      fetchItemsByCategory(category);
    } else {
      setItems([]);
    }
  };

  const handleIngredientCategoryChange = (event) => {
    const category = event.target.value;
    console.log("Selected ingredient category:", category);
    setSelectedIngredientCategory(category);
    const selectedCategory = ingredientsCategories.find(
      (cat) => cat.category === category
    );
    if (selectedCategory) {
      setAvailableIngredients(selectedCategory.ingredients);
      console.log("Available ingredients:", selectedCategory.ingredients);
    } else {
      setAvailableIngredients([]);
      console.log("No available ingredients for the selected category.");
    }
  };

  const handleShowModal = (item = null) => {
    if (item) {
      console.log("Updating item:", item);
      setModalTitle("Mettre à jour l'article");
      setCurrentItem(item);
      setItemName(item.Name || "");
      setDescription(item.Description || "");
      setPrice(item.price || "");
      setPriceDelivery(item.pricedel || "");
      setIngredients(item.Ingredients || []);
    } else {
      console.log("Adding a new item.");
      setModalTitle("Ajouter un article");
      setCurrentItem(null);
      setItemName("");
      setDescription("");
      setPrice("");
      setPriceDelivery("");
      setIngredients([]);
    }
    setShowModal(true);
  };

  const handleSaveItem = async () => {
    try {
      const newItem = {
        Name: itemName, // Changed from ItemName to Name
        CategoryName: selectedCategory, // Updated to CategoryName
        Description: description,
        price: parseFloat(price), // Dine-in price
        pricedel: parseFloat(pricedel), // Delivery price as 'pricedel'
        Ingredients: ingredients, // Add ingredients to the item
      };
  
      console.log("Saving item:", newItem);
  
      if (currentItem) {
        // Updating the existing item
        await axios.put(
          `${process.env.REACT_APP_API_URL}/Item/UpdateItemByName/${currentItem.Name}`,
          newItem
        );
        console.log("Item updated successfully.");
      } else {
        // Creating a new item
        await axios.post(`${process.env.REACT_APP_API_URL}/Item/CreateItem`, newItem);
        console.log("Item created successfully.");
      }
  
      setShowModal(false);
      fetchItemsByCategory(selectedCategory);
    } catch (error) {
      // Check for 409 Conflict
      if (error.response && error.response.status === 409) {
        console.error("Error: Item with this name already exists.");
        alert("An item with this name already exists. Please choose a different name.");
      } else {
        console.error("Error saving item:", error);
      }
    }
  };
  

  const handleDeleteItem = async (name) => {
    try {
      console.log("Deleting item:", name);
      await axios.delete(`${process.env.REACT_APP_API_URL}/Item/DeleteItemByName/${name}`);
      console.log(`Item ${name} deleted successfully.`);
      fetchItemsByCategory(selectedCategory); // Refresh items after delete
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Handle selecting an ingredient from a category
  const handleAddIngredient = (ingredient) => {
    if (!ingredients.includes(ingredient)) {
      console.log("Adding ingredient:", ingredient);
      setIngredients([...ingredients, ingredient]);
    } else {
      console.log("Ingredient already selected:", ingredient);
    }
  };

  const handleRemoveIngredient = (index) => {
    console.log("Removing ingredient at index:", index);
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
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
              style={{ display: "inline-block", width: "auto" }}
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category, index) => (
                <option key={index} value={category.Name}>
                  {category.Name}
                </option>
              ))}
            </Form.Select>
            {selectedCategory && (
              <Button variant="success" onClick={() => handleShowModal()}>
                Ajouter un article
              </Button>
            )}
          </div>
        </div>
      </div>

      {selectedCategory && (
        <div className="row">
          <div className="col-md-12">
            {loadingItems ? (
              <p>Chargement des articles...</p>
            ) : items.length > 0 ? (
              <table
                className="table table-hover table-bordered"
                style={{ backgroundColor: "#f8f9fa" }}
              >
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Nom de l'Article</th>
                    <th>Catégorie</th>
                    <th>Prix Dine-In</th>
                    <th>Prix Delivery</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.Name ? item.Name : "Nom indisponible"}</td>
                      <td>
                        {item.CategoryName
                          ? item.CategoryName
                          : "Catégorie indisponible"}
                      </td>
                      <td>{item.price ? item.price.toFixed(2) : "N/A"} €</td>
                      <td>{item.pricedel ? item.pricedel.toFixed(2) : "N/A"} €</td>
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
                          onClick={() => handleDeleteItem(item.Name)}
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
              <Form.Select value={selectedCategory} disabled>
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category, index) => (
                  <option key={index} value={category.Name}>
                    {category.Name}
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
              <Form.Label>Prix Dine-In</Form.Label>
              <Form.Control
                type="number"
                placeholder="Entrer le prix pour dine-in"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPriceDelivery">
              <Form.Label>Prix Livraison</Form.Label>
              <Form.Control
                type="number"
                placeholder="Entrer le prix pour livraison"
                value={pricedel}
                onChange={(e) => setPriceDelivery(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ajouter des ingrédients</Form.Label>
              {ingredients.map((ingredient, index) => (
                <InputGroup className="mb-2" key={index}>
                  <Form.Control
                    type="text"
                    value={ingredient.Name || ""}
                    placeholder="Nom de l'ingrédient"
                    readOnly
                  />
                  <Form.Control
                    type="text"
                    value={ingredient.Price || ""}
                    placeholder="Prix de l'ingrédient"
                    readOnly
                  />
                  <Button
                    variant="danger"
                    onClick={() => handleRemoveIngredient(index)}
                  >
                    Supprimer
                  </Button>
                </InputGroup>
              ))}
              <Form.Select
                className="mb-3"
                value={selectedIngredientCategory}
                onChange={handleIngredientCategoryChange}
              >
                <option value="">Sélectionner une catégorie d'ingrédient</option>
                {ingredientsCategories.map((category, index) => (
                  <option key={index} value={category.category}>
                    {category.category}
                  </option>
                ))}
              </Form.Select>
              <DropdownButton
                className="mb-3"
                title="Sélectionner un ingrédient"
                onSelect={(ingredient) => handleAddIngredient(ingredient)}
              >
                {availableIngredients.map((ingredient, index) => (
                  <Dropdown.Item
                    key={index}
                    eventKey={ingredient.Name}
                    onClick={() => handleAddIngredient(ingredient)}
                  >
                    {ingredient.Name} - {ingredient.Price} €
                  </Dropdown.Item>
                ))}
              </DropdownButton>
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
