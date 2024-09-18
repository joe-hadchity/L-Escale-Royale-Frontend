import React, { useState } from 'react';

const OrderForm = () => {
    const [tableNumber, setTableNumber] = useState('');
    const [items, setItems] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Order submitted for table', tableNumber, 'with items', items);
        // Reset form
        setTableNumber('');
        setItems('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
                <label htmlFor="tableNumber">Numéro de Table</label>
                <input
                    type="number"
                    className="form-control"
                    id="tableNumber"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    required
                />
            </div>

            <div className="form-group mb-3">
                <label htmlFor="items">Articles Commandés</label>
                <textarea
                    className="form-control"
                    id="items"
                    value={items}
                    onChange={(e) => setItems(e.target.value)}
                    required
                ></textarea>
            </div>

            <button type="submit" className="btn btn-primary">Soumettre la Commande</button>
        </form>
    );
};

export default OrderForm;
