import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';  // Import useNavigate and useLocation
import logo from '../../assets/l-escale-royale-logo.png';  // Correct logo path

const Sidebar = () => {
    const navigate = useNavigate();  // Initialize navigation
    const location = useLocation();  // Get the current route
    const [activeItem, setActiveItem] = useState(location.pathname);  // Track the active item

    // Handle logo click to redirect to homeAdmin
    const handleLogoClick = () => {
        navigate('/admin/');
    };

    // Handle item click and set active item
    const handleItemClick = (path) => {
        setActiveItem(path);  // Update active state
        navigate(path);  // Navigate to the clicked path
    };

    return (
        <aside 
            className="bg-light text-dark vh-100 d-flex flex-column p-4 shadow-lg sticky-top"  // Added 'sticky-top' for sticky behavior
            style={{
                borderRadius: '15px',  // Smoother, more rounded corners
                minWidth: '250px',  // Fixed width for sidebar
                top: '0',  // Keep at the top of the screen
                zIndex: 1000,  // Ensure it's above other content
                background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',  // Subtle gradient background
            }}
        >
            {/* Logo Section */}
            <div className="text-center mb-5">
                <img 
                    src={logo} 
                    alt="L'Escale Royale Logo" 
                    className="img-fluid"  
                    style={{ 
                        maxWidth: "150px", 
                        objectFit: "contain", 
                        // boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',  // Shadow for logo depth
                        borderRadius: '0%',  // Circular logo
                        cursor: 'pointer'  // Cursor pointer to indicate clickable
                    }}  
                    onClick={handleLogoClick}  // Redirect to homeAdmin on logo click
                />
            </div>

            {/* Navigation Menu */}
            <ul className="nav flex-column gap-3">
                {/* Dashboard */}
                <li 
                    className={`nav-item p-3 rounded ${activeItem === '/admin/dashboard' ? 'bg-info text-white' : 'bg-white text-dark border border-light shadow-sm'}`} 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => handleItemClick('/admin/dashboard')}
                >
                    Tableau de Bord
                </li>

                {/* User Management */}
                <li 
                    className={`nav-item p-3 rounded ${activeItem === '/admin/user-management' ? 'bg-info text-white' : 'bg-white text-dark border border-light shadow-sm'}`} 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => handleItemClick('/admin/user-management')}
                >
                    Gestion des Utilisateurs
                </li>

                {/* Item Management */}
                <li 
                    className={`nav-item p-3 rounded ${activeItem === '/admin/item-management' ? 'bg-info text-white' : 'bg-white text-dark border border-light shadow-sm'}`} 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => handleItemClick('/admin/item-management')}
                >
                    Gestion du Menu
                </li>

                {/* Category Management */}
                <li 
                    className={`nav-item p-3 rounded ${activeItem === '/admin/category-management' ? 'bg-info text-white' : 'bg-white text-dark border border-light shadow-sm'}`} 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => handleItemClick('/admin/category-management')}
                >
                    Gestion des Catégories
                </li>

                {/* History */}
                <li 
                    className={`nav-item p-3 rounded ${activeItem === '/admin/history' ? 'bg-info text-white' : 'bg-white text-dark border border-light shadow-sm'}`} 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => handleItemClick('/admin/history')}
                >
                    Historique
                </li>

                {/* Supplier Payments */}
                <li 
                    className={`nav-item p-3 rounded ${activeItem === '/admin/supplier-payments' ? 'bg-info text-white' : 'bg-white text-dark border border-light shadow-sm'}`} 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => handleItemClick('/admin/supplier-payments')}
                >
                    Paiement Fournisseur
                </li>

                {/* Logout */}
                <li
    className={`nav-item p-3 rounded ${activeItem === '/admin/logout' 
        ? 'bg-danger text-white'  // Selected: red background, white text
        : 'bg-white text-danger border border-danger'}  // Not selected: white background, red text, red border
        ${activeItem !== '/admin/logout' ? 'hover:bg-danger hover:text-white' : ''}`}  // Hover effect: red background, white text
    style={{ cursor: 'pointer', borderWidth: '2px' }}  // Thicker border
    onClick={() => handleItemClick('/admin/logout')}
>
    Déconnexion
</li>

            </ul>
        </aside>
    );
};

export default Sidebar;
