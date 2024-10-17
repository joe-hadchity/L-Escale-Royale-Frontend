// Order.jsx

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Container,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import CategoryList from './components/CategoryList';
import ItemList from './components/ItemList';
import Cart from './components/Cart';
import ItemModal from './components/ItemModal';
import PaymentDialog from './components/PaymentDialog';
import CashPaymentDialog from './components/CashPaymentDialog';
import DiscountDialog from './components/DiscountDialog';
import AuthorizationDialog from './components/AuthorizationDialog';

import { useOrder } from '../../context/OrderContext';

const Order = () => {
  // Get selectedOrder from context
  const { selectedOrder } = useOrder();
  const navigate = useNavigate();

  // Initialize orderType based on selectedOrder.Type
  const [orderType, setOrderType] = useState(selectedOrder?.Type || 'Dine In');
  const [orderNumber, setOrderNumber] = useState(
    selectedOrder?.OrderNumber || null
  );
  const [tableNumber, setTableNumber] = useState(
    selectedOrder?.TableNumber || ''
  );

  // Other state variables
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [items, setItems] = useState([]);

  // Initialize cart with existing order items, marking them as existing items
  const [cart, setCart] = useState(
    selectedOrder?.Items
      ? selectedOrder.Items.map((item) => ({ ...item, isExistingItem: true }))
      : []
  );

  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [removals, setRemovals] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [ingredientsCategories, setIngredientsCategories] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [selectedIngredientCategory, setSelectedIngredientCategory] =
    useState('');
  const [note, setNote] = useState(''); // State for item note
  const [isOnTheHouse, setIsOnTheHouse] = useState(false); // State for "On the House"

  const [paymentMethod, setPaymentMethod] = useState('');
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openCashPaymentDialog, setOpenCashPaymentDialog] = useState(false);
  const [openDiscountDialog, setOpenDiscountDialog] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [amountPaidStr, setAmountPaidStr] = useState('');
  const [changeDue, setChangeDue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for Authorization Dialog
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'delete'
  const [pendingItem, setPendingItem] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/Category/GetAllCategories`
        );
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

  // Fetch items based on selected category
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/Item/GetItemsByCategory/${selectedCategory}`
        );

        // Map items to include CategoryName and CategoryLocation
        const itemsWithCategoryData = response.data.map((item) => ({
          ...item,
          CategoryName: selectedCategory,
          CategoryLocation:
            categories.find((cat) => cat.Name === selectedCategory)
              ?.Location || 'No Kitchen',
        }));

        setItems(
          itemsWithCategoryData.length === 0 ? [] : itemsWithCategoryData
        );
        setError(itemsWithCategoryData.length === 0 ? 'No items found' : '');
      } catch (err) {
        console.error('Error fetching items:', err);
        setError('Error fetching items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [selectedCategory, categories]);

  // Fetch ingredients
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/Ingredients/GetAllIngredients`
        );
        const parsedIngredients = response.data.map((categoryObj) => {
          const categoryName = Object.keys(categoryObj).find(
            (key) => key !== '_id'
          );
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

  // Handle category selection
  const handleSelectCategory = useCallback((categoryName) => {
    setSelectedCategory(categoryName);
  }, []);

  // Handle item click
  const handleItemClick = useCallback(
    (item) => {
      setSelectedItem({
        ...item,
        quantity: 1,
        TypeItem: orderType,
      });
      setRemovals([]);
      setAddOns([]);
      setNote(''); // Reset note
      setIsOnTheHouse(false); // Reset "On the House" status
      setOpenDialog(true);
    },
    [orderType]
  );

  // Calculate item price
  const calculateItemPrice = useCallback(
    (item) => {
      if (item.isOnTheHouse) {
        return 0;
      }
      const basePrice = orderType === 'Dine In' ? item.price : item.pricedel;
      const addOnsPrice = item.addOns
        ? item.addOns.reduce((acc, addOn) => acc + addOn.Price, 0)
        : 0;
      return basePrice + addOnsPrice;
    },
    [orderType]
  );

  // Calculate total price
  const calculateTotalPrice = useCallback(() => {
    const totalPrice = cart.reduce((total, cartItem) => {
      return total + calculateItemPrice(cartItem) * cartItem.quantity;
    }, 0);
    const discountedPrice = totalPrice - (totalPrice * discount) / 100;
    return Math.max(discountedPrice, 0);
  }, [cart, discount, calculateItemPrice]);

  // Handle quantity change for new items only
  const handleQuantityChange = useCallback((item, type) => {
    if (item.isExistingItem) {
      // Do nothing for existing items
      return;
    }

    setCart((prevCart) =>
      prevCart.map((cartItem) => {
        const isSameItem =
          cartItem._id === item._id &&
          JSON.stringify(cartItem.removals) ===
            JSON.stringify(item.removals) &&
          JSON.stringify(cartItem.addOns) ===
            JSON.stringify(item.addOns) &&
          cartItem.note === item.note &&
          cartItem.isOnTheHouse === item.isOnTheHouse;

        if (isSameItem) {
          return {
            ...cartItem,
            quantity:
              type === 'increase'
                ? cartItem.quantity + 1
                : Math.max(1, cartItem.quantity - 1),
          };
        }

        return cartItem;
      })
    );
  }, []);

  // Remove item from cart (for new items only)
  const onRemoveItem = useCallback((itemToRemove) => {
    if (itemToRemove.isExistingItem) {
      // Do nothing for existing items
      return;
    }

    setCart((prevCart) =>
      prevCart.filter(
        (cartItem) =>
          cartItem._id !== itemToRemove._id ||
          JSON.stringify(cartItem.removals) !==
            JSON.stringify(itemToRemove.removals) ||
          JSON.stringify(cartItem.addOns) !==
            JSON.stringify(itemToRemove.addOns) ||
          cartItem.note !== itemToRemove.note ||
          cartItem.isOnTheHouse !== itemToRemove.isOnTheHouse
      )
    );
  }, []);

  // Function to handle delete authorization
  const requestDeleteAuthorization = useCallback((item) => {
    if (item.isExistingItem) {
      // Do nothing for existing items
      return;
    }

    setPendingAction('delete');
    setPendingItem(item);
    setAuthDialogOpen(true);
  }, []);

  const handleAuthorizationSuccess = useCallback(() => {
    if (pendingAction === 'delete' && pendingItem) {
      // Perform the delete action
      onRemoveItem(pendingItem);
    }
    // Reset the authorization state
    setAuthDialogOpen(false);
    setPendingAction(null);
    setPendingItem(null);
  }, [pendingAction, pendingItem, onRemoveItem]);

  const handleAuthorizationCancel = useCallback(() => {
    setAuthDialogOpen(false);
    setPendingAction(null);
    setPendingItem(null);
  }, []);

  // Handle placing the order
  const handlePlaceOrder = useCallback(() => {
    if (orderType === 'Dine In' && !orderNumber) {
      toast.warn('Please select a table number for Dine In orders.', {
        position: 'bottom-center',
        autoClose: 3000,
      });
      return;
    }
    setOpenPaymentDialog(true);
  }, [orderType, orderNumber]);

  // Toggle remove ingredient
  const toggleRemoveIngredient = useCallback((ingredient) => {
    setRemovals((prev) =>
      prev.includes(ingredient)
        ? prev.filter((rem) => rem !== ingredient)
        : [...prev, ingredient]
    );
  }, []);

  // Toggle add ingredient
  const toggleAddIngredient = useCallback((ingredient) => {
    setAddOns((prev) =>
      prev.includes(ingredient)
        ? prev.filter((add) => add !== ingredient)
        : [...prev, ingredient]
    );
  }, []);

  // Handle ingredient category change
  const handleIngredientCategoryChange = useCallback(
    (category) => {
      setSelectedIngredientCategory(category);
      const selectedCat = ingredientsCategories.find(
        (cat) => cat.categoryName === category
      );
      setAvailableIngredients(selectedCat ? selectedCat.ingredients : []);
    },
    [ingredientsCategories]
  );

  // Handle save item
  const handleSaveItem = useCallback(() => {
    const updatedItem = {
      ...selectedItem,
      TypeItem: orderType,
      removals,
      addOns,
      note,
      isOnTheHouse, // Include "On the House" status
      isExistingItem: false, // Mark new items as new
    };

    const existingItemIndex = cart.findIndex(
      (cartItem) =>
        cartItem._id === updatedItem._id &&
        JSON.stringify(cartItem.removals) ===
          JSON.stringify(updatedItem.removals) &&
        JSON.stringify(cartItem.addOns) ===
          JSON.stringify(updatedItem.addOns) &&
        cartItem.note === updatedItem.note && // Compare notes
        cartItem.isOnTheHouse === updatedItem.isOnTheHouse // Compare "On the House" status
    );

    if (existingItemIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      updatedCart[existingItemIndex].isExistingItem = false; // Ensure it's marked as new
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...updatedItem, quantity: 1 }]);
    }

    setOpenDialog(false);
  }, [
    selectedItem,
    orderType,
    removals,
    addOns,
    note,
    isOnTheHouse,
    cart,
  ]);

  // Handle payment method change
  const handlePaymentMethodChange = useCallback(
    (method) => {
      setPaymentMethod(method);

      if (method === 'Cash') {
        setOpenCashPaymentDialog(true);
      } else {
        // Proceed to process the order
        // Implement your order processing logic here
        setOpenPaymentDialog(false);
        navigate('/staff/dashboard');
      }
    },
    [navigate]
  );

  // Handle cash payment
  const handleKeyPress = useCallback(
    (key) => {
      if (key === 'C') {
        setAmountPaidStr('');
        setAmountPaid(0);
        setChangeDue(0 - calculateTotalPrice());
      } else if (key === 'delete') {
        const newAmountPaidStr = amountPaidStr.slice(0, -1);
        setAmountPaidStr(newAmountPaidStr);
        setAmountPaid(parseFloat(newAmountPaidStr) || 0);
        setChangeDue(
          (parseFloat(newAmountPaidStr) || 0) - calculateTotalPrice()
        );
      } else {
        const newAmountPaidStr = amountPaidStr + key;
        if (/^\d*\.?\d*$/.test(newAmountPaidStr)) {
          setAmountPaidStr(newAmountPaidStr);
          const amount = parseFloat(newAmountPaidStr) || 0;
          setAmountPaid(amount);
          setChangeDue(amount - calculateTotalPrice());
        }
      }
    },
    [amountPaidStr, calculateTotalPrice]
  );

  const handleConfirmCashPayment = useCallback(() => {
    if (amountPaid < calculateTotalPrice()) {
      toast.error('Amount paid is less than the total due.');
      return;
    }
    // Process the order
    // Implement your order processing logic here
    setOpenCashPaymentDialog(false);
    navigate('/staff/dashboard');
  }, [amountPaid, calculateTotalPrice, navigate]);

  // Handle applying discount
  const handleApplyDiscount = useCallback(() => {
    setOpenDiscountDialog(true);
  }, []);

  // Function to apply discount after authorization
  const applyDiscount = useCallback((discountValue) => {
    setDiscount(discountValue);
    setOpenDiscountDialog(false);
    toast.success(`Discount of ${discountValue}% applied successfully!`);
  }, []);

  // Handle order type change
  const handleOrderTypeChange = useCallback((event, newType) => {
    if (newType !== null) {
      setOrderType(newType);
    }
  }, []);

  return (
    <Container
      maxWidth={false}
      sx={{
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={0} sx={{ height: '100vh', overflow: 'hidden' }}>
          {/* Categories Section */}
          <Grid
            item
            xs={2}
            sx={{
              backgroundColor: '#f0f0f0',
              padding: 1,
              boxShadow: 3,
              borderRight: '1px solid #e0e0e0',
            }}
          >
            <CategoryList
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
            />
          </Grid>

          {/* Items Section */}
          <Grid item xs={6.5} sx={{ padding: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
              <ToggleButtonGroup
                value={orderType}
                exclusive
                onChange={handleOrderTypeChange}
              >
                <ToggleButton value="Dine In">Dine In</ToggleButton>
                <ToggleButton value="TakeAway">Takeaway</ToggleButton>
                <ToggleButton value="Delivery">Delivery</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <ItemList
              items={items}
              loading={loading}
              error={error}
              onItemClick={handleItemClick}
              calculateItemPrice={calculateItemPrice}
            />
          </Grid>

          {/* Cart Section */}
          <Grid
            item
            xs={3.5}
            sx={{
              backgroundColor: '#f0f0f0',
              padding: 2,
              boxShadow: 3,
              borderLeft: '1px solid #e0e0e0',
            }}
          >
            <Cart
              cart={cart}
              orderNumber={orderNumber}
              onQuantityChange={handleQuantityChange}
              onRemoveItem={onRemoveItem}
              calculateTotalPrice={calculateTotalPrice}
              onPlaceOrder={handlePlaceOrder}
              orderType={orderType}
              tableNumber={tableNumber}
              calculateItemPrice={calculateItemPrice}
              requestDeleteAuthorization={requestDeleteAuthorization}
            />
          </Grid>
        </Grid>
      )}

      {/* Item Editing Modal */}
      <ItemModal
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        selectedItem={selectedItem}
        removals={removals}
        addOns={addOns}
        ingredientsCategories={ingredientsCategories}
        availableIngredients={availableIngredients}
        selectedIngredientCategory={selectedIngredientCategory}
        toggleRemoveIngredient={toggleRemoveIngredient}
        toggleAddIngredient={toggleAddIngredient}
        handleIngredientCategoryChange={handleIngredientCategoryChange}
        handleSaveItem={handleSaveItem}
        note={note}                // Pass the note state
        setNote={setNote}          // Pass the function to update the note
        isOnTheHouse={isOnTheHouse}          // Pass "On the House" status
        setIsOnTheHouse={setIsOnTheHouse}    // Pass the setter function
      />

      {/* Payment Selection Modal */}
      <PaymentDialog
        open={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
        onPaymentMethodSelect={handlePaymentMethodChange}
        note={note}
        setNote={setNote}
      />

      {/* Cash Payment Dialog */}
      <CashPaymentDialog
        open={openCashPaymentDialog}
        onClose={() => setOpenCashPaymentDialog(false)}
        calculateTotalPrice={calculateTotalPrice}
        amountPaid={amountPaid}
        amountPaidStr={amountPaidStr}
        changeDue={changeDue}
        handleKeyPress={handleKeyPress}
        handleConfirmCashPayment={handleConfirmCashPayment}
      />

      {/* Discount Dialog */}
      <DiscountDialog
        open={openDiscountDialog}
        onClose={() => setOpenDiscountDialog(false)}
        onApplyDiscount={applyDiscount}
      />

      {/* Authorization Dialog */}
      <AuthorizationDialog
        open={authDialogOpen}
        onClose={handleAuthorizationCancel}
        onAuthorize={handleAuthorizationSuccess}
      />

      <ToastContainer />
    </Container>
  );
};

export default Order;
