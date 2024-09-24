import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageHeader from '../common/PageHeader'; // Assume this is a custom component

const NewOrderPage = () => {
    const [categories, setCategories] = useState([]); // Categories fetched from API
    const [items, setItems] = useState([]); // Items for the selected category
    const [selectedCategory, setSelectedCategory] = useState(null); // Selected category
    const [cart, setCart] = useState([]); // Cart for storing selected items
    const [selectedItem, setSelectedItem] = useState(null); // Item being edited
    const [itemQuantity, setItemQuantity] = useState(1); // Quantity of the selected item
    const [ingredients, setIngredients] = useState([]); // Ingredients fetched from API
    const [selectedIngredients, setSelectedIngredients] = useState([]); // Selected ingredients for customization
    const [selectedAddOns, setSelectedAddOns] = useState([]); // Selected Add-Ons for customization
    const [isItemEditing, setIsItemEditing] = useState(false); // Control whether we're editing an item
    const navigate = useNavigate();
    const categoriesRef = useRef(null); // Reference for the category scrolling
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    // Fetch categories when component mounts
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/Category/GetAllCategories`);
                setCategories(response.data); // Store fetched categories
                setSelectedCategory(response.data[0]?.Name); // Automatically select the first category
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    // Fetch items based on selected category
    useEffect(() => {
        if (selectedCategory) {
            const fetchItems = async () => {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/Item/GetItemsByCategory/${selectedCategory}`);
                    setItems(response.data);
                } catch (error) {
                    console.error('Error fetching items:', error);
                }
            };

            fetchItems();
        }
    }, [selectedCategory]);

    // Fetch all ingredients from the backend using your controller
    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/Ingredients/GetAllIngredients`);
                setIngredients(response.data); // Store fetched ingredients
            } catch (error) {
                console.error('Error fetching ingredients:', error);
            }
        };

        fetchIngredients();
    }, []);

    // Handle adding an item to the cart
    const handleAddToCart = (item) => {
        setSelectedItem(item);
        setItemQuantity(1);
        setSelectedIngredients([]); // Reset selected ingredients
        setSelectedAddOns([]); // Reset selected add-ons
        setIsItemEditing(true); // Switch to item editing mode
    };

    // Add or remove ingredients
    const handleAddIngredient = (ingredient) => {
        setSelectedIngredients((prev) => [...prev, ingredient]);
    };

    const handleRemoveIngredient = (ingredient) => {
        setSelectedIngredients((prev) => prev.filter((ing) => ing.Name !== ingredient.Name));
    };

    // Add or remove Add-Ons
    const handleAddOn = (addOn) => {
        setSelectedAddOns((prev) => [...prev, addOn]);
    };

    const handleRemoveAddOn = (addOn) => {
        setSelectedAddOns((prev) => prev.filter((addon) => addon.Name !== addOn.Name));
    };

    // Handle increasing/decreasing item quantity
    const handleIncreaseQuantity = () => setItemQuantity((prev) => prev + 1);
    const handleDecreaseQuantity = () => setItemQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    // Handle submitting the item to cart
    const handleSubmitItem = () => {
        const itemToCart = {
            ...selectedItem,
            quantity: itemQuantity,
            ingredients: selectedIngredients,
            addOns: selectedAddOns // Add selected Add-Ons to the cart
        };

        setCart([...cart, itemToCart]);
        resetSelection();
    };

    // Reset item selection
    const resetSelection = () => {
        setSelectedItem(null);
        setItemQuantity(1);
        setSelectedIngredients([]);
        setSelectedAddOns([]);
        setIsItemEditing(false); // Return to item selection mode
    };

    // Handle submitting the entire order
    const handleSubmitOrder = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/Order/CreateOrder`, {
                items: cart,
            });
            console.log('Order created:', response.data);
            setCart([]); // Clear the cart after submission
            navigate('/'); // Redirect after successful order creation
        } catch (error) {
            console.error('Error submitting order:', error);
        }
    };

    // Handle category scrolling
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
                {/* Section 1: Select Category and Item */}
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
                            {categories.map((category) => (
                                <button
                                    key={category.Name}
                                    className={`btn ${selectedCategory === category.Name ? 'btn-info' : 'btn-outline-info'} mx-1`}
                                    onClick={() => setSelectedCategory(category.Name)}
                                    style={{ padding: '12px 20px', fontSize: '16px', whiteSpace: 'nowrap' }}
                                >
                                    {category.Name}
                                </button>
                            ))}
                        </div>

                        {/* Items Grid */}
                        <div className="items-grid row">
                            {items.map((item) => (
                                <div key={item.Id} className="col-md-4 mb-4">
                                    <div
                                        className="card h-100 clickable-card shadow-lg border-primary rounded-lg"
                                        onClick={() => handleAddToCart(item)}
                                        style={{ cursor: 'pointer', border: '1px solid #007bff', transition: 'transform 0.3s ease-in-out' }}
                                    >
                                        <div className="card-body text-center">
                                            <h5 className="card-title">{item.Name}</h5>
                                            <p className="card-text">{item.PriceDineIn} €</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section 2: Edit Item */}
                {isItemEditing && (
                    <div className="col-md-8">
                        <div className="card p-4 shadow-lg">
                            <button className="btn btn-secondary mb-3" onClick={resetSelection}>
                                Retour
                            </button>
                            <h4>{selectedItem.Name} - {selectedItem.PriceDineIn} €</h4>
                            <h5>Ingrédients</h5>
                            <div className="row">
                                {ingredients.map((ingredient) => (
                                    <div key={ingredient.Name} className="col-md-3">
                                        <button
                                            className={`btn ${selectedIngredients.includes(ingredient) ? 'btn-danger' : 'btn-outline-primary'} w-100 mb-2`}
                                            onClick={() =>
                                                selectedIngredients.includes(ingredient)
                                                    ? handleRemoveIngredient(ingredient)
                                                    : handleAddIngredient(ingredient)
                                            }
                                        >
                                            {ingredient.Name} {ingredient.Price > 0 ? `+ ${ingredient.Price} €` : ''}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <h5 className="mt-4">Ajouter des Add-Ons</h5>
                            <div className="row">
                                {ingredients.map((addOn) => (
                                    <div key={addOn.Name} className="col-md-3">
                                        <button
                                            className={`btn ${selectedAddOns.includes(addOn) ? 'btn-danger' : 'btn-outline-success'} w-100 mb-2`}
                                            onClick={() =>
                                                selectedAddOns.includes(addOn)
                                                    ? handleRemoveAddOn(addOn)
                                                    : handleAddOn(addOn)
                                            }
                                        >
                                            {addOn.Name} + {addOn.Price} €
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
                                {cart.map((cartItem, index) => (
                                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                        {cartItem.Name} (x{cartItem.quantity})
                                        <div>
                                            <button
                                                className="btn btn-sm btn-outline-danger me-2"
                                                onClick={() => setCart(cart.filter((item) => item !== cartItem))}
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
