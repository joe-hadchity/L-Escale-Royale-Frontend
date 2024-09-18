import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress'; // Import Material UI CircularProgress
import Box from '@mui/material/Box'; // Import Box from Material UI for layout

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true); // Track loading state
    const [error, setError] = useState(null); // Track error state

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const apiUrl = `${process.env.REACT_APP_API_URL}/user/GetUser`;
                console.log('API URL:', apiUrl);

                const response = await axios.get(apiUrl);
                console.log('Response from server:', response);

                // Ensure response data is an array, or default to an empty array
                const fetchedUsers = Array.isArray(response.data) ? response.data : [];

                if (fetchedUsers.length === 0) {
                    // Handle case when no users are returned
                    console.warn('No users found.');
                    setError('No users found.');
                } else {
                    // Map over the users and transform them as needed
                    const usersList = fetchedUsers.map(user => {
                        const parsedUser = JSON.parse(user); // Parse each user if necessary
                        return {
                            id: parsedUser._id,
                            name: parsedUser.username,
                            role: parsedUser.role
                        };
                    });

                    console.log('Fetched users:', usersList);
                    setUsers(usersList);
                }

                setLoading(false); // Stop loading once data is fetched
            } catch (err) {
                console.error('Error fetching users:', err); // Log error if request fails
                setError('Failed to fetch users.');
                setLoading(false); // Stop loading if there's an error
            }
        };

        fetchUsers();
    }, []); // Empty dependency array to run only once on component mount

    if (loading) {
        // Display the loader while the data is loading
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
            <table className="table table-hover">
                <thead className="thead-dark">
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Rôle</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.role}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagement;
