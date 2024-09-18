import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../common/PageHeader';

const categoriesData = [
    'Entrées', 'Plats Principaux', 'Desserts', 'Boissons', 
    'Pizzas', 'Pâtes', 'Salades', 'Grillades', 'Sandwiches', 'Soupes', 'Végétarien'
];

const itemsData = {
    Entrées: [
        { id: 1, name: 'Salade', price: 5 },
        { id: 2, name: 'Soupe', price: 4 },
        { id: 3, name: 'Bruschetta', price: 6 },
    ],
    'Plats Principaux': [
        { id: 4, name: 'Poulet Rôti', price: 12 },
        { id: 5, name: 'Steak', price: 15 },
        { id: 6, name: 'Lasagne', price: 14 },
    ],
    Desserts: [
        { id: 7, name: 'Crème Brûlée', price: 6 },
        { id: 8, name: 'Tarte aux Pommes', price: 5 },
        { id: 9, name: 'Tiramisu', price: 7 },
    ],
    Boissons: [
        { id: 10, name: 'Coca-Cola', price: 3 },
        { id: 11, name: 'Eau Minérale', price: 2 },
        { id: 12, name: 'Café', price: 4 },
    ],
    Pizzas: [
        { id: 13, name: 'Margherita', price: 8 },
        { id: 14, name: 'Pepperoni', price: 10 },
    ],
    Pâtes: [
        { id: 15, name: 'Spaghetti Carbonara', price: 12 },
        { id: 16, name: 'Penne Arrabiata', price: 11 },
    ],
    Salades: [
        { id: 17, name: 'Salade César', price: 7 },
    ],
    Grillades: [
        { id: 18, name: 'Brochettes de Poulet', price: 13 },
    ],
    Sandwiches: [
        { id: 19, name: 'Sandwich Thon', price: 5 },
    ],
    Soupes: [
        { id: 20, name: 'Soupe à l’Oignon', price: 6 },
    ],
    Végétarien: [
        { id: 21, name: 'Wrap Végétarien', price: 8 },
    ]
};

const NewOrderPage = () => {
    const [selectedCategory, setSelectedCategory] = useState(categoriesData[0]);
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();
    const categoriesRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const handleAddToCart = (item) => {
        const existingItem = cart.find((cartItem) => cartItem.id === item.id);
        if (existingItem) {
            setCart(cart.map(cartItem =>
                cartItem.id === item.id
                    ? { ...cartItem, quantity: cartItem.quantity + 1 }
                    : cartItem
            ));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const handleRemoveFromCart = (itemId) => {
        setCart(cart.filter(cartItem => cartItem.id !== itemId));
    };

    const handleIncreaseQuantity = (itemId) => {
        setCart(cart.map(cartItem =>
            cartItem.id === itemId
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
        ));
    };

    const handleDecreaseQuantity = (itemId) => {
        setCart(cart.map(cartItem =>
            cartItem.id === itemId && cartItem.quantity > 1
                ? { ...cartItem, quantity: cartItem.quantity - 1 }
                : cartItem
        ));
    };

    // Clear entire cart
    const handleClearCart = () => {
        setCart([]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Order submitted with items', cart);
        setCart([]);
    };

    const handleBack = () => {
        navigate(-1);  // Navigate back to the previous page
    };

    // Handle drag start
    const handleMouseDown = (e) => {
        isDragging.current = true;
        startX.current = e.pageX - categoriesRef.current.offsetLeft;
        scrollLeft.current = categoriesRef.current.scrollLeft;
    };

    // Handle drag move
    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        e.preventDefault();
        const x = e.pageX - categoriesRef.current.offsetLeft;
        const walk = (x - startX.current) * 2; // Multiply by 2 to make the scrolling faster
        categoriesRef.current.scrollLeft = scrollLeft.current - walk;
    };

    // Stop dragging
    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleMouseLeave = () => {
        isDragging.current = false;
    };

    return (
        <div className="container-fluid p-4">
            {/* Full-width header with background and border */}
            <PageHeader title="Créer une Nouvelle Commande" className="mb-4 border-bottom pb-2" />

            {/* Back Button */}
            <button className="btn btn-secondary mb-4" onClick={handleBack}>
                Retour
            </button>

            <div className="row">
                {/* Main content: Category buttons and items */}
                <div className="col-md-8">
                    {/* Scrollable (swipeable) Category Bar */}
                    <div 
                        className="categories mb-4 d-flex bg-white shadow-sm p-3 rounded" 
                        ref={categoriesRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            overflowX: 'hidden', 
                            whiteSpace: 'nowrap', 
                            paddingBottom: '10px', 
                            cursor: isDragging.current ? 'grabbing' : 'grab'
                        }}
                    >
                        {categoriesData.map(category => (
                            <button
                                key={category}
                                className={`btn ${selectedCategory === category ? 'btn-info' : 'btn-outline-info'} mx-1`}
                                onClick={() => setSelectedCategory(category)}
                                style={{ padding: '12px 20px', fontSize: '16px', whiteSpace: 'nowrap' }}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Items Grid with improved card style */}
                    <div className="items-grid row">
                        {itemsData[selectedCategory].map(item => (
                            <div key={item.id} className="col-md-4 mb-4">
                                <div
                                    className="card h-100 clickable-card shadow-lg border-primary rounded-lg"
                                    onClick={() => handleAddToCart(item)} // Make the entire card clickable
                                    style={{ cursor: 'pointer', border: '1px solid #007bff', transition: 'transform 0.3s ease-in-out' }}
                                >
                                    <div className="card-body text-center">
                                        <h5 className="card-title">{item.name}</h5>
                                        <p className="card-text">${item.price}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cart Sidebar (fixed size with scroll for items) */}
                <div className="col-md-4 bg-light p-4 border rounded-lg shadow-sm">
                    <h4>Panier</h4>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '10px' }}>
                        {cart.length > 0 ? (
                            <ul className="list-group mb-3">
                                {cart.map(cartItem => (
                                    <li key={cartItem.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        {cartItem.name} (x{cartItem.quantity})
                                        <div>
                                            <button
                                                className="btn btn-sm btn-outline-danger me-2"
                                                onClick={() => handleRemoveFromCart(cartItem.id)}
                                            >
                                                Retirer
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-secondary me-2"
                                                onClick={() => handleDecreaseQuantity(cartItem.id)}
                                            >
                                                -
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => handleIncreaseQuantity(cartItem.id)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Votre panier est vide</p>
                        )}
                    </div>

                    {/* Buttons (fixed) */}
                    <button className="btn btn-danger w-100 mb-3" onClick={handleClearCart}>
                        Vider le Panier
                    </button>
                    <button className="btn btn-success w-100" onClick={handleSubmit}>
                        Soumettre la Commande
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewOrderPage;
