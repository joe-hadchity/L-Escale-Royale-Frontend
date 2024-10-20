// Cart.jsx

import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  IconButton,
  Divider,
  Button,
} from "@mui/material";
import { Delete, AddCircle, RemoveCircle } from "@mui/icons-material";

const Cart = ({
  cart,
  orderNumber,
  onQuantityChange,
  onRemoveItem,
  calculateTotalPrice,
  onPlaceOrder,
  orderType,
  tableNumber,
  calculateItemPrice,
  requestDeleteAuthorization,
}) => (
  <Box>
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
          Table: {tableNumber || "N/A"}
        </Typography>
      )}
    </Box>

    {cart.length === 0 ? (
      <Typography color="textSecondary" textAlign="center">
        Your cart is empty
      </Typography>
    ) : (
      <>
        <Box sx={{ maxHeight: "60vh", overflowY: "auto", padding: "8px" }}>
          <List dense>
            {cart.map((cartItem, index) => (
              <React.Fragment key={`cart-item-${cartItem._id || index}`}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    marginBottom: 1,
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {cartItem.Name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Type: {cartItem.TypeItem || orderType}
                    </Typography>

                    {/* Display Price or "On the House" */}
                    <Typography variant="body2">
                      {cartItem.isOnTheHouse ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>
                          On the House
                        </span>
                      ) : (
                        `${calculateItemPrice(cartItem)} CFA x ${
                          cartItem.quantity
                        }`
                      )}
                    </Typography>

                    {/* Display Removals */}
                    {cartItem.removals && cartItem.removals.length > 0 && (
                      <Typography variant="body2" color="error">
                        Removals: {cartItem.removals.join(", ")}
                      </Typography>
                    )}

                    {/* Display Add-ons */}
                    {cartItem.addOns && cartItem.addOns.length > 0 && (
                      <Typography variant="body2" color="primary">
                        Add-ons:{" "}
                        {cartItem.addOns.map((addOn, index) => (
                          <span key={index}>
                            {addOn.Name} ({addOn.Price} CFA)
                            {index < cartItem.addOns.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </Typography>
                    )}

                    {/* Display Note */}
                    {cartItem.note && cartItem.note.trim() !== "" && (
                      <Typography variant="body2" color="textSecondary">
                        Note: {cartItem.note}
                      </Typography>
                    )}
                  </Box>

                  {/* Quantity Controls and Delete Button */}
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    {/* Quantity Controls */}
                    {!cartItem.isExistingItem ? (
                      <>
                        <IconButton
                          aria-label="decrease"
                          onClick={() => onQuantityChange(cartItem, "decrease")}
                          disabled={cartItem.quantity <= 1}
                        >
                          <RemoveCircle />
                        </IconButton>
                        <Typography variant="body1" sx={{ mx: 1 }}>
                          {cartItem.quantity}
                        </Typography>
                        <IconButton
                          aria-label="increase"
                          onClick={() => onQuantityChange(cartItem, "increase")}
                        >
                          <AddCircle />
                        </IconButton>
                      </>
                    ) : (
                      <Typography variant="body1" sx={{ mx: 1 }}>
                        Quantity: {cartItem.quantity}
                      </Typography>
                    )}

                    {/* Conditionally render Delete Button for new items */}
                    {!cartItem.isExistingItem && (
                      <IconButton
                        aria-label="delete"
                        onClick={() => requestDeleteAuthorization(cartItem)}
                        sx={{ color: "red" }}
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Box>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Total Amount */}
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
          onClick={onPlaceOrder}
        >
          Place Order
        </Button>
      </>
    )}
  </Box>
);

export default React.memo(Cart);
