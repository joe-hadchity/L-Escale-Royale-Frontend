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
  TablePagination,
  CircularProgress,
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

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchIngredients();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      console.log(`Fetching items for category: ${selectedCategory}, page: ${page}, rowsPerPage: ${rowsPerPage}`);
      fetchItemsByCategory(selectedCategory, page + 1, rowsPerPage);
    }
  }, [selectedCategory, page, rowsPerPage]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/Category/GetAllCategories`);
      console.log("Categories fetched:", response.data);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/Ingredients/GetAllIngredients`);
      const parsedIngredients = parseIngredients(response.data);
      console.log("Ingredients fetched:", parsedIngredients);
      setIngredientsCategories(parsedIngredients || []);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  const parseIngredients = (data) => {
    return data.map((categoryObj, index) => {
      const categoryName = Object.keys(categoryObj).find((key) => key !== "_id");
      const ingredientsArray = categoryObj[categoryName] || [];

      if (categoryName && Array.isArray(ingredientsArray)) {
        return {
          categoryName: categoryName,
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

  const fetchItemsByCategory = async (category, pageNumber, pageSize) => {
    try {
      setLoadingItems(true);
      const apiUrl = `${process.env.REACT_APP_API_URL}/Item/GetItemsByCategory/${category}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
      console.log("Fetching items from URL:", apiUrl);
      const response = await axios.get(apiUrl);
      console.log("Full response data:", response.data);
  
      // Since response.data is already an array of items
      setItems(response.data || []);
      setTotalItems(response.data.length || 0);
  
      setLoadingItems(false);
    } catch (error) {
      console.error("Error fetching items:", error);
      setLoadingItems(false);
    }
  };
  
  

  const handleCategoryChange = (event) => {
    const category = event.target.value;
    console.log("Category selected:", category);
    setSelectedCategory(category);
    setPage(0); // Reset to the first page on category change
  };

  const handleIngredientCategoryChange = (event) => {
    const category = event.target.value;
    setSelectedIngredientCategory(category);

    // Find the corresponding ingredient category and set available ingredients
    const selectedCat = ingredientsCategories.find((cat) => cat.categoryName === category);
    console.log("Selected ingredient category:", selectedCat);
    if (selectedCat) {
      setAvailableIngredients(selectedCat.ingredients || []); // Ensure availableIngredients is an array
    } else {
      setAvailableIngredients([]);
    }
  };

  const handlePageChange = (event, newPage) => {
    console.log("Page changed to:", newPage);
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    console.log("Rows per page changed to:", event.target.value);
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleShowModal = (item = null) => {
    if (item) {
      console.log("Editing item:", item);
      setModalTitle("Mettre à jour l'article");
      setCurrentItem(item);
      setItemName(item.Name || "");
      setDescription(item.Description || "");
      setPrice(item.price || "");
      setPriceDelivery(item.pricedel || "");
      setIngredients(item.Ingredients || []);
    } else {
      console.log("Adding a new item");
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

      console.log("Saving item:", newItem);

      if (currentItem) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/Item/UpdateItemByName/${currentItem.Name}`,
          newItem
        );
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/Item/CreateItem`, newItem);
      }

      setShowModal(false);
      fetchItemsByCategory(selectedCategory, page + 1, rowsPerPage);
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
      console.log("Deleting item:", name);
      await axios.delete(`${process.env.REACT_APP_API_URL}/Item/DeleteItemByName/${name}`);
      fetchItemsByCategory(selectedCategory, page + 1, rowsPerPage);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
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
            {(categories || []).map((category, index) => (
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

      {loadingItems ? (
        <CircularProgress />
      ) : (
        selectedCategory && (
          <>
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
                  {(items || []).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
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

            <TablePagination
              component="div"
              count={totalItems}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              labelRowsPerPage="Articles par page"
            />
          </>
        )
      )}

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{modalTitle}</DialogTitle>
        <DialogContent>
          {/* Dialog content for adding/updating items */}
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
