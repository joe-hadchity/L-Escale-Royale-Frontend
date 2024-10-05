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
    CircularProgress,
    TextField
} from '@mui/material';
import { Money, CreditCard, MobileFriendly, Replay } from '@mui/icons-material';
import { Delete, AddCircle, RemoveCircle } from '@mui/icons-material';
import { useOrder } from '../../context/OrderContext';
import { useNavigate } from 'react-router-dom';
import Keyboard from 'react-simple-keyboard';

import PerfectScrollbar from 'react-perfect-scrollbar';
import 'react-perfect-scrollbar/dist/css/styles.css';
import 'react-simple-keyboard/build/css/index.css';

const Order = () => {
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [orderType, setOrderType] = useState('Dine In');
    const [tableNumber, setTableNumber] = useState('');
    const [deliveryLocation, setDeliveryLocation] = useState('');
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
    const [isAccessAllowed, setIsAccessAllowed] = useState(true);
    const [loading, setLoading] = useState(true);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [keyboardField, setKeyboardField] = useState('');

    const [note, setNote] = useState('N/A'); // New state for note
    const [deliveryCharge, setDeliveryCharge] = useState('');
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
            setTableNumber(selectedOrder.TableNumber || ''); // Ensure tableNumber is set correctly
            console.log(selectedOrder)
        } else {
            setCart([]);
        }
    }, [selectedOrder]);

    useEffect(() => {
        const checkLatestGross = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/Gross/GetLatestGross`);
                const latestGross = response.data;

                if (latestGross.Status === "Closed") {
                    toast.error("Access restricted: The latest gross is closed.", {
                        position: "bottom-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                    });
                    setIsAccessAllowed(false);
                } else {
                    setIsAccessAllowed(true);
                }
            } catch (err) {
                console.error('Error checking latest gross:', err);
            } finally {
                setLoading(false);
            }
        };
        checkLatestGross();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/Category/GetAllCategories`);
                setCategories(response.data);
                setSelectedCategory(response.data[0]?.Name);
            } catch (err) {
                console.error('Error fetching categories:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (!selectedCategory) return;

        const fetchItems = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/Item/GetItemsByCategory/${selectedCategory}`);
                setItems(response.data.length === 0 ? [] : response.data);
                setError(response.data.length === 0 ? 'No items found' : '');
            } catch (err) {
                console.error('Error fetching items:', err);
                setError('Error fetching items');
            } finally {
                setLoading(false);
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

    useEffect(() => {
        console.log('Order component re-rendered', { tableNumber });
    }, [tableNumber]);
    
    if (!isAccessAllowed) {
        return (
            <Container>
                <Typography variant="h6" color="error" sx={{ textAlign: 'center', marginTop: 5 }}>
                    Access restricted: The latest gross is closed.
                </Typography>
                <ToastContainer />
            </Container>
        );
    }

    const handleOutsideClick = () => {
        setKeyboardVisible(false);
    }; 
    const handleKeyboardChange = (input) => {
        if (keyboardField === 'location') {
            setDeliveryLocation(input);
        } else if (keyboardField === 'charge') {
            setDeliveryCharge(input);
        }
    };

    const handleOrderTypeChange = (event, newType) => setOrderType(newType);

    const handleTableNumberSelect = (num) => setTableNumber(num);

    const handleQuantityChange = (item, type) => {
        setCart((prevCart) =>
            prevCart.map((cartItem) => {
                // Check if the item matches based on _id, removals, and addOns
                const isSameItem =
                    cartItem._id === item._id &&
                    JSON.stringify(cartItem.removals) === JSON.stringify(item.removals) &&
                    JSON.stringify(cartItem.addOns) === JSON.stringify(item.addOns);
    
                if (isSameItem) {
                    return {
                        ...cartItem,
                        quantity: type === 'increase' ? cartItem.quantity + 1 : Math.max(1, cartItem.quantity - 1), // Prevent quantity from going below 1
                    };
                }
    
                return cartItem; // Return the unchanged item
            })
        );
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
            });
            return;
        }
        setOpenPaymentDialog(true);
    };

    const handleDeliveryLocationChange = (value) => {
        setDeliveryLocation(value);
    };
 const handleNoteChange=(value)=>{
    setNote(value);
 }
    const handlePaymentMethodChange = async (method) => {
        try {
            setPaymentMethod(method);
            
            // Determine status based on method
            let status = 'Pending';
            if (method === 'Pay Later') {
                status = 'Pay Later';
            } else {
                status = 'Done'; // Set status to Done if "Served" is selected
            }
    
            const paymentType = method === 'Proceed' || method === 'Pay Later' ? 'N/A' : method;
    
            // Create payload
            const payload = {
                Status: status,
                PaymentType: paymentType,
                Items: cart.map((item) => ({
                    CategoryName: selectedCategory,
                    Name: item.Name,
                    Description: item.Description || '',
                    PriceDineIn: parseFloat(item.price) || 0.0,
                    PriceDelivery: parseFloat(item.pricedel) || 0.0,
                    Quantity: parseFloat(item.quantity) || 1.0,
                    TypeItem: orderType === 'Dine In' ? 'Dine In' : 'TakeAway',
                    Ingredients: item.Ingredients || [],
                    Removals: item.removals || [],
                    AddOns: item.addOns || [],
                })),
                TableNumber: (tableNumber && !isNaN(tableNumber)) ? tableNumber.toString() : 'N/A',
                DeliveryCharge: orderType === 'Delivery' ? parseFloat(deliveryCharge) : 0.0,
                Location: orderType === 'Delivery' ? deliveryLocation : '',
                Note: note,
            };
    
            if (orderNumber) {
                // Update existing order
                await axios.put(
                    `${process.env.REACT_APP_API_URL}/Order/UpdateOrderByOrderNumber/${orderNumber}`,
                    payload
                );
                console.log("Update: ", payload);
            } else {
                // Create new order
                await axios.post(
                    `${process.env.REACT_APP_API_URL}/Order/CreateOrder`,
                    payload
                );
                console.log("Create: ", payload);
            }
    
            navigate('/staff/dashboard');
            setOpenPaymentDialog(false);
        } catch (error) {
            console.error('Error with payment method:', error);
        }
    };
  
    
    
    
    const handleItemClick = (item) => {
        setSelectedItem({ 
            ...item, 
            quantity: 1,
            TypeItem: orderType
        });
        setRemovals([]);
        setAddOns([]);
        setOpenDialog(true);
    };

    const handleSaveItem = () => {
        const updatedItem = {
            ...selectedItem,
            TypeItem: orderType,
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
            updatedCart[existingItemIndex].quantity += 1; // Increment the quantity by 1
            setCart(updatedCart);
        } else {
            setCart([...cart, { ...updatedItem, quantity: 1 }]); // Start the quantity at 1
        }

        setOpenDialog(false);
    };

    const handleIngredientCategoryChange = (category) => {
        setSelectedIngredientCategory(category);
        const selectedCat = ingredientsCategories.find((cat) => cat.categoryName === category);
        setAvailableIngredients(selectedCat ? selectedCat.ingredients : []);
    };

    const removeFromCart = (itemToRemove) => {
        setCart(
            cart.filter(
                (cartItem) =>
                    cartItem._id !== itemToRemove._id ||
                    JSON.stringify(cartItem.removals) !== JSON.stringify(itemToRemove.removals) ||
                    JSON.stringify(cartItem.addOns) !== JSON.stringify(itemToRemove.addOns)
            )
        );
    };
    
    return (
        <Container maxWidth={false} sx={{ padding: 0, margin: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={0} sx={{ height: '100vh', overflow: 'hidden' }}>
                    {/* Categories Section */}
                    <Grid
  item
  xs={1.5}
  sx={{
    backgroundColor: '#f0f0f0',
    padding: 1,
    boxShadow: 3,
    borderRight: '1px solid #e0e0e0',
  }}
>
  <Typography
    variant="h6"
    sx={{ mb: 1, fontWeight: 'bold', textAlign: 'center' }}
  >
    Categories
  </Typography>
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      overflowY: 'auto',
      height: '90vh',
      // Scrollbar styling
      '&::-webkit-scrollbar': {
        width: '4px',
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: '#f0f0f0',
        borderRadius: '10px',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#c0c0c0',
        borderRadius: '10px',
      },
      '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: '#a0a0a0',
      },
    }}
  >
    {categories.map((category) => (
      <Button
        key={category._id || category.Name}
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
                    <Grid item xs={6.5} sx={{ padding: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
                            <ToggleButtonGroup value={orderType} exclusive onChange={(e, newType) => setOrderType(newType)}>
                                <ToggleButton value="Dine In" sx={{ fontWeight: 'bold' }}>
                                    Dine In
                                </ToggleButton>
                                <ToggleButton value="Takeaway" sx={{ fontWeight: 'bold' }}>
                                    Takeaway
                                </ToggleButton>
                                <ToggleButton value="Delivery" sx={{ fontWeight: 'bold' }}>
                                    Delivery
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                       

                        {orderType === 'Delivery' && (
    <Box sx={{ mb: 2 }}>
        {/* Delivery Location Input */}
        <TextField
            label="Delivery Location and Phone Number"
            fullWidth
            variant="outlined"
            value={deliveryLocation}
            onFocus={() => {
                setKeyboardVisible(true);
                setKeyboardField('location'); // Indicate which field is being edited
            }}
            onChange={(e) => handleDeliveryLocationChange(e.target.value)}
        />
        
        {/* Delivery Charge Input */}
        <TextField
            label="Delivery Charge"
            fullWidth
            variant="outlined"
            value={deliveryCharge}
            onFocus={() => {
                setKeyboardVisible(true);
                setKeyboardField('charge'); // Indicate which field is being edited
            }}
            onChange={(e) => setDeliveryCharge(e.target.value)}
            sx={{ mt: 2 }}
        />

        {/* On-Screen Keyboard */}
        {keyboardVisible && (
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 2500,
                    backgroundColor: 'rgba(0, 0, 0, 0.)',
                }}
                onClick={handleOutsideClick}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        backgroundColor: '#fff',
                        padding: '20px',
                        zIndex: 1600,
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent hiding keyboard when clicking on it
                >
                    <Keyboard
                        onChange={(value) => handleKeyboardChange(value)}
                        onKeyPress={(button) => {
                            if (button === '{enter}') setKeyboardVisible(false);
                        }}
                        theme="hg-theme-default"
                        layoutName="default"
                    />
                </Box>
            </Box>
        )}
    </Box>
)}


                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                            Select an Item
                        </Typography>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                                <CircularProgress />
                            </Box>
                        ) : error ? (
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
                    <React.Fragment key={`cart-item-${cartItem._id || index}`}>
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
                                {/* Display the type of the item (Dine In or TakeAway) */}
                                <Typography variant="body2" color="textSecondary">
                                    Type: {cartItem.TypeItem || orderType}
                                </Typography>
                                <Typography variant="body2">
                                    {orderType === 'Dine In' ? cartItem.price : cartItem.pricedel} CFA x {cartItem.quantity}
                                </Typography>

                                {/* Display Removals */}
                                {cartItem.removals && cartItem.removals.length > 0 && (
                                    <Typography variant="body2" color="error">
                                        Removals: {cartItem.removals.map((rem) => rem.Name).join(', ')}
                                    </Typography>
                                )}

                                {/* Display Add-ons */}
                                {cartItem.addOns && cartItem.addOns.length > 0 && (
                                    <Typography variant="body2" color="primary">
                                        Add-ons: {cartItem.addOns.map((add) => add.Name).join(', ')}
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
            )}
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
                            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 2 }}>
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
                                        label={`${ingredient.Name}: ${ingredient.Price} CFA`}
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
            <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>Sélectionner un Mode de Paiement</DialogTitle>
                <DialogContent dividers>
                    {/* Note Input */}
                    <TextField
                        label="Note"
                        fullWidth
                        variant="outlined"
                        value={note}
                        onFocus={() => handleNoteChange(note)}
                        onChange={(e) => setNote(e.target.value)}
                        sx={{ mb: 2 }}
                    />

                    {/* Payment Method Options */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            sx={{ width: '80%', padding: '12px 24px', fontSize: '16px', fontWeight: 'bold' }}
                            onClick={() => handlePaymentMethodChange('Cash')}
                            startIcon={<Money sx={{ fontSize: 25 }} />}
                        >
                            Payer en Espèces
                        </Button>

                        <Button
                            variant="outlined"
                            color="secondary"
                            sx={{ width: '80%', padding: '12px 24px', fontSize: '16px', fontWeight: 'bold' }}
                            onClick={() => handlePaymentMethodChange('Card')}
                            startIcon={<CreditCard sx={{ fontSize: 25 }} />}
                        >
                            Payer par Carte
                        </Button>

                        <Button
                            variant="outlined"
                            color="success"
                            sx={{ width: '80%', padding: '12px 24px', fontSize: '16px', fontWeight: 'bold' }}
                            onClick={() => handlePaymentMethodChange('Airtel')}
                            startIcon={<MobileFriendly sx={{ fontSize: 25 }} />}
                        >
                            Payer par Airtel
                        </Button>

                        <Button
                            variant="outlined"
                            color="warning"
                            sx={{ width: '80%', padding: '12px 24px', fontSize: '16px', fontWeight: 'bold' }}
                            onClick={() => handlePaymentMethodChange('Pay Later')}
                            startIcon={<Replay sx={{ fontSize: 25 }} />}
                        >
                            Payer plus tard
                        </Button>
                    </Box>
                </DialogContent>

                {/* Cancel Button */}
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        onClick={() => setOpenPaymentDialog(false)}
                        color="inherit"
                        variant="outlined"
                        sx={{ padding: '8px 20px', fontWeight: 'bold' }}
                    >
                        Annuler
                    </Button>
                </DialogActions>
            </Dialog>



        </Container>
    );
};

export default Order;
