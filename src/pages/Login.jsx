import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/l-escale-royale-logo.png'; // Adjust the import to your logo path

const Login = () => {
    const { login } = useContext(AuthContext); // Only get the login function from context
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: '', pin: '' }); // Form input for username and pin
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value }); // Update form inputs
    };

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent form default behavior

        const success = await login(credentials.username, credentials.pin); // Call the login function from AuthContext

        if (success) { 
            // Since login was successful, we can use success.user directly
            if (success.role === 'admin') {
                navigate('/admin', { replace: true });
            } else if (success.role === 'staff') {
                navigate('/staff', { replace: true });
            }
        } else {
            // If login fails, set an error message
            setError('Identifiants incorrects');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="login-container p-5 bg-white shadow-lg rounded" style={{ maxWidth: '400px', width: '100%' }}>
                {/* Logo */}
                <div className="text-center mb-4">
                    <img src={logo} alt="Logo" className="img-fluid" style={{ width: '150px' }} />
                </div>

                <h2 className="text-center mb-4">Connexion</h2>

                {/* Login Form */}
                <form onSubmit={handleLogin}>
                    <div className="form-group mb-3">
                        <label htmlFor="username">Nom d'utilisateur</label>
                        <input
                            type="text"
                            name="username"
                            className="form-control"
                            value={credentials.username}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label htmlFor="pin">PIN</label>
                        <input
                            type="password"
                            name="pin"
                            className="form-control"
                            value={credentials.pin}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    {error && <div className="alert alert-danger">{error}</div>}

                    <button type="submit" className="btn btn-primary w-100">Connexion</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
