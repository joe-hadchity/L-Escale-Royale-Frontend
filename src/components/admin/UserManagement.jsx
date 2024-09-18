import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress'; // Import Material UI CircularProgress
import Box from '@mui/material/Box'; // Import Box from Material UI for layout
import { Button, Modal, Form } from 'react-bootstrap'; // Import Bootstrap components

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true); // Track loading state
    const [error, setError] = useState(null); // Track error state
    const [showModal, setShowModal] = useState(false); // Show modal for adding/updating user
    const [currentUser, setCurrentUser] = useState(null); // Track current user being added/updated
    const [username, setUsername] = useState('');
    const [role, setRole] = useState(''); // Change role to dropdown value (admin/staff)
    const [pin, setPin] = useState(''); // New pin state
    const [confirmPin, setConfirmPin] = useState(''); // Re-enter pin state

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const apiUrl = `${process.env.REACT_APP_API_URL}/user/GetUser`;
            const response = await axios.get(apiUrl);

            const fetchedUsers = Array.isArray(response.data) ? response.data : [];

            if (fetchedUsers.length === 0) {
                setError('No users found.');
            } else {
                const usersList = fetchedUsers.map(user => ({
                    id: user._id?.$oid || user._id.toString(),
                    name: user.username,
                    role: user.role,
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
            setUsername(user.name);
            setRole(user.role);
            setPin(''); // Reset pin when updating
            setConfirmPin(''); // Reset confirmPin when updating
        } else {
            setCurrentUser(null);
            setUsername('');
            setRole('admin'); // Default to 'admin' for new users
            setPin(''); // Reset pin for new user
            setConfirmPin(''); // Reset confirmPin for new user
        }
        setShowModal(true);
    };

    const handleSaveUser = async () => {
        if (pin !== confirmPin) {
            alert("Les PINs ne correspondent pas, veuillez réessayer."); // Alert if PINs don't match
            return;
        }

        const user = { username, role, pin }; // Include pin in the user object

        try {
            if (currentUser) {
                // Update user
                await axios.put(`${process.env.REACT_APP_API_URL}/user/Update/${currentUser.id}`, user);
            } else {
                // Create user
                await axios.post(`${process.env.REACT_APP_API_URL}/user/Create`, user);
            }
            setShowModal(false);
            fetchUsers(); // Refresh user list
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/user/Delete/${id}`);
            fetchUsers(); // Refresh user list after deletion
        } catch (error) {
            console.error('Error deleting user:', error);
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
        return <p>{error}</p>;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Gestion des Utilisateurs</h1>

            {/* Button to Add User */}
            <Button variant="primary" onClick={() => handleShowModal(null)} className="mb-3">
                Ajouter un utilisateur
            </Button>

            <table className="table table-hover">
                <thead className="thead-dark">
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Rôle</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.role}</td>
                            <td>
                                <Button variant="info" onClick={() => handleShowModal(user)}>
                                    Modifier
                                </Button>{' '}
                                <Button variant="danger" onClick={() => handleDeleteUser(user.id)}>
                                    Supprimer
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal for Add/Update User */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{currentUser ? 'Mettre à jour' : 'Ajouter'} l'utilisateur</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formUsername">
                            <Form.Label>Nom d'utilisateur</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Entrez le nom d'utilisateur"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formRole" className="mt-3">
                            <Form.Label>Rôle</Form.Label>
                            <Form.Select
                                value={role}
                                onChange={(e) => setRole(e.target.value)} // Set role to 'admin' or 'staff'
                            >
                                <option value="admin">Admin</option>
                                <option value="staff">Staff</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="formPin" className="mt-3">
                            <Form.Label>PIN</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Entrez le PIN"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)} // Handle PIN input
                            />
                        </Form.Group>
                        <Form.Group controlId="formConfirmPin" className="mt-3">
                            <Form.Label>Confirmez le PIN</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Réentrez le PIN"
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value)} // Handle re-entering PIN
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Fermer
                    </Button>
                    <Button variant="primary" onClick={handleSaveUser}>
                        {currentUser ? 'Mettre à jour' : 'Ajouter'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserManagement;
