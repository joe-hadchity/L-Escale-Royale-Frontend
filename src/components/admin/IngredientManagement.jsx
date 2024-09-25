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
} from "@mui/material";
import axios from "axios";

const IngredientsManagement = () => {
  const [categories, setCategories] = useState([]); // Stores all categories
  const [selectedCategory, setSelectedCategory] = useState(""); // Selected category
  const [showModal, setShowModal] = useState(false); // Show/hide modal
  const [newCategoryName, setNewCategoryName] = useState(""); // New category name
  const [newIngredientName, setNewIngredientName] = useState(""); // New ingredient name
  const [newIngredientPrice, setNewIngredientPrice] = useState(""); // New ingredient price
  const [currentIngredients, setCurrentIngredients] = useState([]); // Ingredients in the selected category

  useEffect(() => {
    fetchCategories(); // Fetch all categories on component mount
  }, []);

  // Fetches all categories from the backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/Ingredients/GetAllIngredients`);
      const formattedCategories = response.data.map((doc) => {
        const categoryKey = Object.keys(doc).find((key) => key !== "_id"); // Extracts the category name, ignoring '_id'
        return { categoryName: categoryKey, ingredients: doc[categoryKey] };
      });
      setCategories(formattedCategories); // Set the formatted categories from the API response
      console.log("Categories fetched: ", formattedCategories); // Log categories
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Creates a new ingredient category
  const handleCreateCategory = async () => {
    try {
      const categoryData = { [newCategoryName]: [] }; // Structure for new category with no ingredients
      await axios.post(`${process.env.REACT_APP_API_URL}/Ingredients/CreateIngredient`, categoryData);
      fetchCategories(); // Refresh categories after creation
      setShowModal(false); // Close modal
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  // Adds a new ingredient to the selected category
  const handleAddIngredient = async () => {
    console.log("Adding ingredient...");
    console.log("Selected Category: ", selectedCategory);
    console.log("New Ingredient: ", newIngredientName);
    console.log("Price: ", newIngredientPrice);

    try {
      const ingredientData = {
        type_of_Ingredient: selectedCategory,
        Name: newIngredientName,
        Price: parseFloat(newIngredientPrice), // Parse price to float
      };

      console.log("Sending ingredient data: ", ingredientData);
      await axios.post(`${process.env.REACT_APP_API_URL}/Ingredients/AddanIngredientToALiSt`, ingredientData);

      console.log("Ingredient added successfully.");

      // Clear the input fields after adding the ingredient
      setNewIngredientName("");
      setNewIngredientPrice("");

      // Refresh the ingredients list for the selected category
      fetchIngredientsByCategory(selectedCategory); // Refresh ingredients for the selected category
    } catch (error) {
      console.error("Error adding ingredient:", error);
    }
  };

  // Fetches ingredients for a selected category
  const fetchIngredientsByCategory = (category) => {
    setSelectedCategory(category); // Set selected category
    const selectedCategoryData = categories.find((cat) => cat.categoryName === category); // Find the category from the list
    if (selectedCategoryData) {
      setCurrentIngredients(selectedCategoryData.ingredients); // Set ingredients of the category
      console.log("Ingredients for category: ", selectedCategoryData.ingredients); // Log ingredients for the category
    }
  };

  // Deletes an ingredient from the selected category
  const handleDeleteIngredient = async (ingredientName) => {
    try {
      const ingredientData = {
        type_of_Ingredient: selectedCategory,
        Name: ingredientName,
      };

      console.log("Deleting ingredient: ", ingredientData);
      await axios.post(`${process.env.REACT_APP_API_URL}/Ingredients/removeASpecifiedIngredientFromTheList`, ingredientData);

      console.log(`Ingredient ${ingredientName} deleted successfully.`);
      fetchIngredientsByCategory(selectedCategory); // Refresh ingredients
    } catch (error) {
      console.error("Error deleting ingredient:", error);
    }
  };

  // Deletes an entire ingredient category and all its ingredients
  const handleDeleteCategory = async (categoryName) => {
    try {
      console.log("Deleting category: ", categoryName);
      const categoryData = { [categoryName]: [] }; // Create the category object to send
      await axios.delete(`${process.env.REACT_APP_API_URL}/Ingredients/RemoveACategory`, {
        data: categoryData,
      });
      console.log(`Category ${categoryName} deleted successfully.`);
      fetchCategories(); // Refresh categories after deletion
    } catch (error) {
      console.error("Error deleting category: ", error);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 4 }}>
        Gestion des Ingrédients
      </Typography>

      {/* Create Category Button */}
      <Button variant="contained" color="primary" onClick={() => setShowModal(true)}>
        Ajouter une Catégorie
      </Button>

      {/* Modal for Creating a New Category */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ajouter une Catégorie</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nom de la Catégorie"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)} color="secondary">
            Annuler
          </Button>
          <Button onClick={handleCreateCategory} variant="contained" color="primary">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      <FormControl fullWidth sx={{ marginY: 4 }}>
        <InputLabel>Catégorie</InputLabel>
        <Select value={selectedCategory} onChange={(e) => fetchIngredientsByCategory(e.target.value)}>
          <MenuItem value="">
            <em>Sélectionner une catégorie</em>
          </MenuItem>
          {categories.map((categoryObj, index) => (
            <MenuItem key={index} value={categoryObj.categoryName}>
              {categoryObj.categoryName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Ingredient List */}
      {selectedCategory && (
        <Box sx={{ marginTop: 4 }}>
          <Typography variant="h6">Ingrédients pour {selectedCategory}</Typography>
          {currentIngredients.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Prix (€)</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentIngredients.map((ingredient, index) => (
                    <TableRow key={index}>
                      <TableCell>{ingredient.Name}</TableCell>
                      <TableCell>{ingredient.Price}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDeleteIngredient(ingredient.Name)}
                        >
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>Aucun ingrédient trouvé dans cette catégorie.</Typography>
          )}

          {/* Add New Ingredient Section */}
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6">Ajouter un Ingrédient</Typography>
            <TextField
              label="Nom de l'Ingrédient"
              value={newIngredientName}
              onChange={(e) => setNewIngredientName(e.target.value)}
              fullWidth
              sx={{ marginBottom: 2 }}
            />
            <TextField
              label="Prix de l'Ingrédient"
              type="number"
              value={newIngredientPrice}
              onChange={(e) => setNewIngredientPrice(e.target.value)}
              fullWidth
              sx={{ marginBottom: 2 }}
            />
            <Button variant="contained" color="primary" onClick={handleAddIngredient}>
              Ajouter Ingrédient
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default IngredientsManagement;
