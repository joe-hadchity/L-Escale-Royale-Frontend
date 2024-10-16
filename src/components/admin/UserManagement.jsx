import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Select, InputLabel, FormControl, Typography } from '@mui/material';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('admin');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [id, setId] = useState(''); // Add an ID field for handling login

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const apiUrl = `${process.env.REACT_APP_API_URL}/User/GetAllUsers`;
      const response = await axios.get(apiUrl);

      console.log('Fetched Users:', response.data);

      const fetchedUsers = Array.isArray(response.data) ? response.data : [];

      if (fetchedUsers.length === 0) {
        setError('No users found.');
      } else {
        const usersList = fetchedUsers.map(user => ({
          id: user.Id, // Assuming 'Id' is used for unique identification
          username: user.Username,
          role: user.Role,
        }));
        setUsers(usersList);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users.');
      setLoading(false);
    }
  };

  const handleShowModal = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setUsername(user.username);
      setRole(user.role);
      setPin('');
      setConfirmPin('');
    } else {
      setCurrentUser(null);
      setUsername('');
      setRole('admin');
      setPin('');
      setConfirmPin('');
    }
    setShowModal(true);
  };

  const handleSaveUser = async () => {
    if (pin !== confirmPin) {
      alert("Les PINs ne correspondent pas, veuillez réessayer.");
      return;
    }

    const user = { Username: username, Role: role, Pin: pin };

    try {
      if (currentUser) {
        // Update user by ID
        const updateUrl = `${process.env.REACT_APP_API_URL}/User/UpdateUserById/${currentUser.id}`;
        await axios.put(updateUrl, user);
        console.log(`User updated: ${currentUser.id}`);
      } else {
        // Create new user
        const createUrl = `${process.env.REACT_APP_API_URL}/User/CreateUser`;
        const response = await axios.post(createUrl, user);
        const createdUser = response.data; // Assuming the backend returns the created user with an id
        
        console.log('User created:', createdUser);
        
        // Add the new user with the generated ID (used later for login) to the state
        setUsers([...users, {
          id: createdUser.Id, // Use the returned id for login
          username: createdUser.Username, // Store for possible reference
          role: createdUser.Role,
          pin: createdUser.Pin // Storing the pin here for demonstration (although sensitive, usually stored hashed)
        }]);
      }
      setShowModal(false);
      fetchUsers(); // Optionally refetch users
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user.');
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const deleteUrl = `${process.env.REACT_APP_API_URL}/User/DeleteUserByUser/${id}`;
      await axios.delete(deleteUrl);
      console.log(`User deleted: ${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user.');
    }
  };

  const handleLogin = async (id, pin) => {
    try {
      const loginUrl = `${process.env.REACT_APP_API_URL}/User/Login`;
      const response = await axios.post(loginUrl, { id, pin }); // Login with id and pin
      console.log('Login successful', response.data);
      // Proceed with login actions...
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed, please check your ID and PIN.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 4 }}>
        Gestion des Utilisateurs
      </Typography>

      <Button variant="contained" color="primary" onClick={() => handleShowModal(null)} sx={{ marginBottom: 4 }}>
        Ajouter un utilisateur
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nom d'utilisateur</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Button variant="outlined" color="info" onClick={() => handleShowModal(user)} sx={{ marginRight: 2 }}>
                    Modifier
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => handleDeleteUser(user.id)}>
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal for Add/Update User */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>{currentUser ? 'Mettre à jour' : 'Ajouter'} l'utilisateur</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
            <TextField
              label="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Rôle</InputLabel>
              <Select value={role} onChange={(e) => setRole(e.target.value)}>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="PIN"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              fullWidth
            />
            <TextField
              label="Confirmez le PIN"
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)} color="secondary">
            Fermer
          </Button>
          <Button onClick={handleSaveUser} variant="contained" color="primary">
            {currentUser ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
