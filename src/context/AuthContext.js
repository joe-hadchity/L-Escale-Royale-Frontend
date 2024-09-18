// AuthContext.js
import React, { createContext, useState } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = async (username, pin) => {
        try {
            // Send the login request to the backend
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/user/login`, {
                username,
                pin
            });

            if (response.status === 200) {
                const loggedInUser = response.data; // Extract user data from the backend response
                setUser(loggedInUser); // Save user data, including role, in state
                return loggedInUser; // Return user data to the login function
            }
        } catch (error) {
            console.error('Login failed:', error); // Log the error
            return false; // Return failure
        }
    };

    const logout = () => {
        setUser(null); // Clear user data on logout
        localStorage.removeItem('user'); // Optionally clear local storage if used
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
