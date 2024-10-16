import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  
} from "@mui/material";
import { Money, CreditCard, MobileFriendly, Replay,Print, Discount  } from "@mui/icons-material";
import { Delete, AddCircle, RemoveCircle } from "@mui/icons-material";
import { useOrder } from "../../context/OrderContext";
import { useNavigate } from "react-router-dom";

import "react-perfect-scrollbar/dist/css/styles.css";
import "react-simple-keyboard/build/css/index.css";

const Order = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("Dine In");
  const [tableNumber, setTableNumber] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [ingredientsCategories, setIngredientsCategories] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [removals, setRemovals] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [activeTab, setActiveTab] = useState("remove");
  const [error, setError] = useState("");
  const [selectedIngredientCategory, setSelectedIngredientCategory] =useState("");
  const [isAccessAllowed, setIsAccessAllowed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("N/A");
  const navigate = useNavigate();
  const { selectedOrder } = useOrder();
  const location = useLocation();
  const [orderNumber, setOrderNumber] = useState(null);

  const [openCashPaymentDialog, setOpenCashPaymentDialog] = useState(false);
  const [amountPaid, setAmountPaid] = useState(0);
  const [amountPaidStr, setAmountPaidStr] = useState('');
  const [changeDue, setChangeDue] = useState(0);
  
  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const availablePrinters = await window.electronAPI.getPrinters();
        console.log("Available Printers:", availablePrinters);
      } catch (error) {
        console.error("Error fetching printers:", error);
      }
    };
    fetchPrinters();
  }, []);

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
        CategoryName: item.CategoryName,
        CategoryLocation: item.CategoryLocation || "No Kitchen",
      }));
      setCart(itemsToCart);
      setOrderType(selectedOrder.Type);
      setTableNumber(selectedOrder.TableNumber || "");
      console.log(selectedOrder);
    } else {
      setCart([]);
    }
  }, [selectedOrder]);

  useEffect(() => {
    const checkLatestGross = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/Gross/GetLatestGross`
        );
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
        console.log(latestGross);
      } catch (err) {
        console.error("Error checking latest gross:", err);
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
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/Category/GetAllCategories`
        );
        setCategories(response.data);
        setSelectedCategory(response.data[0]?.Name);
      } catch (err) {
        console.error("Error fetching categories:", err);
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
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/Item/GetItemsByCategory/${selectedCategory}`
        );

        // Map items to include CategoryName and CategoryLocation
        const itemsWithCategoryData = response.data.map((item) => ({
          ...item,
          CategoryName: selectedCategory,
          CategoryLocation:
            categories.find((cat) => cat.Name === selectedCategory)?.Location ||
            "No Kitchen",
        }));

        setItems(
          itemsWithCategoryData.length === 0 ? [] : itemsWithCategoryData
        );
        setError(itemsWithCategoryData.length === 0 ? "No items found" : "");
      } catch (err) {
        console.error("Error fetching items:", err);
        setError("Error fetching items");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [selectedCategory, categories]);

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/Ingredients/GetAllIngredients`
        );
        const parsedIngredients = response.data.map((categoryObj) => {
          const categoryName = Object.keys(categoryObj).find(
            (key) => key !== "_id"
          );
          return {
            categoryName,
            ingredients: categoryObj[categoryName] || [],
          };
        });
        setIngredientsCategories(parsedIngredients);
      } catch (err) {
        console.error("Error fetching ingredients:", err);
      }
    };
    fetchIngredients();
  }, []);

  useEffect(() => {
    console.log("Order component re-rendered", { tableNumber });
  }, [tableNumber]);

  if (!isAccessAllowed) {
    return (
      <Container>
        <Typography
          variant="h6"
          color="error"
          sx={{ textAlign: "center", marginTop: 5 }}
        >
          Access restricted: The latest gross is closed.
        </Typography>
        <ToastContainer />
      </Container>
    );
  }

  const handleKeypadInput = (key) => {
    if (key === "C") {
      setAmountPaidStr("");
      setAmountPaid(0);
      setChangeDue(0 - calculateTotalPrice());
    } else {
      let newAmountPaidStr = amountPaidStr + key.toString();
      // Validate the input (e.g., only allow one decimal point)
      if (/^\d*\.?\d*$/.test(newAmountPaidStr)) {
        setAmountPaidStr(newAmountPaidStr);
        const amount = parseFloat(newAmountPaidStr) || 0;
        setAmountPaid(amount);
        setChangeDue(amount - calculateTotalPrice());
      }
    }
  };

  const handleCloseCashPaymentDialog = () => {
    setOpenCashPaymentDialog(false);
    // Reset the cash payment state
    resetCashPaymentState();
  };
  const handleConfirmCashPayment = async () => {
    if (amountPaid < calculateTotalPrice()) {
      toast.error("Amount paid is less than the total due.");
      return;
    }
    await processOrder("Cash");
  };
  
  const handleQuantityChange = (item, type) => {
    setCart((prevCart) =>
      prevCart.map((cartItem) => {
        const isSameItem =
          cartItem._id === item._id &&
          JSON.stringify(cartItem.removals) === JSON.stringify(item.removals) &&
          JSON.stringify(cartItem.addOns) === JSON.stringify(item.addOns);

        if (isSameItem) {
          return {
            ...cartItem,
            quantity:
              type === "increase"
                ? cartItem.quantity + 1
                : Math.max(1, cartItem.quantity - 1),
          };
        }

        return cartItem;
      })
    );
  };

  const toggleRemoveIngredient = (ingredient) => {
    setRemovals((prev) =>
      prev.includes(ingredient)
        ? prev.filter((rem) => rem !== ingredient)
        : [...prev, ingredient]
    );
  };

  const toggleAddIngredient = (ingredient) => {
    setAddOns((prev) =>
      prev.includes(ingredient)
        ? prev.filter((add) => add !== ingredient)
        : [...prev, ingredient]
    );
  };

  const calculateItemPrice = (item) => {
    const basePrice = orderType === "Dine In" ? item.price : item.pricedel;
    const addOnsPrice = item.addOns
      ? item.addOns.reduce((acc, addOn) => acc + addOn.Price, 0)
      : 0;
    return basePrice + addOnsPrice;
  };

  const calculateTotalPrice = () => {
    return cart.reduce(
      (total, cartItem) =>
        total + calculateItemPrice(cartItem) * cartItem.quantity,
      0
    );
  };

  const handleValidateOrder = () => {
    if (orderType === "Dine In" && !tableNumber) {
      toast.warn("Please select a table number for Dine In orders.", {
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
  const handleNoteChange = (value) => {
    setNote(value);
  };

  const handlePaymentMethodChange = async (method) => {
    setPaymentMethod(method);

    if (method === "Cash") {
      setOpenCashPaymentDialog(true);
    } else {
      // Proceed to process the order
      await processOrder(method);
    }
  };
 
  const processOrder= async (method) => {
    try {
      s

      const isUpdate = orderNumber !== null;
      let status =
        method === "Proceed"
          ? "Pending"
          : method === "Pay Later"
          ? "Pay Later"
          : "Done";

      const payload = {
        Status: status,
        PaymentType:
          method === "Proceed" || method === "Pay Later" ? "N/A" : method,
        Items: cart.map((item) => ({
          CategoryName: item.CategoryName,
          CategoryLocation: item.CategoryLocation,
          Name: item.Name,
          PriceDineIn: parseFloat(item.price) || 0.0,
          PriceDelivery: parseFloat(item.pricedel) || 0.0,
          Quantity: parseFloat(item.quantity) || 1.0,
          TypeItem: orderType === "Dine In" ? "Dine In" : "TakeAway",
          Removals: item.removals || [],
          AddOns: item.addOns || [],
        })),
        TableNumber: tableNumber ? tableNumber.toString() : "N/A",
        DeliveryCharge:
          orderType === "Delivery" ? parseFloat(deliveryCharge) : 0.0,
        Location: orderType === "Delivery" ? deliveryLocation : "",
        Note: note,
      };

      let createdOrderNumber;
      if (isUpdate) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/Order/UpdateOrderByOrderNumber/${orderNumber}`,
          payload
        );
        createdOrderNumber = orderNumber;
      } else {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/Order/CreateOrder`,
          payload
        );
        createdOrderNumber = response.data.OrderNumber;
      }

      setOrderNumber(createdOrderNumber);

      // Group items by CategoryLocation
      const itemsByLocation = cart.reduce((acc, item) => {
        const location = item.CategoryLocation || "No Kitchen";
        if (!acc[location]) {
          acc[location] = [];
        }
        acc[location].push(item);
        return acc;
      }, {});

      // Prepare and print for each location
      for (const [location, items] of Object.entries(itemsByLocation)) {
        if (location === "No Kitchen") {
          continue; // Skip if no specific location
        }

        const printData = [];

        // Header
        // Header
        printData.push(
          {
            type: "text",
            value: "L'Escale Royale",
            style: {
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "26px",
            },
          },
          {
            type: "text",
            value: "123 Royal Street, Paris, France",
            style: { textAlign: "center", fontSize: "14px" },
          },
          {
            type: "text",
            value: "Phone: +33 1 23 45 67 89",
            style: { textAlign: "center", fontSize: "14px" },
          },
          {
            type: "text",
            value: "----------------------------------------",
            style: { textAlign: "center" },
          }
        );

        // Order Info
        printData.push(
          {
            type: "text",
            value: `Order N°: ${createdOrderNumber}`,
            style: {
              textAlign: "center",
              fontSize: "18px",
              fontWeight: "bold",
            },
          },
          {
            type: "text",
            value: `Status: ${isUpdate ? "UPDATE" : "NEW ORDER"}`,
            style: {
              textAlign: "center",
              fontSize: "16px",
              fontWeight: "bold",
              color: "blue",
            },
          },
          {
            type: "text",
            value: `Date: ${new Date().toLocaleDateString(
              "fr-FR"
            )}    Time: ${new Date().toLocaleTimeString("fr-FR")}`,
            style: { textAlign: "left", fontSize: "14px" },
          },
          {
            type: "text",
            value: `Table: ${tableNumber || "N/A"}`,
            style: { textAlign: "left", fontSize: "14px" },
          },
          {
            type: "text",
            value: "----------------------------------------",
            style: { textAlign: "center" },
          },
          // Item List Header
          {
            type: "text",
            value: "ITEM              QTY         PRICE",
            style: {
              textAlign: "left",
              fontSize: "14px",
              fontWeight: "bold",
              fontFamily: "monospace",
            },
          }
        );

        // Items
        items.forEach((item) => {
          // Format item line with proper spacing
          const itemName = item.Name.padEnd(20, " ");
          const quantity = item.quantity.toString().padStart(5, " ");
          const price = (calculateItemPrice(item) * item.quantity)
            .toFixed(2)
            .toString()
            .padStart(10, " ");

          printData.push({
            type: "text",
            value: `${itemName}${quantity}${price} CFA`,
            style: {
              textAlign: "left",
              fontSize: "14px",
              fontFamily: "monospace",
            },
          });

          // Removals (if any)
          if (item.removals && item.removals.length > 0) {
            item.removals.forEach((removal) => {
              const removalName = `- ${removal.Name}`;
              printData.push({
                type: "text",
                value: removalName,
                style: {
                  textAlign: "left",
                  fontSize: "12px",
                  color: "red",
                  fontStyle: "italic",
                },
              });
            });
          }

          // Add-ons (if any)
          if (item.addOns && item.addOns.length > 0) {
            item.addOns.forEach((addOn) => {
              const addOnName = `+ ${addOn.Name} (${addOn.Price} CFA)`;
              printData.push({
                type: "text",
                value: addOnName,
                style: {
                  textAlign: "left",
                  fontSize: "12px",
                  color: "green",
                  fontStyle: "italic",
                },
              });
            });
          }
        });

        // Footer
        printData.push(
          {
            type: "text",
            value: "----------------------------------------",
            style: { textAlign: "center" },
          },
          {
            type: "text",
            value: "Thank you for your order!",
            style: {
              textAlign: "center",
              fontSize: "14px",
              fontStyle: "italic",
            },
          }
        );

        // Determine printer name based on location
        let printerName = "";
        if (location === "Kitchen") {
          printerName = "POS-80C-Kitchen"; // Replace with your actual kitchen printer name
        } else if (location === "Pizza Oven") {
          printerName = "POS-80C-Oven"; // Replace with your actual pizza oven printer name
        }

        // Ensure that printerName is set
        if (printerName) {
          const printOptions = {
            preview: false,
            printerName: printerName,
            copies: 1,
            timeOutPerLine: 400,
            silent: true,
          };

          // Send to the printer
          const response = await window.electronAPI.printOrder(
            printData,
            printOptions
          );
          if (response.success) {
            console.log(`Order printed successfully to ${location}`);
          } else {
            console.error(`Failed to print the order to ${location}`);
          }
        } else {
          console.error(`No printer configured for location: ${location}`);
        }
      }

      // Prepare print data for cashier (all items)
      const cashierPrintData = [];

      // Header
      cashierPrintData.push(
        {
          type: "text",
          value: "L'Escale Royale",
          style: { textAlign: "center", fontWeight: "bold", fontSize: "26px" },
        },
        {
          type: "text",
          value: "123 Royal Street, Paris, France",
          style: { textAlign: "center", fontSize: "14px" },
        },
        {
          type: "text",
          value: "Phone: +33 1 23 45 67 89",
          style: { textAlign: "center", fontSize: "14px" },
        },
        {
          type: "text",
          value: "----------------------------------------",
          style: { textAlign: "center" },
        }
      );

      // Order Info
      cashierPrintData.push(
        {
          type: "text",
          value: `Order N°: ${createdOrderNumber}`,
          style: { textAlign: "left", fontSize: "14px", fontWeight: "bold" },
        },
        {
          type: "text",
          value: `Status: ${isUpdate ? "Update" : "New Order"}`,
          style: { textAlign: "left", fontSize: "14px", fontWeight: "bold" },
        },
        {
          type: "text",
          value: `Date: ${new Date().toLocaleDateString(
            "fr-FR"
          )}    Time: ${new Date().toLocaleTimeString("fr-FR")}`,
          style: { textAlign: "left", fontSize: "14px" },
        },
        {
          type: "text",
          value: `Table: ${tableNumber || "N/A"}`,
          style: { textAlign: "left", fontSize: "14px" },
        },
        {
          type: "text",
          value: "----------------------------------------",
          style: { textAlign: "center" },
        },
        // Item List Header
        {
          type: "text",
          value: "Item                         Qty     Price",
          style: {
            textAlign: "left",
            fontSize: "14px",
            fontWeight: "bold",
            fontFamily: "monospace",
          },
        }
      );

      // Items
      cart.forEach((item) => {
        // Column widths
        const nameWidth = 20;
        const qtyWidth = 6;
        const priceWidth = 10;

        // Format main item line
        const name =
          item.Name.length > nameWidth
            ? item.Name.substring(0, nameWidth - 3) + "..."
            : item.Name.padEnd(nameWidth, " ");
        const qty = item.quantity
          .toString()
          .padStart(
            Math.floor(qtyWidth / 2) + (item.quantity.toString().length % 2)
          )
          .padEnd(qtyWidth, " ");
        const price = (calculateItemPrice(item) * item.quantity)
          .toFixed(2)
          .toString()
          .padStart(priceWidth, " ");

        cashierPrintData.push({
          type: "text",
          value: `${name}${qty}${price} CFA`,
          style: {
            textAlign: "left",
            fontSize: "14px",
            fontFamily: "monospace",
          },
        });

        // AddOns
        if (item.addOns && item.addOns.length > 0) {
          item.addOns.forEach((addOn) => {
            const addOnName = "  + " + addOn.Name;
            const addOnPrice = (addOn.Price * item.quantity)
              .toFixed(2)
              .toString()
              .padStart(priceWidth, " ");
            cashierPrintData.push({
              type: "text",
              value: `${addOnName.padEnd(
                nameWidth + qtyWidth,
                " "
              )}${addOnPrice} CFA`,
              style: {
                textAlign: "left",
                fontSize: "12px",
                fontFamily: "monospace",
                color: "green",
              },
            });
          });
        }

        // Removals
        if (item.removals && item.removals.length > 0) {
          item.removals.forEach((removal) => {
            const removalName = "  - " + removal.Name;
            cashierPrintData.push({
              type: "text",
              value: `${removalName}`,
              style: {
                textAlign: "left",
                fontSize: "12px",
                fontFamily: "monospace",
                color: "red",
              },
            });
          });
        }
      });

      // Total Section
      cashierPrintData.push(
        {
          type: "text",
          value: "----------------------------------------",
          style: { textAlign: "center" },
        },
        ...(payload.DeliveryCharge > 0
          ? [
              {
                type: "text",
                value: `Delivery Charge: ${payload.DeliveryCharge.toFixed(
                  2
                )} CFA`,
                style: { textAlign: "right", fontSize: "14px" },
              },
            ]
          : []),
        {
          type: "text",
          value: `Total: ${calculateTotalPrice().toFixed(2)} CFA`,
          style: { textAlign: "right", fontSize: "16px", fontWeight: "bold" },
        },
        {
          type: "text",
          value: `Payment Method: ${method}`,
          style: { textAlign: "right", fontSize: "14px" },
        },
        {
          type: "text",
          value: "----------------------------------------",
          style: { textAlign: "center" },
        },
        // Footer Message
        {
          type: "text",
          value: "Merci pour votre commande!",
          style: { textAlign: "center", fontSize: "14px", fontStyle: "italic" },
        }
      );

      const cashierPrintOptions = {
        preview: false,
        printerName: "POS-80C-Cashier",
        copies: 1,
        timeOutPerLine: 400,
        silent: true,
      };

      const response = await window.electronAPI.printOrder(
        cashierPrintData,
        cashierPrintOptions
      );
      if (response.success) {
        toast.success("Order printed successfully!");
      } else {
        toast.error("Failed to print the order.");
      }

      navigate("/staff/dashboard");
      setOpenPaymentDialog(false);
    } catch (error) {
      console.error("Error with payment method:", error);
      toast.error("An error occurred while processing the payment.");
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem({
      ...item,
      quantity: 1,
      TypeItem: orderType,
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
        JSON.stringify(cartItem.removals) ===
          JSON.stringify(updatedItem.removals) &&
        JSON.stringify(cartItem.addOns) === JSON.stringify(updatedItem.addOns)
    );

    if (existingItemIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...updatedItem, quantity: 1 }]);
    }

    setOpenDialog(false);
  };

  const handleIngredientCategoryChange = (category) => {
    setSelectedIngredientCategory(category);
    const selectedCat = ingredientsCategories.find(
      (cat) => cat.categoryName === category
    );
    setAvailableIngredients(selectedCat ? selectedCat.ingredients : []);
  };

  const removeFromCart = (itemToRemove) => {
    setCart(
      cart.filter(
        (cartItem) =>
          cartItem._id !== itemToRemove._id ||
          JSON.stringify(cartItem.removals) !==
            JSON.stringify(itemToRemove.removals) ||
          JSON.stringify(cartItem.addOns) !==
            JSON.stringify(itemToRemove.addOns)
      )
    );
  };

  const handlePrintOrder = () => {
    toast.success("Printing order...");
    // Logic to print the order goes here
    console.log("Print order initiated.");
  };

  const handleApplyDiscount = () => {
    toast.info("Applying discount...");
    // Logic to apply the discount goes here
    console.log("Discount applied.");
  };
  return (
    <Container
      maxWidth={false}
      sx={{
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Grid
          container
          spacing={0}
          sx={{ height: "100vh", overflow: "hidden" }}
        >
          {/* Categories Section */}
          <Grid
            item
            xs={2}
            sx={{
              backgroundColor: "#f0f0f0",
              padding: 1,
              boxShadow: 3,
              borderRight: "1px solid #e0e0e0",
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 1, fontWeight: "bold", textAlign: "center" }}
            >
              Categories
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                overflowY: "auto",
                height: "90vh",
                // Scrollbar styling
                "&::-webkit-scrollbar": {
                  width: "4px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f0f0f0",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#c0c0c0",
                  borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  backgroundColor: "#a0a0a0",
                },
              }}
            >
              {categories.map((category) => (
                <Button
                  key={category._id || category.Name}
                  variant={
                    selectedCategory === category.Name
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => setSelectedCategory(category.Name)}
                  fullWidth
                  sx={{
                    padding: "10px",
                    fontSize: "14px",
                    fontWeight: "500",
                    borderRadius: "8px",
                  }}
                >
                  {category.Name}
                </Button>
              ))}
            </Box>
          </Grid>

          {/* Items Section */}
          <Grid item xs={6.5} sx={{ padding: 1 }}>
            <Box
              sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3 }}
            >
              <ToggleButtonGroup
                value={orderType}
                exclusive
                onChange={(e, newType) => setOrderType(newType)}
              >
                <ToggleButton
                  value="Dine In"
                  sx={{
                    fontWeight: "500",
                    backgroundColor: "#F0F4F8", // Light, neutral background
                    color: "#1976D2", // Calming blue color
                    "&.Mui-selected": {
                      backgroundColor: "#1976D2",
                      color: "#fff",
                    }, // Blue when selected
                  }}
                >
                  Dine In
                </ToggleButton>
                <ToggleButton
                  value="Takeaway"
                  sx={{
                    fontWeight: "500",
                    backgroundColor: "#F0F4F8",
                    color: "#1976D2",
                    "&.Mui-selected": {
                      backgroundColor: "#1976D2",
                      color: "#fff",
                    },
                  }}
                >
                  Takeaway
                </ToggleButton>
                <ToggleButton
                  value="Delivery"
                  sx={{
                    fontWeight: "500",
                    backgroundColor: "#F0F4F8",
                    color: "#1976D2",
                    "&.Mui-selected": {
                      backgroundColor: "#1976D2",
                      color: "#fff",
                    },
                  }}
                >
                  Delivery
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "60vh",
                }}
              >
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography variant="body1" color="error" textAlign="center">
                {error}
              </Typography>
            ) : (
              <Grid
                container
                spacing={1}
                sx={{
                  maxHeight: "70vh",
                  overflowY: "auto",
                  paddingRight: "8px",
                }}
              >
                {items.map((item) => (
                  <Grid item xs={2.4} key={item._id}>
                    <Card
                      elevation={1}
                      sx={{
                        cursor: "pointer",
                        padding: "8px",
                        borderRadius: "8px", // Softly rounded corners for a modern look
                        backgroundColor: "#F9FAFB", // Clean, neutral background
                        height: "140px", // Maintain readability
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        transition: "background-color 0.2s", // Simple hover effect
                        "&:hover": {
                          backgroundColor: "#E8F0FE", // Light blue hover effect for subtle feedback
                        },
                      }}
                      onClick={() => handleItemClick(item)}
                    >
                      <CardContent
                        sx={{
                          textAlign: "center",
                          padding: "6px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <Typography
                          variant="body1" // Simple body font for item name
                          sx={{
                            fontWeight: "500",
                            fontSize: "1rem", // Easy-to-read font size
                            color: "#212121", // Dark gray for good contrast
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            maxWidth: "100%",
                          }}
                        >
                          {item.Name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.85rem", // Maintain smaller size for price
                            fontWeight: "400", // Regular weight for clean, minimal look
                            color: "#616161", // Softer gray for price
                            marginTop: "4px", // Space between name and price
                          }}
                        >
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
          <Grid
            item
            xs={3.5}
            sx={{
              backgroundColor: "#f0f0f0",
              padding: 2,
              boxShadow: 3,
              borderLeft: "1px solid #e0e0e0",
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 1, fontWeight: "bold", textAlign: "center" }}
            >
              Cart
            </Typography>

            {/* Order Information */}
            <Box sx={{ marginBottom: 2 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: "1rem",
                  mb: 1,
                }}
              >
                Order N°{orderNumber}
              </Typography>
              {orderType === "Dine In" && (
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: "bold",
                    textAlign: "center",
                    fontSize: "1rem",
                  }}
                >
                  Table: {tableNumber}
                </Typography>
              )}
            </Box>

            {cart.length === 0 ? (
              <Typography color="textSecondary" textAlign="center">
                Your cart is empty
              </Typography>
            ) : (
              <Box
                sx={{ maxHeight: "60vh", overflowY: "auto", padding: "8px" }}
              >
                <List dense>
                  {cart.map((cartItem, index) => (
                    <React.Fragment key={`cart-item-${cartItem._id || index}`}>
                      <ListItem
                        secondaryAction={
                          orderNumber === null && (
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => removeFromCart(cartItem)}
                            >
                              <Delete />
                            </IconButton>
                          )
                        }
                        sx={{
                          alignItems: "flex-start",
                          marginBottom: 1,
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: "bold" }}
                          >
                            {cartItem.Name}
                          </Typography>
                          {/* Display the type of the item (Dine In or TakeAway) */}
                          <Typography variant="body2" color="textSecondary">
                            Type: {cartItem.TypeItem || orderType}
                          </Typography>
                          <Typography variant="body2">
                            {orderType === "Dine In"
                              ? cartItem.price
                              : cartItem.pricedel}{" "}
                            CFA x {cartItem.quantity}
                          </Typography>

                          {/* Display Removals */}
                          {cartItem.removals &&
                            cartItem.removals.length > 0 && (
                              <Typography variant="body2" color="error">
                                Removals:{" "}
                                {cartItem.removals
                                  .map((rem) => rem.Name)
                                  .join(", ")}
                              </Typography>
                            )}

                          {/* Display Add-ons */}
                          {cartItem.addOns && cartItem.addOns.length > 0 && (
                            <Typography variant="body2" color="primary">
                              Add-ons:{" "}
                              {cartItem.addOns
                                .map((add) => `${add.Name} (${add.Price} CFA)`)
                                .join(", ")}
                            </Typography>
                          )}
                        </Box>

                        {/* Quantity Controls */}
                        <Box
                          sx={{ display: "flex", alignItems: "center", mt: 1 }}
                        >
                          <IconButton
                            aria-label="decrease"
                            onClick={() =>
                              handleQuantityChange(cartItem, "decrease")
                            }
                            disabled={cartItem.quantity <= 1}
                          >
                            <RemoveCircle />
                          </IconButton>
                          <Typography variant="body1" sx={{ mx: 1 }}>
                            {cartItem.quantity}
                          </Typography>
                          <IconButton
                            aria-label="increase"
                            onClick={() =>
                              handleQuantityChange(cartItem, "increase")
                            }
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

            {/* Total Amount */}
            {cart.length > 0 && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    borderTop: "1px solid #e0e0e0",
                    backgroundColor: "#fff",
                    mt: 2,
                    borderRadius: "4px",
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    Total:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: "bold", color: "primary.main" }}
                  >
                    {calculateTotalPrice()} CFA
                  </Typography>
                </Box>

                {/* Place Order Button */}
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{
                    padding: "15px",
                    mt: 3,
                    fontWeight: "bold",
                    position: "sticky",
                    bottom: 0,
                  }}
                  onClick={handleValidateOrder}
                >
                  Place Order
                </Button>
              </>
            )}
          </Grid>
        </Grid>
      )}
      {/* Item Editing Modal */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{ fontWeight: "bold", textAlign: "center", fontSize: "1.5rem" }}
        >
          Edit {selectedItem?.Name}
        </DialogTitle>

        <DialogContent dividers sx={{ paddingX: 3, paddingY: 2 }}>
          {/* Toggle Button Group to Switch Between Tabs */}
          <ToggleButtonGroup
            value={activeTab}
            exclusive
            onChange={(e, newTab) => setActiveTab(newTab)}
            sx={{ display: "flex", justifyContent: "center", mb: 3 }}
          >
            <ToggleButton
              value="remove"
              sx={{
                fontWeight: "bold",
                fontSize: "1.2rem",
                padding: "10px 20px",
              }}
            >
              Remove Ingredients
            </ToggleButton>
            <ToggleButton
              value="add"
              sx={{
                fontWeight: "bold",
                fontSize: "1.2rem",
                padding: "10px 20px",
              }}
            >
              Add Ingredients
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Remove Ingredients Section */}
          {activeTab === "remove" && (
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mt: 2,
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: "1.3rem",
                }}
              >
                Remove Ingredients
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  mt: 2,
                  justifyContent: "center",
                  maxHeight: "300px",
                  overflowY: "auto",
                  padding: 2,
                  backgroundColor: "#f9f9f9",
                  borderRadius: 2,
                }}
              >
                {selectedItem?.Ingredients?.map((ingredient, index) => (
                  <Chip
                    key={index}
                    label={ingredient.Name}
                    color={removals.includes(ingredient) ? "error" : "default"}
                    onClick={() => toggleRemoveIngredient(ingredient)}
                    sx={{
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "1rem",
                      padding: "10px 15px",
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Add Ingredients Section */}
          {activeTab === "add" && (
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mt: 2,
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: "1.3rem",
                }}
              >
                Add Ingredients
              </Typography>

              {/* Ingredient Categories */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 2,
                  mt: 2,
                  mb: 2,
                }}
              >
                {ingredientsCategories.map((cat, index) => (
                  <Button
                    key={index}
                    variant={
                      selectedIngredientCategory === cat.categoryName
                        ? "contained"
                        : "outlined"
                    }
                    onClick={() =>
                      handleIngredientCategoryChange(cat.categoryName)
                    }
                    sx={{
                      fontWeight: "bold",
                      fontSize: "1rem",
                      padding: "10px 20px",
                      borderRadius: "12px",
                    }}
                  >
                    {cat.categoryName}
                  </Button>
                ))}
              </Box>

              {/* Available Ingredients */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  mt: 2,
                  justifyContent: "center",
                  maxHeight: "300px",
                  overflowY: "auto",
                  padding: 2,
                  backgroundColor: "#f9f9f9",
                  borderRadius: 2,
                }}
              >
                {availableIngredients.map((ingredient, index) => (
                  <Chip
                    key={index}
                    label={`${ingredient.Name}: ${ingredient.Price} CFA`}
                    color={addOns.includes(ingredient) ? "primary" : "default"}
                    onClick={() => toggleAddIngredient(ingredient)}
                    sx={{
                      fontWeight: "bold",
                      cursor: "pointer",
                      fontSize: "1rem",
                      padding: "10px 15px",
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>

        {/* Actions at the Bottom */}
        <DialogActions sx={{ justifyContent: "space-between", padding: 3 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            color="secondary"
            sx={{
              fontWeight: "bold",
              fontSize: "1.2rem",
              padding: "10px 20px",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveItem}
            variant="contained"
            color="primary"
            sx={{
              fontWeight: "bold",
              fontSize: "1.2rem",
              padding: "10px 20px",
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Selection Modal */}
      <Dialog
  open={openPaymentDialog}
  onClose={() => setOpenPaymentDialog(false)}
  maxWidth="sm"
  fullWidth
  sx={{ maxHeight: '90vh' }} // Restrict dialog height to avoid scrolling
>
  <DialogTitle
    sx={{
      fontWeight: "bold",
      textAlign: "center",
      fontSize: "1.4rem",
      padding: "10px 0",
    }}
  >
    Mode de Paiement
  </DialogTitle>

  <DialogContent
    dividers={false} // Remove dividers for a smoother layout
    sx={{ paddingY: 2 }}
  >
    {/* Payment Method Options */}
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5, // Reduced gap between buttons
        alignItems: "center",
      }}
    >
      <Button
        variant="contained"
        color="primary"
        sx={{
          width: "100%",
          padding: "12px",
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}
        onClick={() => handlePaymentMethodChange("Cash")}
        startIcon={<Money sx={{ fontSize: 30 }} />}
      >
        Espèces
      </Button>

      <Button
        variant="contained"
        color="secondary"
        sx={{
          width: "100%",
          padding: "12px",
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}
        onClick={() => handlePaymentMethodChange("Card")}
        startIcon={<CreditCard sx={{ fontSize: 30 }} />}
      >
        Carte
      </Button>

      <Button
        variant="contained"
        color="success"
        sx={{
          width: "100%",
          padding: "12px",
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}
        onClick={() => handlePaymentMethodChange("Airtel")}
        startIcon={<MobileFriendly sx={{ fontSize: 30 }} />}
      >
        Airtel
      </Button>

      <Button
        variant="contained"
        color="warning"
        sx={{
          width: "100%",
          padding: "12px",
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}
        onClick={() => handlePaymentMethodChange("Pay Later")}
        startIcon={<Replay sx={{ fontSize: 30 }} />}
      >
        Payer Plus Tard
      </Button>
    </Box>

    {/* Top Action Buttons: Print Order and Apply Discount */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 1.5, // Reduce spacing between buttons to fit in view
        mt: 2,
      }}
    >
      <Button
        variant="outlined"
        color="info"
        sx={{
          width: "48%",
          padding: "8px",
          fontSize: "1.1rem",
          fontWeight: "bold",
        }}
        onClick={handlePrintOrder}
        startIcon={<Print sx={{ fontSize: 25 }} />}
      >
        Imprimer
      </Button>

      <Button
        variant="outlined"
        color="success"
        sx={{
          width: "48%",
          padding: "8px",
          fontSize: "1.1rem",
          fontWeight: "bold",
        }}
        onClick={handleApplyDiscount}
        startIcon={<Discount sx={{ fontSize: 25 }} />}
      >
        Rabais
      </Button>
    </Box>

    {/* Optional Note Input */}
    <TextField
      label="Ajouter une Note (Optionnel)"
      fullWidth
      variant="outlined"
      value={note}
      onFocus={() => handleNoteChange(note)}
      onChange={(e) => setNote(e.target.value)}
      sx={{ mt: 2, mb: 2 }}
    />
  </DialogContent>

  {/* Proceed and Cancel Buttons */}
  <DialogActions
    sx={{
      display: "flex",
      justifyContent: "space-between",
      gap: 1.5,
      paddingY: 2,
    }}
  >
    <Button
      onClick={() => handlePaymentMethodChange("Proceed")}
      variant="contained"
      color="primary"
      sx={{
        width: "48%",
        padding: "10px",
        fontSize: "1.2rem",
        fontWeight: "bold",
      }}
    >
      Procéder
    </Button>

    <Button
      onClick={() => setOpenPaymentDialog(false)}
      color="inherit"
      variant="outlined"
      sx={{
        width: "48%",
        padding: "10px",
        fontSize: "1.2rem",
        fontWeight: "bold",
      }}
    >
      Annuler
    </Button>
  </DialogActions>
</Dialog>

      {/* Cash Payment Dialog */}
      <Dialog
  open={openCashPaymentDialog}
  onClose={handleCloseCashPaymentDialog}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center' }}>
    Paiement en espèces
  </DialogTitle>
  <DialogContent dividers>
    {/* Display total amount */}
    <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
      Total à payer : {calculateTotalPrice().toFixed(2)} CFA
    </Typography>

    {/* Display amount received */}
    <Typography
      variant="h4"
      sx={{ textAlign: 'center', mb: 2, color: 'green' }}
    >
      Montant reçu : {amountPaid.toFixed(2)} CFA
    </Typography>

    {/* Display change due */}
    <Typography
      variant="h4"
      sx={{ textAlign: 'center', mb: 2, color: 'blue' }}
    >
      Monnaie à rendre : {changeDue.toFixed(2)} CFA
    </Typography>

    {/* Calculator Keypad */}
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
      <Grid container spacing={2} sx={{ maxWidth: 350 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '00', '000'].map((num, index) => (
          <Grid item xs={4} key={index}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => handleKeyPress(num.toString())}
              sx={{ fontSize: '1.8rem', py: 2, fontWeight: 'bold' }}
            >
              {num}
            </Button>
          </Grid>
        ))}
        {/* Clear Button */}
        <Grid item xs={4}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => handleKeyPress('clear')}
            sx={{ fontSize: '1.8rem', py: 2, color: 'red', fontWeight: 'bold' }}
          >
            C
          </Button>
        </Grid>

        {/* Delete Button */}
        <Grid item xs={4}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => handleKeyPress('delete')}
            sx={{ fontSize: '1.8rem', py: 2, color: 'red', fontWeight: 'bold' }}
          >
            &larr;
          </Button>
        </Grid>
      </Grid>
    </Box>
  </DialogContent>
  <DialogActions sx={{ justifyContent: 'space-between', padding: 3 }}>
    <Button
      onClick={handleCloseCashPaymentDialog}
      color="secondary"
      variant="outlined"
      sx={{
        fontWeight: 'bold',
        fontSize: '1.2rem',
        padding: '10px 20px',
      }}
    >
      Annuler
    </Button>
    <Button
      onClick={handleConfirmCashPayment}
      variant="contained"
      color="primary"
      sx={{
        fontWeight: 'bold',
        fontSize: '1.2rem',
        padding: '10px 20px',
      }}
      disabled={amountPaid < calculateTotalPrice()}
    >
      Confirmer le paiement
    </Button>
  </DialogActions>
      </Dialog>


    </Container>
  );
};

export default Order;
