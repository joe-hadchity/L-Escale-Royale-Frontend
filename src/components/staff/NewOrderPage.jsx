import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../common/PageHeader';

const categoriesData = [
    'Entrées', 'Plats Principaux', 'Desserts', 'Boissons', 
    'Pizzas', 'Pâtes', 'Salades', 'Grillades', 'Sandwiches', 'Soupes', 'Végétarien'
];

const ingredientOptions = [
    { name: 'Tomatoes', price: 0, removable: true },
    { name: 'Olives', price: 1, removable: true },
    { name: 'Mushrooms', price: 0, removable: true },
    { name: 'Cheese', price: 2, removable: true },
    { name: 'Bacon', price: 2, removable: true },
    { name: 'Lettuce', price: 0, removable: true }
];

const itemsData = {
    Entrées: [
        { id: 1, name: 'Salade', price: 5 },
        { id: 2, name: 'Soupe', price: 4 },
        { id: 3, name: 'Bruschetta', price: 6 },
    ],
    // More categories and items here
};

const NewOrderPage = () => {
    const [selectedCategory, setSelectedCategory] = useState(categoriesData[0]);
    const [cart, setCart] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null); // Item being modified
    const [itemQuantity, setItemQuantity] = useState(1); // Quantity of item
    const [selectedIngredients, setSelectedIngredients] = useState([]); // Ingredients selected
    const [isItemEditing, setIsItemEditing] = useState(false); // Control which section to show
    const navigate = useNavigate();
    const categoriesRef = useRef(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    // Handle item selection
    const handleAddToCart = (item) => {
        setSelectedItem(item);
        setItemQuantity(1);
        setSelectedIngredients([]);
        setIsItemEditing(true); // Switch to item editing section
    };

    // Add or remove ingredients
    const handleAddIngredient = (ingredient) => {
        setSelectedIngredients((prev) => [...prev, ingredient]);
    };

    const handleRemoveIngredient = (ingredient) => {
        setSelectedIngredients((prev) => prev.filter((ing) => ing.name !== ingredient.name));
    };

    const handleIncreaseQuantity = () => {
        setItemQuantity(itemQuantity + 1);
    };

    const handleDecreaseQuantity = () => {
        if (itemQuantity > 1) {
            setItemQuantity(itemQuantity - 1);
        }
    };

    // Submit item to cart
    const handleSubmitItem = () => {
        if (!selectedItem) return;

        const itemToCart = {
            ...selectedItem,
            quantity: itemQuantity,
            ingredients: selectedIngredients
        };

        setCart([...cart, itemToCart]);
        setSelectedItem(null);
        setItemQuantity(1);
        setSelectedIngredients([]);
        setIsItemEditing(false); // Go back to item selection
    };

    // Go back to item selection
    const handleBackToItems = () => {
        setIsItemEditing(false); // Show item selection again
    };

    const handleSubmitOrder = () => {
        console.log('Order submitted with items', cart);
        setCart([]);
        navigate('/'); // Navigate to home or order confirmation page
    };

    // Handle drag start for category scrolling
    const handleMouseDown = (e) => {
        isDragging.current = true;
        startX.current = e.pageX - categoriesRef.current.offsetLeft;
        scrollLeft.current = categoriesRef.current.scrollLeft;
    };

    const handleMouseMove = (e) => {
        if (!isDragging.current) return;
        e.preventDefault();
        const x = e.pageX - categoriesRef.current.offsetLeft;
        const walk = (x - startX.current) * 2;
        categoriesRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    return (
        <div className="container-fluid p-4">
            <PageHeader title="Créer une Nouvelle Commande" className="mb-4 border-bottom pb-2" />
            <button className="btn btn-secondary mb-4" onClick={() => navigate(-1)}>
                Retour
            </button>

            <div className="row">
                {/* Section 1: Select Item */}
                {!isItemEditing && (
                    <div className="col-md-8">
                        {/* Scrollable Category Bar */}
                        <div 
                            className="categories mb-4 d-flex bg-white shadow-sm p-3 rounded" 
                            ref={categoriesRef}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            style={{
                                overflowX: 'hidden', 
                                whiteSpace: 'nowrap', 
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

                        {/* Items Grid */}
                        <div className="items-grid row">
                            {itemsData[selectedCategory]?.map(item => (
                                <div key={item.id} className="col-md-4 mb-4">
                                    <div
                                        className="card h-100 clickable-card shadow-lg border-primary rounded-lg"
                                        onClick={() => handleAddToCart(item)}
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
                )}

                {/* Section 2: Edit Item (Ingredients, Quantity) */}
                {isItemEditing && (
                    <div className="col-md-8">
                        <div className="card p-4 shadow-lg">
                            <button className="btn btn-secondary mb-3" onClick={handleBackToItems}>
                                Retour
                            </button>
                            <h4>{selectedItem.name} - ${selectedItem.price}</h4>
                            <h5>Ingrédients</h5>
                            <div className="row">
                                {ingredientOptions.map(ingredient => (
                                    <div key={ingredient.name} className="col-md-3">
                                        <button
                                            className={`btn ${selectedIngredients.includes(ingredient) ? 'btn-danger' : 'btn-outline-primary'} w-100 mb-2`}
                                            onClick={() =>
                                                selectedIngredients.includes(ingredient)
                                                    ? handleRemoveIngredient(ingredient)
                                                    : handleAddIngredient(ingredient)
                                            }
                                        >
                                            {ingredient.name} {ingredient.price > 0 ? `+ $${ingredient.price}` : ''}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="d-flex justify-content-between align-items-center mt-4">
                                <div>
                                    <button className="btn btn-secondary" onClick={handleDecreaseQuantity}>-</button>
                                    <span className="mx-3">{itemQuantity}</span>
                                    <button className="btn btn-secondary" onClick={handleIncreaseQuantity}>+</button>
                                </div>
                                <button className="btn btn-primary" onClick={handleSubmitItem}>Ajouter au Panier</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cart Section */}
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
                                                onClick={() => setCart(cart.filter(item => item.id !== cartItem.id))}
                                            >
                                                Retirer
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Votre panier est vide</p>
                        )}
                    </div>

                    <button className="btn btn-success w-100" onClick={handleSubmitOrder}>
                        Valider la Commande
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewOrderPage;
