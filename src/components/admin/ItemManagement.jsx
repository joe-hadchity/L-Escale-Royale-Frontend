import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
} from "@mui/material";
import axios from "axios";

const ItemManagement = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ingredientsCategories, setIngredientsCategories] = useState([]);
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

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/Category/GetAllCategories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/Ingredients/GetAllIngredients`);
      const parsedIngredients = parseIngredients(response.data);
      setIngredientsCategories(parsedIngredients);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  const parseIngredients = (data) => {
    return data.map((categoryObj, index) => {
      // Find the first key in the object that is not '_id'
      const categoryName = Object.keys(categoryObj).find((key) => key !== '_id');
      // Extract the array of ingredients for the identified category
      const ingredientsArray = categoryObj[categoryName] || [];

      if (categoryName && Array.isArray(ingredientsArray)) {
        return {
          categoryName: categoryName, // Use the dynamic category name
          ingredients: ingredientsArray,
        };
      } else {
        console.warn(`Invalid data structure at index ${index}:`, categoryObj);
        return {
          categoryName: "Unknown",
          ingredients: [],
        };
      }
    });
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

  const handleIngredientCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedIngredientCategory(category);
    const selectedCategory = ingredientsCategories.find((cat) => cat.categoryName === category); // Changed to categoryName
    if (selectedCategory) {
      setAvailableIngredients(selectedCategory.ingredients);
    } else {
      setAvailableIngredients([]);
    }
  };

  const handleShowModal = (item = null) => {
    if (item) {
      setModalTitle("Mettre à jour l'article");
      setCurrentItem(item);
      setItemName(item.Name || "");
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
        Name: itemName,
        CategoryName: selectedCategory,
        Description: description,
        price: parseFloat(price),
        pricedel: parseFloat(pricedel),
        Ingredients: ingredients,
      };

      if (currentItem) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/Item/UpdateItemByName/${currentItem.Name}`,
          newItem
        );
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/Item/CreateItem`, newItem);
      }

      setShowModal(false);
      fetchItemsByCategory(selectedCategory);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        alert("An item with this name already exists. Please choose a different name.");
      } else {
        console.error("Error saving item:", error);
      }
    }
  };

  const handleDeleteItem = async (name) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/Item/DeleteItemByName/${name}`);
      fetchItemsByCategory(selectedCategory);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleAddIngredient = (ingredient) => {
    if (!ingredients.some(ing => ing.Name === ingredient.Name)) {
      setIngredients([...ingredients, ingredient]);
    }
  };

  const handleRemoveIngredient = (index) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 4 }}>
        Gestion des Articles
      </Typography>
      <Box sx={{ marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Catégorie</InputLabel>
          <Select value={selectedCategory} onChange={handleCategoryChange}>
            <MenuItem value="">
              <em>Sélectionner une catégorie</em>
            </MenuItem>
            {categories.map((category, index) => (
              <MenuItem key={index} value={category.Name}>
                {category.Name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedCategory && (
          <Button variant="contained" color="primary" onClick={() => handleShowModal()}>
            Ajouter un article
          </Button>
        )}
      </Box>

      {selectedCategory && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Nom de l'Article</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Prix Dine-In</TableCell>
                <TableCell>Prix Delivery</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.Name}</TableCell>
                  <TableCell>{item.CategoryName}</TableCell>
                  <TableCell>{item.price ? item.price.toFixed(2) : "N/A"} €</TableCell>
                  <TableCell>{item.pricedel ? item.pricedel.toFixed(2) : "N/A"} €</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="info"
                      sx={{ marginRight: 2 }}
                      onClick={() => handleShowModal(item)}
                    >
                      Mettre à jour
                    </Button>
                    <Button variant="contained" color="error" onClick={() => handleDeleteItem(item.Name)}>
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{modalTitle}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>Catégorie d'ingrédient</InputLabel>
            <Select value={selectedIngredientCategory} onChange={handleIngredientCategoryChange}>
              <MenuItem value="">
                <em>Sélectionner une catégorie d'ingrédient</em>
              </MenuItem>
              {ingredientsCategories.map((category, index) => (
                <MenuItem key={index} value={category.categoryName}>
                  {category.categoryName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ marginBottom: 2 }}>
            <InputLabel>Ingrédients</InputLabel>
            <Select
              multiple
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              renderValue={(selected) => selected.map((ing) => ing.Name).join(", ")}
            >
              {availableIngredients.map((ingredient, index) => (
                <MenuItem key={index} value={ingredient}>
                  {ingredient.Name} - {ingredient.Price} €
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {ingredients.length > 0 && (
            <Box sx={{ marginTop: 2 }}>
              <Typography variant="h6">Ingrédients Sélectionnés:</Typography>
              {ingredients.map((ingredient, index) => (
                <Chip
                  key={index}
                  label={`${ingredient.Name} - ${ingredient.Price} €`}
                  onDelete={() => handleRemoveIngredient(index)}
                  sx={{ marginRight: 1, marginBottom: 1 }}
                />
              ))}
            </Box>
          )}

          <TextField
            fullWidth
            margin="normal"
            label="Nom de l'Article"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Prix Dine-In"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Prix Livraison"
            type="number"
            value={pricedel}
            onChange={(e) => setPriceDelivery(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)} color="secondary">
            Fermer
          </Button>
          <Button onClick={handleSaveItem} variant="contained" color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ItemManagement;
