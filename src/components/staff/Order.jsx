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
    Divider
} from '@mui/material';
import { Money, CreditCard, MobileFriendly, Replay } from '@mui/icons-material';
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
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
    const [error, setError] = useState('');
    const [selectedIngredientCategory, setSelectedIngredientCategory] = useState('');
    const [activeTab, setActiveTab] = useState('remove');
    const [orderType, setOrderType] = useState('Dine In');
    const [tableNumber, setTableNumber] = useState('');
    const [orderNumber, setOrderNumber] = useState(1001);
    const [paymentMethod, setPaymentMethod] = useState('');

    const tableNumbers = Array.from({ length: 20 }, (_, i) => i + 1);

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

    const parseIngredients = (data) => {
        return data.map((categoryObj) => {
            const categoryName = Object.keys(categoryObj).find((key) => key !== '_id');
            return {
                categoryName: categoryName,
                ingredients: categoryObj[categoryName] || [],
            };
        });
    };

    const handleItemClick = (item) => {
        setSelectedItem({ ...item, quantity: 1 });
        setRemovals([]);
        setAddOns([]);
        setOpenDialog(true);
    };

    const areItemsEqual = (item1, item2) => {
        return (
            item1._id === item2._id &&
            JSON.stringify(item1.removals) === JSON.stringify(item2.removals) &&
            JSON.stringify(item1.addOns) === JSON.stringify(item2.addOns)
        );
    };

    const handleSaveItem = () => {
        const updatedItem = {
            ...selectedItem,
            removals,
            addOns,
        };
        const existingItemIndex = cart.findIndex(cartItem => areItemsEqual(cartItem, updatedItem));

        if (existingItemIndex > -1) {
            const updatedCart = [...cart];
            updatedCart[existingItemIndex].quantity += 1;
            setCart(updatedCart);
        } else {
            setCart([...cart, updatedItem]);
        }

        setOpenDialog(false);
    };

    const handleIngredientCategoryChange = (category) => {
        setSelectedIngredientCategory(category);
        const selectedCategory = ingredientsCategories.find((cat) => cat.categoryName === category);
        setAvailableIngredients(selectedCategory ? selectedCategory.ingredients : []);
    };

    const handleOrderTypeChange = (event, newType) => {
        setOrderType(newType);
    };

    const handleTableNumberSelect = (num) => {
        setTableNumber(num);
    };

    const handleQuantityChange = (item, type) => {
        setCart(cart.map(cartItem =>
            cartItem._id === item._id
                ? { ...cartItem, quantity: type === 'increase' ? cartItem.quantity + 1 : cartItem.quantity - 1 }
                : cartItem
        ));
    };

    const toggleRemoveIngredient = (ingredient) => {
        setRemovals((prev) =>
            prev.includes(ingredient) ? prev.filter((rem) => rem !== ingredient) : [...prev, ingredient]
        );
    };

    const toggleAddIngredient = (ingredient) => {
        setAddOns((prev) =>
            prev.includes(ingredient) ? prev.filter((add) => add !== ingredient) : [...prev, ingredient]
        );
    };

    const calculateItemPrice = (item) => {
        return orderType === 'Dine In' ? item.price : item.pricedel;
    };

    const handleValidateOrder = () => {
        if (orderType === 'Dine In') {
            // If the order is Dine In, submit the order directly without payment
            submitOrder();
        } else {
            // If the order is for Takeaway, open the payment dialog
            setOpenPaymentDialog(true);
        }
    };

    const submitOrder = () => {
        // Handle the logic for submitting the order
        console.log('Order submitted:', cart, orderType, tableNumber);
        // Here you would send the order to the backend or handle it accordingly
        // Clear cart or navigate to a different page as needed
        setCart([]);
        // Optionally reset table number and payment method
        setTableNumber('');
        setPaymentMethod('');
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        // Submit the order after selecting a payment method
        submitOrder();
        setOpenPaymentDialog(false);
    };

    return (
        <Container maxWidth="xl" sx={{ padding: 0, margin: 0 }}>
            <Grid container spacing={1} sx={{ height: '100vh', overflow: 'hidden' }}>
                {/* Categories Section */}
                <Grid item xs={2} sx={{ backgroundColor: '#f0f0f0', padding: 1, boxShadow: 3, borderRight: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center' }}>
                        Catégories
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', height: '90vh' }}>
                        {categories.map((category) => (
                            <Button
                                key={category.Name}
                                variant={selectedCategory === category.Name ? 'contained' : 'outlined'}
                                onClick={() => setSelectedCategory(category.Name)}
                                fullWidth
                                sx={{
                                    padding: '10px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    borderRadius: '8px',
                                }}
                            >
                                {category.Name}
                            </Button>
                        ))}
                    </Box>
                </Grid>

                {/* Items Section */}
                <Grid item xs={6} sx={{ padding: 1 }}>
                    <Typography variant="h6" sx={{ mb: 1, textAlign: 'center', fontWeight: 'bold' }}>
                        Nouvelle Commande - N°{orderNumber}
                    </Typography>
                    {/* Order Type Selection */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
                        <ToggleButtonGroup
                            value={orderType}
                            exclusive
                            onChange={handleOrderTypeChange}
                        >
                            <ToggleButton value="Dine In" sx={{ fontWeight: 'bold' }}>
                                Sur Place
                            </ToggleButton>
                            <ToggleButton value="Takeaway" sx={{ fontWeight: 'bold' }}>
                                À Emporter
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {/* Table Number Selection */}
                    {orderType === 'Dine In' && (
                        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', mb: 2, padding: '4px', justifyContent: 'center' }}>
                            {tableNumbers.map((num) => (
                                <Button
                                    key={num}
                                    variant={tableNumber === num ? 'contained' : 'outlined'}
                                    onClick={() => handleTableNumberSelect(num)}
                                    sx={{ minWidth: '50px', fontSize: '12px', padding: '6px' }}
                                >
                                    {num}
                                </Button>
                            ))}
                        </Box>
                    )}

                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Sélectionner un Article
                    </Typography>
                    {error ? (
                        <Typography variant="body1" color="error" textAlign="center">{error}</Typography>
                    ) : (
                        <Grid container spacing={1} sx={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
                            {items.map((item) => (
                                <Grid item xs={3} key={item._id}>
                                    <Card
                                        elevation={3}
                                        sx={{ cursor: 'pointer', padding: '8px', borderRadius: '8px' }}
                                        onClick={() => handleItemClick(item)}
                                    >
                                        <CardContent sx={{ textAlign: 'center', padding: '6px' }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: '600' }}>
                                                {item.Name}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {calculateItemPrice(item)} CFA
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Grid>

                {/* Cart Section */}
                <Grid item xs={4} sx={{ backgroundColor: '#f0f0f0', padding: 1, boxShadow: 3, borderLeft: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center' }}>
                        Panier
                    </Typography>
                    {cart.length === 0 ? (
                        <Typography color="textSecondary" textAlign="center">
                            Votre panier est vide
                        </Typography>
                    ) : (
                        <Box sx={{ maxHeight: '75vh', overflowY: 'auto', padding: '8px' }}>
                            <List dense>
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
                                            sx={{ alignItems: 'flex-start', marginBottom: 1, borderBottom: '1px solid #e0e0e0' }}
                                        >
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                    {cartItem.Name}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {calculateItemPrice(cartItem)} CFA x {cartItem.quantity}
                                                </Typography>
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
                                            </Box>
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
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                ))}
                            </List>
                        </Box>
                    )}
                    {cart.length > 0 && (
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ padding: '10px', mt: 2, fontWeight: 'bold' }}
                            onClick={handleValidateOrder}
                        >
                            VALIDER LA COMMANDE
                        </Button>
                    )}
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
                                                label={`${ingredient.Name} - ${ingredient.Price} CFA`}
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

            {/* Payment Selection Modal */}
            <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Sélectionner le Mode de Paiement
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, padding: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ padding: '20px', fontSize: '18px', fontWeight: 'bold', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                            onClick={() => handlePaymentMethodChange('Cash')}
                            startIcon={<Money sx={{ fontSize: 30, marginRight: '10px' }} />}
                        >
                            Cash
                        </Button>

                        <Button
                            variant="contained"
                            color="secondary"
                            sx={{ padding: '20px', fontSize: '18px', fontWeight: 'bold', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                            onClick={() => handlePaymentMethodChange('Card')}
                            startIcon={<CreditCard sx={{ fontSize: 30, marginRight: '10px' }} />}
                        >
                            Carte
                        </Button>

                        <Button
                            variant="contained"
                            color="success"
                            sx={{ padding: '20px', fontSize: '18px', fontWeight: 'bold', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                            onClick={() => handlePaymentMethodChange('Airtel')}
                            startIcon={<MobileFriendly sx={{ fontSize: 30, marginRight: '10px' }} />}
                        >
                            Airtel
                        </Button>

                        <Button
                            variant="contained"
                            color="warning"
                            sx={{ padding: '20px', fontSize: '18px', fontWeight: 'bold', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
                            onClick={() => handlePaymentMethodChange('Retour')}
                            startIcon={<Replay sx={{ fontSize: 30, marginRight: '10px' }} />}
                        >
                            Retour
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setOpenPaymentDialog(false)}
                        color="secondary"
                        sx={{ fontWeight: 'bold', padding: '12px 20px', minWidth: '120px' }}
                    >
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ fontWeight: 'bold', padding: '12px 20px', minWidth: '120px' }}
                        onClick={() => handlePaymentMethodChange(paymentMethod)}
                    >
                        Confirmer le Paiement
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default NewOrderPage;
