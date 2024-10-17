import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify'; // Assuming you're using toast for notifications

const CustomerNumberDialog = ({ open, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [customerExists, setCustomerExists] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/CustomerNumber/GetCustomerNumberByPhoneNumber/${phoneNumber}`);
      
      if (response.status === 200) {
        const customer = response.data;
        setName(customer.Name || '');
        setLocation(customer.Location || '');
        setDescription(customer.Description || '');
        setCustomerExists(true);
        toast.success('Customer data fetched successfully!');
      } else {
        toast.warn('No customer found, please create a new one.');
        setCustomerExists(false);
        setName('');
        setLocation('');
        setDescription('');
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast.error('Error fetching customer. Try again.');
      setCustomerExists(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdateCustomer = async () => {
    const customerData = {
      Name: name,
      PhoneNumber: phoneNumber,
      Location: location,
      Description: description,
    };

    try {
      if (customerExists) {
        // Update the customer
        await axios.put(`${process.env.REACT_APP_API_URL}/CustomerNumber/UpdateCustomerNumberByName/${phoneNumber}`, customerData);
        toast.success('Customer updated successfully!');
      } else {
        // Create a new customer
        await axios.post(`${process.env.REACT_APP_API_URL}/CustomerNumber/CreateCustomerNumber`, customerData);
        toast.success('Customer created successfully!');
      }
      onClose(); // Close the dialog after creation/updating
    } catch (error) {
      console.error('Error creating/updating customer:', error);
      toast.error('Error processing the request. Try again.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1.5rem' }}>
        {customerExists ? 'Update Customer Information' : 'Create New Customer'}
      </DialogTitle>
      
      <DialogContent dividers sx={{ paddingX: 3, paddingY: 2 }}>
        <Typography variant="subtitle1" sx={{ marginBottom: 2 }}>
          Enter the phone number to fetch existing customer information or create a new customer.
        </Typography>

        {/* Phone Number Field */}
        <TextField
          label="Phone Number"
          fullWidth
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        
        {/* Fetch Button */}
        <Button
          variant="contained"
          onClick={handleFetchCustomer}
          disabled={!phoneNumber || loading}
          sx={{ marginBottom: 2 }}
          fullWidth
        >
          Fetch Customer Data
        </Button>

        {/* Name Field */}
        <TextField
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!customerExists && !phoneNumber}
          sx={{ marginBottom: 2 }}
        />

        {/* Location Field */}
        <TextField
          label="Location"
          fullWidth
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={!customerExists && !phoneNumber}
          sx={{ marginBottom: 2 }}
        />

        {/* Description Field */}
        <TextField
          label="Description"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!customerExists && !phoneNumber}
          sx={{ marginBottom: 2 }}
        />
      </DialogContent>

      <DialogActions>
        {/* Cancel Button */}
        <Button onClick={onClose} color="secondary" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
          Cancel
        </Button>

        {/* Create/Update Button */}
        <Button
          onClick={handleCreateOrUpdateCustomer}
          variant="contained"
          color="primary"
          disabled={!name || !phoneNumber}
          sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}
        >
          {customerExists ? 'Update Customer' : 'Create Customer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Memoize the component
export default React.memo(CustomerNumberDialog);
