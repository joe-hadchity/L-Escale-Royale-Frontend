import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
    Divider,
} from '@mui/material';
import { Money, CreditCard, MobileFriendly, Replay } from '@mui/icons-material';
import { Delete, AddCircle, RemoveCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';

const Order = () => {
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [orderType, setOrderType] = useState('Dine In');
    const [tableNumber, setTableNumber] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
    const [ingredientsCategories, setIngredientsCategories] = useState([]);
    const [availableIngredients, setAvailableIngredients] = useState([]);
    const [removals, setRemovals] = useState([]);
    const [addOns, setAddOns] = useState([]);
    const [activeTab, setActiveTab] = useState('remove');
    const [error, setError] = useState('');
    const [selectedIngredientCategory, setSelectedIngredientCategory] = useState('');

    const navigate = useNavigate();
    const tableNumbers = Array.from({ length: 20 }, (_, i) => i + 1);
    const { selectedOrder, setSelectedOrder } = useOrder();
    const location = useLocation();
    const [orderNumber, setOrderNumber] = useState(null);

    useEffect(() => {
        if (location.state && location.state.orderNumber) {
            setOrderNumber(location.state.orderNumber);
        }
    }, [location.state]);
    // Populate cart with selectedOrder items when component mounts
    useEffect(() => {
        if (selectedOrder && selectedOrder.Items) {
            const itemsToCart = selectedOrder.Items.map((item) => ({
                _id: item._id,
                Name: item.Name,
                price: item.PriceDineIn,
                pricedel: item.PriceDelivery,
                quantity: item.Quantity,
                removals: item.Removals,
                addOns: item.AddOns,
            }));
            setCart(itemsToCart);
            setOrderType(selectedOrder.Type);
            setTableNumber(selectedOrder.TableNumber);
        } else {
            // Clear the cart if no order is selected
            setCart([]);
        }
    }, [selectedOrder]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/Category/GetAllCategories`);
                setCategories(response.data);
                setSelectedCategory(response.data[0]?.Name);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (!selectedCategory) return;

        const fetchItems = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/Item/GetItemsByCategory/${selectedCategory}`);
                setItems(response.data.length === 0 ? [] : response.data);
                setError(response.data.length === 0 ? 'No items found' : '');
            } catch (err) {
                console.error('Error fetching items:', err);
                setError('Error fetching items');
            }
        };
        fetchItems();
    }, [selectedCategory]);

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/Ingredients/GetAllIngredients`);
                const parsedIngredients = response.data.map((categoryObj) => {
                    const categoryName = Object.keys(categoryObj).find((key) => key !== '_id');
                    return {
                        categoryName,
                        ingredients: categoryObj[categoryName] || [],
                    };
                });
                setIngredientsCategories(parsedIngredients);
            } catch (err) {
                console.error('Error fetching ingredients:', err);
            }
        };
        fetchIngredients();
    }, []);

    const handleItemClick = (item) => {
        setSelectedItem({ ...item, quantity: 1 });
        setRemovals([]); // Reset removals for each item
        setAddOns([]); // Reset add-ons for each item
        setOpenDialog(true);
    };

    const handleSaveItem = () => {
        const updatedItem = {
            ...selectedItem,
            removals,
            addOns,
        };

        const existingItemIndex = cart.findIndex(
            (cartItem) =>
                cartItem._id === updatedItem._id &&
                JSON.stringify(cartItem.removals) === JSON.stringify(updatedItem.removals) &&
                JSON.stringify(cartItem.addOns) === JSON.stringify(updatedItem.addOns)
        );

        if (existingItemIndex > -1) {
            const updatedCart = [...cart];
            updatedCart[existingItemIndex].quantity += 1;
            setCart(updatedCart);
        } else {
            setCart([...cart, updatedItem]);
        }

        console.log('Item saved to cart:', updatedItem);
        setOpenDialog(false);
    };

    const handleAddItemToOrder = async (item) => {
        try {
            const newItem = {
                Name: item.Name,
                Quantity: item.quantity,
                TypeItem: orderType === 'Dine In' ? 'Dine In' : 'TakeAway',
                PriceDineIn: item.price || 0,
                PriceDelivery: item.pricedel || 0,
                AddOns: item.addOns || [],
                Removals: item.removals || [],
            };

            // Send a PUT request to add the item to the existing order
            await axios.put(
                `${process.env.REACT_APP_API_URL}/Order/AddAnItem/${orderNumber}`,
                newItem
            );

            console.log('Item added to order:', newItem);
        } catch (error) {
            console.error('Error adding item to order:', error);
        }
    };

    const handleIngredientCategoryChange = (category) => {
        setSelectedIngredientCategory(category);
        const selectedCat = ingredientsCategories.find((cat) => cat.categoryName === category);
        setAvailableIngredients(selectedCat ? selectedCat.ingredients : []);
    };

    const handleOrderTypeChange = (event, newType) => setOrderType(newType);

    const handleTableNumberSelect = (num) => setTableNumber(num);

    const handleQuantityChange = (item, type) => {
        setCart(
            cart.map((cartItem) =>
                cartItem._id === item._id
                    ? { ...cartItem, quantity: type === 'increase' ? cartItem.quantity + 1 : cartItem.quantity - 1 }
                    : cartItem
            )
        );
    };

    const toggleRemoveIngredient = (ingredient) => {
        setRemovals((prev) =>
            prev.includes(ingredient) ? prev.filter((rem) => rem !== ingredient) : [...prev, ingredient]
        );
        console.log('Removals:', removals);
    };

    const toggleAddIngredient = (ingredient) => {
        setAddOns((prev) =>
            prev.includes(ingredient) ? prev.filter((add) => add !== ingredient) : [...prev, ingredient]
        );
        console.log('Add-ons:', addOns);
    };

    const calculateItemPrice = (item) => (orderType === 'Dine In' ? item.price : item.pricedel);

    const handleValidateOrder = () => {
        if (orderType === 'Dine In' && !tableNumber) {
            toast.warn('Please select a table number for Dine In orders.', {
                position: "bottom-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }
        setOpenPaymentDialog(true);
    };
    const submitOrder = async (status) => {
        // Construct the validatedItems payload for the order
        const validatedItems = cart
            .filter((item) => item.Name && item.CategoryName) // Ensure only items with valid names and categories are included
            .map((item) => ({
                CategoryName: item.CategoryName || 'Unknown Category',
                Name: item.Name || 'Unknown Item',
                Description: item.Description || 'No description',
                PriceDineIn: item.price || 0,
                PriceDelivery: item.pricedel || 0,
                Quantity: item.quantity || 1,
                TypeItem: orderType === 'Sur place' ? 'Dine In' : 'TakeAway',
                Rating: item.Rating || 0,
                Ingredients: item.Ingredients ? item.Ingredients.map((ing) => ing.Name) : [],
                Removals: item.removals ? item.removals.map((rem) => ({ Name: rem.Name, Price: rem.Price || 0 })) : [],
                AddOns: item.addOns ? item.addOns.map((addOn) => ({ Name: addOn.Name, Price: addOn.Price || 0 })) : [],
            }));
    
        // Make sure there are valid items to submit
        if (validatedItems.length === 0) {
            console.warn('No valid items to submit in the order.');
            return; // Exit the function early if there are no valid items
        }
    
        try {
            if (orderNumber) {
                // If `orderNumber` exists, update the existing order by adding new items
                const response = await axios.put(
                    `${process.env.REACT_APP_API_URL}/Order/AddAnItem/${orderNumber}`,
                    { Items: validatedItems } // Ensure the payload has only the `Items` key
                );
                console.log('Order updated successfully:', response.data);
            } else {
                // Create the order payload for new orders
                const orderPayload = {
                    Type: orderType || 'Sur place',
                    Status: status || 'Pending',
                    Items: validatedItems,
                    TableNumber: orderType === 'Sur place' ? (tableNumber || '1') : null,
                    DeleiveryCharge: orderType === 'À emporter' ? 2.5 : 0,
                    Location: orderType === 'À emporter' ? '123 Main St, Cityville' : 'Restaurant',
                };
    
                console.log('Order to be submitted:', JSON.stringify(orderPayload, null, 2));
    
                // Create a new order if `orderNumber` is not defined
                const response = await axios.post(
                    `${process.env.REACT_APP_API_URL}/Order/CreateOrder`,
                    orderPayload
                );
                console.log('Order created successfully:', response.data);
                setOrderNumber(response.data.OrderNumber); // Set the new order number
            }
    
            // Clear cart, table number, and payment method after submission
            setCart([]);
            setTableNumber('');
            setPaymentMethod('');
        } catch (err) {
            console.error('Error creating/updating order:', err);
            if (err.response) {
                console.error('Response data:', err.response.data);
                console.error('Response status:', err.response.status);
            }
        }
    };
    
    
    

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        const status = method === 'Pay Later' ? 'Pending' : 'Done';
        submitOrder(status);
        setOpenPaymentDialog(false);
    };

    const removeFromCart = (itemToRemove) => setCart(cart.filter(cartItem => cartItem._id !== itemToRemove._id));

    return (
        <Container maxWidth={false} sx={{ padding: 0, margin: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <Grid container spacing={1} sx={{ height: '100vh', overflow: 'hidden' }}>
                {/* Slimmer Categories Section */}
                <Grid item xs={1.5} sx={{ backgroundColor: '#f0f0f0', padding: 1, boxShadow: 3, borderRight: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center' }}>
                        Categories
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', height: '90vh' }}>
                        {categories.map((category) => (
                            <Button
                                key={category._id || category.Name}
                                variant={selectedCategory === category.Name ? 'contained' : 'outlined'}
                                onClick={() => setSelectedCategory(category.Name)}
                                fullWidth
                                sx={{ padding: '10px', fontSize: '14px', fontWeight: '500', borderRadius: '8px' }}
                            >
                                {category.Name}
                            </Button>
                        ))}
                    </Box>
                </Grid>

                {/* Items Section */}
                <Grid item xs={6.5} sx={{ padding: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
                        <ToggleButtonGroup value={orderType} exclusive onChange={handleOrderTypeChange}>
                            <ToggleButton value="Dine In" sx={{ fontWeight: 'bold' }}>
                                Dine In
                            </ToggleButton>
                            <ToggleButton value="Takeaway" sx={{ fontWeight: 'bold' }}>
                                Takeaway
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>

                    {/* Table Number Selection */}
                    {orderType === 'Dine In' && (
                        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', mb: 2, padding: '4px', justifyContent: 'center' }}>
                            {tableNumbers.map((num) => (
                                <Button
                                    key={`table-${num}`}
                                    variant={tableNumber === num ? 'contained' : 'outlined'}
                                    onClick={() => handleTableNumberSelect(num)}
                                    sx={{ minWidth: '40px', fontSize: '12px', padding: '6px 8px' }}
                                >
                                    {num}
                                </Button>
                            ))}
                        </Box>
                    )}

                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Select an Item
                    </Typography>
                    {error ? (
                        <Typography variant="body1" color="error" textAlign="center">
                            {error}
                        </Typography>
                    ) : (
                        <Grid container spacing={1} sx={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
                            {items.map((item) => (
                                <Grid item xs={2.4} key={item._id}>
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
                <Grid item xs={4} sx={{ backgroundColor: '#f0f0f0', padding: 2, boxShadow: 3, borderLeft: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center' }}>
                        Cart
                    </Typography>

                    {/* Order Information */}
                    <Box sx={{ marginBottom: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1rem', mb: 1 }}>
                            Order N°{orderNumber}
                        </Typography>
                        {orderType === 'Dine In' && (
                            <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1rem' }}>
                                Table: {tableNumber}
                            </Typography>
                        )}
                    </Box>

                    {cart.length === 0 ? (
                        <Typography color="textSecondary" textAlign="center">
                            Your cart is empty
                        </Typography>
                    ) : (
                        <Box sx={{ maxHeight: '65vh', overflowY: 'auto', padding: '8px' }}>
                            <List dense>
                                {cart.map((cartItem, index) => (
                                    <React.Fragment key={`cart-${cartItem._id}-${index}`}>
                                        <ListItem
                                            secondaryAction={
                                                <IconButton edge="end" aria-label="delete" onClick={() => removeFromCart(cartItem)}>
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
                                                    {orderType === 'Dine In' ? cartItem.price : cartItem.pricedel} CFA x {cartItem.quantity}
                                                </Typography>
                                                
                                                {/* Display Removals */}
                                                {cartItem.removals && cartItem.removals.length > 0 && (
                                                    <Typography variant="body2" color="error">
                                                        Removals: {cartItem.removals.map(rem => rem.Name).join(', ')}
                                                    </Typography>
                                                )}

                                                {/* Display Add-ons */}
                                                {cartItem.addOns && cartItem.addOns.length > 0 && (
                                                    <Typography variant="body2" color="primary">
                                                        Add-ons: {cartItem.addOns.map(add => add.Name).join(', ')}
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
                                                <Typography variant="body1" sx={{ mx: 1 }}>
                                                    {cartItem.quantity}
                                                </Typography>
                                                <IconButton aria-label="increase" onClick={() => handleQuantityChange(cartItem, 'increase')}>
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
                            sx={{ padding: '15px', mt: 3, fontWeight: 'bold', position: 'sticky', bottom: 0 }}
                            onClick={handleValidateOrder}
                        >
                            Place Order
                        </Button>
                    )}
                </Grid>
            </Grid>

            {/* Item Editing Modal */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md">
                <DialogTitle>Edit {selectedItem?.Name}</DialogTitle>
                <DialogContent dividers>
                    <ToggleButtonGroup
                        value={activeTab}
                        exclusive
                        onChange={(e, newTab) => setActiveTab(newTab)}
                        sx={{ mb: 3 }}
                    >
                        <ToggleButton value="remove" sx={{ fontWeight: 'bold' }}>
                            Remove
                        </ToggleButton>
                        <ToggleButton value="add" sx={{ fontWeight: 'bold' }}>
                            Add
                        </ToggleButton>
                    </ToggleButtonGroup>

                    {activeTab === 'remove' && (
                        <Box>
                            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                                Remove Ingredients
                            </Typography>
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
                            <Typography variant="h6" sx={{ mt: 2, fontWeight: 'bold' }}>
                                Add Ingredients
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                {ingredientsCategories.map((cat, index) => (
                                    <Button
                                        key={index}
                                        variant="outlined"
                                        onClick={() => handleIngredientCategoryChange(cat.categoryName)}
                                        sx={{ fontWeight: 'bold' }}
                                    >
                                        {cat.categoryName}
                                    </Button>
                                ))}
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                {availableIngredients.map((ingredient, index) => (
                                    <Chip
                                        key={index}
                                        label={ingredient.Name}
                                        color={addOns.includes(ingredient) ? 'primary' : 'default'}
                                        onClick={() => toggleAddIngredient(ingredient)}
                                        sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="secondary" sx={{ fontWeight: 'bold' }}>
                        Cancel
                    </Button>
                    <Button onClick={handleSaveItem} variant="contained" color="primary" sx={{ fontWeight: 'bold' }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Payment Selection Modal */}
            <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>Select Payment Method</DialogTitle>
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
                            Card
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
                            onClick={() => handlePaymentMethodChange('Pay Later')}
                            startIcon={<Replay sx={{ fontSize: 30, marginRight: '10px' }} />}
                        >
                            Pay Later
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPaymentDialog(false)} color="secondary" sx={{ fontWeight: 'bold' }}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Order;
