import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import logo from '../assets/l-escale-royale-logo.png';
import Cookies from 'js-cookie'; 
import axios from 'axios'; 

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ username: '', pin: '' });
    const [error, setError] = useState(null);

    // Get the API URL from the .env file and append the login route directly
    const apiUrl = `${process.env.REACT_APP_API_URL}/auth/login`;

    const handleInputChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const extractValueFromResponse = (responseString, key) => {
        const regex = new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`);
        const match = responseString.match(regex);
        return match ? match[1] : null;
    };

    const handleLogin = async (e) => {
        e.preventDefault(); 

        try {
            const response = await axios.post(apiUrl, {
                Username: credentials.username, 
                Pin: credentials.pin,
            });

            if (response.status === 200) {
                const responseString = response.data;
                console.log('Raw response:', responseString);

                // Manually extract values from the stringified response
                const username = extractValueFromResponse(responseString, "Username");
                const role = extractValueFromResponse(responseString, "Role");

                console.log('Extracted username:', username);
                console.log('Extracted role:', role);

                // Set user cookie after successful login
                Cookies.set('user', JSON.stringify({ username, role }), { expires: 1 });

                // Navigate based on role
                if (role === 'admin') {
                    navigate('/admin', { replace: true });
                } else if (role === 'staff') {
                    navigate('/staff', { replace: true });
                }
            } else {
                setError('Identifiants incorrects');
            }
        } catch (err) {
            setError(err.response?.data?.Message || 'An error occurred. Please try again.');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="login-container p-5 bg-white shadow-lg rounded" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="text-center mb-4">
                    <img src={logo} alt="Logo" className="img-fluid" style={{ width: '150px' }} />
                </div>
                <h2 className="text-center mb-4">Connexion</h2>
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
