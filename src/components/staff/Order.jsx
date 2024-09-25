import React, { useState, useEffect, useRef } from 'react';
import {
    Grid,
    Typography,
    Card,
    CardContent,
    Box,
    Container,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel,
    List,
    ListItem,
    ListItemText,
    Divider,
    IconButton,
    Autocomplete,
    TextField
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import axios from 'axios';

const NewOrderPage = () => {
    const [categories, setCategories] = useState([]); // Categories fetched from API
    const [items, setItems] = useState([]); // Items for the selected category
    const [selectedCategory, setSelectedCategory] = useState(null); // Selected category
    const [cart, setCart] = useState([]); // Cart to store selected items
    const [ingredients, setIngredients] = useState([]); // Global ingredients for add-ons
    const [selectedItem, setSelectedItem] = useState(null); // Track the clicked item
    const [removals, setRemovals] = useState([]); // Removals (selected ingredients to remove)
    const [addOns, setAddOns] = useState([]); // Add-ons (selected global ingredients)
    const [openDialog, setOpenDialog] = useState(false); // State to open/close the modal
    const [error, setError] = useState(''); // Error handling for items
    const [selectedAddOn, setSelectedAddOn] = useState(null); // Store selected add-on for dropdown

    const categoriesRef = useRef(null); // For scrolling the categories
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    // Fetch categories when component mounts
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/Category/GetAllCategories`);
                setCategories(response.data);
                setSelectedCategory(response.data[0]?.Name); // Automatically select the first category
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    // Fetch items based on selected category
    useEffect(() => {
        if (selectedCategory) {
            const fetchItems = async () => {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/Item/GetItemsByCategory/${selectedCategory}`);
                    if (response.data.length === 0) {
                        setError('NO ITEMS');
                        setItems([]);
                    } else {
                        setItems(response.data);
                        setError('');
                    }
                } catch (error) {
                    console.error('Error fetching items:', error);
                    setError('Error fetching items');
                }
            };

            fetchItems();
        }
    }, [selectedCategory]);

    // Fetch all ingredients for the global list (used for Add-ons)
    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/Ingredients/GetAllIngredients`);
                setIngredients(response.data); // Set the global ingredients list
            } catch (error) {
                console.error('Error fetching ingredients:', error);
            }
        };

        fetchIngredients();
    }, []);

    // Handle when an item is clicked
    const handleItemClick = (item) => {
        setSelectedItem(item); // Track the selected item
        setRemovals([]); // Reset removals for the new item
        setAddOns([]); // Reset add-ons for the new item
        setOpenDialog(true); // Open the modal for editing
    };

    // Handle checkbox change for removals
    const handleToggleRemoval = (ingredient) => {
        if (removals.includes(ingredient)) {
            setRemovals(removals.filter((rem) => rem !== ingredient)); // Remove ingredient from removals
        } else {
            setRemovals([...removals, ingredient]); // Add ingredient to removals
        }
    };

    // Handle dropdown selection for add-ons
    const handleAddOnSelection = (event, newValue) => {
        setSelectedAddOn(newValue); // Store selected add-on ingredient
    };

    // Add selected add-on to the list
    const handleAddOn = () => {
        if (selectedAddOn && !addOns.includes(selectedAddOn)) {
            setAddOns([...addOns, selectedAddOn]); // Add the selected add-on
            setSelectedAddOn(null); // Clear the selection after adding
        }
    };

    // Handle saving the updated item to the cart
    const handleSaveItem = () => {
        const updatedItem = {
            ...selectedItem,
            removals,
            addOns,
        };
        setCart([...cart, updatedItem]); // Add the modified item to the cart
        setOpenDialog(false); // Close the modal
    };

    // Handle removing an item from the cart
    const handleRemoveFromCart = (indexToRemove) => {
        setCart((prevCart) => prevCart.filter((_, index) => index !== indexToRemove));
    };

    // Handle category scrolling
    const handleMouseDown = (e) => {
        isDragging.current = true;
        startX.current = e.pageX - categoriesRef.current.offsetLeft;
        scrollLeft.current = categoriesRef.current.scrollLeft;
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        e.preventDefault();
        const x = e.pageX - categoriesRef.current.offsetLeft;
        const walk = (x - startX.current) * 2; // Adjust scroll speed
        categoriesRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ mb: 4 }}>
                Nouvelle Commande
            </Typography>

            <Grid container spacing={4}>
                {/* Left section: Categories and Items */}
                <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Catégories
                        </Typography>
                        <Box
                            ref={categoriesRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            sx={{ display: 'flex', gap: 2, overflowX: 'auto', cursor: 'grab' }}
                        >
                            {categories.map((category) => (
                                <Button
                                    key={category.Name}
                                    variant={selectedCategory === category.Name ? 'contained' : 'outlined'}
                                    onClick={() => setSelectedCategory(category.Name)}
                                >
                                    {category.Name}
                                </Button>
                            ))}
                        </Box>
                    </Box>

                    {/* Items Section */}
                    <Box>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Sélectionner un Article
                        </Typography>
                        {error ? (
                            <Typography variant="body1" color="error">{error}</Typography>
                        ) : (
                            <Grid container spacing={4}>
                                {items.map((item) => (
                                    <Grid item xs={12} sm={6} md={4} key={item.Id}>
                                        <Card
                                            elevation={3}
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => handleItemClick(item)} // Open modal to edit the item
                                        >
                                            <CardContent sx={{ textAlign: 'center' }}>
                                                <Typography variant="h6">{item.Name}</Typography>
                                                <Typography>{item.PriceDineIn} €</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </Grid>

                {/* Right section: Cart */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '10px' }}>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Panier
                        </Typography>

                        {cart.length === 0 ? (
                            <Typography color="textSecondary">Votre panier est vide</Typography>
                        ) : (
                            <List>
                                {cart.map((cartItem, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem
                                            secondaryAction={
                                                <IconButton
                                                    edge="end"
                                                    aria-label="delete"
                                                    onClick={() => handleRemoveFromCart(index)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText
                                                primary={`${cartItem.Name} - ${cartItem.PriceDineIn} €`}
                                                secondary={`Removals: ${cartItem.removals.map(rem => rem.Name).join(', ')} | Add-ons: ${cartItem.addOns.map(addOn => addOn.Name).join(', ')}`}
                                            />
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                ))}
                            </List>
                        )}

                        {cart.length > 0 && (
                            <Button variant="contained" color="primary" fullWidth>
                                Valider la Commande
                            </Button>
                        )}
                    </Box>
                </Grid>
            </Grid>

            {/* Item Editing Modal */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md">
                <DialogTitle>Modifier {selectedItem?.Name}</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="h6">Removals (Ingrédients à supprimer)</Typography>
                    <Box>
                        {selectedItem?.Ingredients?.map((ingredient) => (
                            <FormControlLabel
                                key={ingredient}
                                control={
                                    <Checkbox
                                        checked={removals.includes(ingredient)}
                                        onChange={() => handleToggleRemoval(ingredient)}
                                    />
                                }
                                label={ingredient}
                            />
                        ))}
                    </Box>

                    <Typography variant="h6" sx={{ mt: 4 }}>
                        Add-ons (Ingrédients supplémentaires)
                    </Typography>
                    <Autocomplete
                        value={selectedAddOn}
                        onChange={handleAddOnSelection}
                        options={ingredients}
                        getOptionLabel={(option) => `${option.Name} (+ ${option.Price} €)`}
                        renderInput={(params) => <TextField {...params} label="Ajouter un ingrédient" />}
                    />
                    <Button variant="outlined" color="primary" onClick={handleAddOn} sx={{ mt: 2 }}>
                        Ajouter Add-on
                    </Button>
                    <List>
                        {addOns.map((addOn, index) => (
                            <ListItem key={index}>
                                <ListItemText primary={`${addOn.Name} (+ ${addOn.Price} €)`} />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="secondary">
                        Annuler
                    </Button>
                    <Button onClick={handleSaveItem} variant="contained" color="primary">
                        Sauvegarder
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default NewOrderPage;
