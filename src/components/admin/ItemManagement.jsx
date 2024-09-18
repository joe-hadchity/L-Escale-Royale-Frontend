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
  const [ingredients, setIngredients] = useState([]); // The selected ingredients

  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchIngredients(); // Fetch all ingredient categories
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/Item/GetAllCategories`
      );
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/Ingredients`
      );
      setIngredientsCategories(response.data);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
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
      console.error("Error fetching items:", error);
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

  const handleShowModal = (item = null) => {
    if (item) {
      setModalTitle("Mettre à jour l'article");
      setCurrentItem(item);
      setItemName(item.ItemName || "");
      setDescription(item.Description || "");
      setPrice(item.price || "");
      setPriceDelivery(item.pricedel || "");
      setIngredients(item.Ingredients || []);
    } else {
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
        ItemName: itemName,
        Category: selectedCategory,
        Description: description,
        price: parseFloat(price), // Dine-in price
        pricedel: parseFloat(pricedel), // Delivery price as 'pricedel'
        Ingredients: ingredients,
      };

      if (currentItem) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/Item/UpdateItem/${currentItem.ItemName}`,
          newItem
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/Item/CreateItem`,
          newItem
        );
      }

      setShowModal(false);
      fetchItemsByCategory(selectedCategory);
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleDeleteItem = async (name) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/Item/DeleteItem/${name}`
      );
      fetchItemsByCategory(selectedCategory); // Refresh items after delete
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Handle selecting ingredients from a category dropdown
  const handleIngredientSelect = (category, ingredient) => {
    setIngredients([...ingredients, ingredient]); // Add selected ingredient to the list
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
                <option key={index} value={category.name}>
                  {category.name}
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
                      <td>
                        {item.ItemName ? item.ItemName : "Nom indisponible"}
                      </td>{" "}
                      {/* Ensure this property exists */}
                      <td>
                        {item.Category
                          ? item.Category
                          : "Catégorie indisponible"}
                      </td>{" "}
                      {/* Ensure this property exists */}
                      <td>{item.price ? item.price.toFixed(2) : "N/A"} $</td>
                      <td>
                        {item.pricedel ? item.pricedel.toFixed(2) : "N/A"} $
                      </td>
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
                          onClick={() => handleDeleteItem(item.ItemName)}
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
                  <option key={index} value={category.name}>
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
                value={pricedel} // Use 'pricedel'
                onChange={(e) => setPriceDelivery(e.target.value)} // Update 'pricedel'
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
