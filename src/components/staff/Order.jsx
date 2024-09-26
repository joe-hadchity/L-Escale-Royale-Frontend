import React, { useState, useEffect } from 'react';
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
    Chip,
    ToggleButton,
    ToggleButtonGroup,
    List,
    ListItem,
    IconButton,
    ListItemText,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Badge,
} from '@mui/material';
import { Delete, AddCircle, RemoveCircle } from '@mui/icons-material';
import axios from 'axios';

const NewOrderPage = () => {
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [cart, setCart] = useState([]);
    const [ingredientsCategories, setIngredientsCategories] = useState([]);
    const [availableIngredients, setAvailableIngredients] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [removals, setRemovals] = useState([]);
    const [addOns, setAddOns] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [error, setError] = useState('');
    const [selectedIngredientCategory, setSelectedIngredientCategory] = useState('');
    const [activeTab, setActiveTab] = useState('remove');
    const [orderType, setOrderType] = useState('Dine In'); // Order type (Dine In/Takeaway)

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/Category/GetAllCategories`);
                setCategories(response.data);
                setSelectedCategory(response.data[0]?.Name);
            } catch (error) {
                console.error('Erreur lors de la récupération des catégories:', error);
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
                    setItems(response.data.length === 0 ? [] : response.data);
                    setError(response.data.length === 0 ? 'Aucun article trouvé' : '');
                } catch (error) {
                    console.error('Erreur lors de la récupération des articles:', error);
                    setError('Erreur lors de la récupération des articles');
                }
            };

            fetchItems();
        }
    }, [selectedCategory]);

    // Fetch all ingredients for categories
    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/Ingredients/GetAllIngredients`);
                const parsedIngredients = parseIngredients(response.data);
                setIngredientsCategories(parsedIngredients);
            } catch (error) {
                console.error('Erreur lors de la récupération des ingrédients:', error);
            }
        };

        fetchIngredients();
    }, []);

    // Parse ingredients into flattened array
    const parseIngredients = (data) => {
        return data.map((categoryObj, index) => {
            const categoryName = Object.keys(categoryObj).find((key) => key !== '_id');
            return {
                categoryName: categoryName,
                ingredients: categoryObj[categoryName] || []
            };
        });
    };

    // Handle item click
    const handleItemClick = (item) => {
        setSelectedItem({ ...item, quantity: 1 }); // Default quantity set to 1
        setRemovals([]);
        setAddOns([]);
        setOpenDialog(true);
    };

    // Handle saving the updated item to the cart
    const handleSaveItem = () => {
        const updatedItem = {
            ...selectedItem,
            removals,
            addOns,
        };
        setCart([...cart, updatedItem]);
        setOpenDialog(false);
    };

    // Handle ingredient category change
    const handleIngredientCategoryChange = (category) => {
        setSelectedIngredientCategory(category);
        const selectedCategory = ingredientsCategories.find((cat) => cat.categoryName === category);
        setAvailableIngredients(selectedCategory ? selectedCategory.ingredients : []);
    };

    // Handle order type change (Dine In/Takeaway)
    const handleOrderTypeChange = (event) => {
        setOrderType(event.target.value);
    };

    // Handle quantity change
    const handleQuantityChange = (item, type) => {
        setCart(cart.map(cartItem => 
            cartItem._id === item._id
                ? { ...cartItem, quantity: type === 'increase' ? cartItem.quantity + 1 : cartItem.quantity - 1 }
                : cartItem
        ));
    };

    // Toggle for removing ingredients
    const toggleRemoveIngredient = (ingredient) => {
        setRemovals((prev) =>
            prev.includes(ingredient) ? prev.filter((rem) => rem !== ingredient) : [...prev, ingredient]
        );
    };

    // Toggle for adding ingredients
    const toggleAddIngredient = (ingredient) => {
        setAddOns((prev) =>
            prev.includes(ingredient) ? prev.filter((add) => add !== ingredient) : [...prev, ingredient]
        );
    };

    // Calculate item price based on order type
    const calculateItemPrice = (item) => {
        return orderType === 'Dine In' ? item.price : item.pricedel;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
                Nouvelle Commande
            </Typography>

            {/* Order Type Selection */}
            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Type de commande</InputLabel>
                <Select value={orderType} onChange={handleOrderTypeChange}>
                    <MenuItem value="Dine In">Sur place</MenuItem>
                    <MenuItem value="Takeaway">À emporter</MenuItem>
                </Select>
            </FormControl>

            <Grid container spacing={4}>
                {/* Left section: Categories and Items */}
                <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                            Catégories
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, overflow: 'auto', cursor: 'grab', whiteSpace: 'nowrap' }}>
                            {categories.map((category) => (
                                <Button
                                    key={category.Name}
                                    variant={selectedCategory === category.Name ? 'contained' : 'outlined'}
                                    onClick={() => setSelectedCategory(category.Name)}
                                    sx={{ padding: '16px', minWidth: '140px', fontSize: '16px', fontWeight: '600', borderRadius: '10px' }}
                                >
                                    {category.Name}
                                </Button>
                            ))}
                        </Box>
                    </Box>

                    {/* Items Section */}
                    <Box>
                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                            Sélectionner un Article
                        </Typography>
                        {error ? (
                            <Typography variant="body1" color="error">{error}</Typography>
                        ) : (
                            <Grid container spacing={3}>
                                {items.map((item) => (
                                    <Grid item xs={12} sm={6} md={4} key={item._id}>
                                        <Card
                                            elevation={3}
                                            sx={{ cursor: 'pointer', padding: '20px', borderRadius: '15px' }}
                                            onClick={() => handleItemClick(item)}
                                        >
                                            <CardContent sx={{ textAlign: 'center' }}>
                                                <Typography variant="h6" sx={{ fontWeight: '600' }}>{item.Name}</Typography>
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
                    <Box sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: '15px', backgroundColor: '#f9f9f9' }}>
                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                            Panier
                        </Typography>

                        {cart.length === 0 ? (
                            <Typography color="textSecondary">Votre panier est vide</Typography>
                        ) : (
                            // Make the cart items scrollable
                            <Box sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <List>
                                    {cart.map((cartItem, index) => (
                                        <React.Fragment key={index}>
                                            <ListItem
                                                secondaryAction={
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="delete"
                                                        onClick={() => setCart(cart.filter((_, idx) => idx !== index))}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                }
                                                sx={{ alignItems: 'flex-start', marginBottom: 2 }}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                            {cartItem.Name} - {calculateItemPrice(cartItem)} € x {cartItem.quantity}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <>
                                                            {cartItem.removals.length > 0 && (
                                                                <Typography variant="body2" color="textSecondary">
                                                                    <strong>Retirés:</strong> {cartItem.removals.map(rem => rem.Name).join(', ')}
                                                                </Typography>
                                                            )}
                                                            {cartItem.addOns.length > 0 && (
                                                                <Typography variant="body2" color="textSecondary">
                                                                    <strong>Ajouts:</strong> {cartItem.addOns.map(addOn => addOn.Name).join(', ')}
                                                                </Typography>
                                                            )}
                                                            {/* Quantity Controls */}
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                                <IconButton
                                                                    aria-label="decrease"
                                                                    onClick={() => handleQuantityChange(cartItem, 'decrease')}
                                                                    disabled={cartItem.quantity <= 1}
                                                                >
                                                                    <RemoveCircle />
                                                                </IconButton>
                                                                <Typography variant="body1" sx={{ mx: 1 }}>{cartItem.quantity}</Typography>
                                                                <IconButton
                                                                    aria-label="increase"
                                                                    onClick={() => handleQuantityChange(cartItem, 'increase')}
                                                                >
                                                                    <AddCircle />
                                                                </IconButton>
                                                            </Box>
                                                        </>
                                                    }
                                                />
                                            </ListItem>
                                            <Divider />
                                        </React.Fragment>
                                    ))}
                                </List>
                            </Box>
                        )}

                        {cart.length > 0 && (
                            <Button variant="contained" color="primary" fullWidth sx={{ padding: '16px', mt: 3, fontWeight: 'bold' }}>
                                VALIDER LA COMMANDE
                            </Button>
                        )}
                    </Box>
                </Grid>
            </Grid>

            {/* Item Editing Modal */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md">
                <DialogTitle>Modifier {selectedItem?.Name}</DialogTitle>
                <DialogContent dividers>
                    {/* Tabs for Retirer and Ajouter */}
                    <ToggleButtonGroup
                        value={activeTab}
                        exclusive
                        onChange={(e, newTab) => setActiveTab(newTab)}
                        sx={{ mb: 3 }}
                    >
                        <ToggleButton value="remove" sx={{ fontWeight: 'bold' }}>Retirer</ToggleButton>
                        <ToggleButton value="add" sx={{ fontWeight: 'bold' }}>Ajouter</ToggleButton>
                    </ToggleButtonGroup>

                    {activeTab === 'remove' && (
                        <Box>
                            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>Retirer</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                {selectedItem?.Ingredients?.map((ingredient, index) => (
                                    <Chip
                                        key={index}
                                        label={ingredient.Name}
                                        color={removals.includes(ingredient) ? 'error' : 'default'}
                                        onClick={() => toggleRemoveIngredient(ingredient)}
                                        sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {activeTab === 'add' && (
                        <Box>
                            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>Catégories d'ingrédients</Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 2, overflow: 'auto' }}>
                                {ingredientsCategories.map((category, index) => (
                                    <Button
                                        key={index}
                                        variant={selectedIngredientCategory === category.categoryName ? 'contained' : 'outlined'}
                                        onClick={() => handleIngredientCategoryChange(category.categoryName)}
                                        sx={{ minWidth: '100px', fontWeight: 'bold' }}
                                    >
                                        {category.categoryName}
                                    </Button>
                                ))}
                            </Box>

                            {selectedIngredientCategory && (
                                <>
                                    <Typography variant="h6" sx={{ mt: 3, fontWeight: 'bold' }}>Ingrédients</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                        {availableIngredients.map((ingredient, index) => (
                                            <Chip
                                                key={index}
                                                label={`${ingredient.Name} - ${ingredient.Price} €`}
                                                color={addOns.includes(ingredient) ? 'primary' : 'default'}
                                                onClick={() => toggleAddIngredient(ingredient)}
                                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                            />
                                        ))}
                                    </Box>
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="secondary" sx={{ fontWeight: 'bold' }}>
                        Annuler
                    </Button>
                    <Button onClick={handleSaveItem} variant="contained" color="primary" sx={{ fontWeight: 'bold' }}>
                        Sauvegarder
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default NewOrderPage;
