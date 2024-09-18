import React from 'react';

const orders = [
    { id: 1, tableNumber: 2, status: 'In Kitchen' },
    { id: 2, tableNumber: 4, status: 'Dining' },
    { id: 3, tableNumber: 7, status: 'Completed' },
    // Add more sample orders
];

const OrderList = () => {
    const handleUpdateOrder = (orderId) => {
        console.log(`Update order ${orderId}`);
        // Implement redirection to an order update page or logic to modify the order
    };

    return (
        <div className="order-list">
            {orders.length > 0 ? (
                <ul className="list-group">
                    {orders.map(order => (
                        <li key={order.id} className="list-group-item d-flex align-items-center justify-content-between mb-3 shadow-sm p-3 bg-white rounded">
                            <div>
                                <h5 className="mb-1">Commande #{order.id} - Table {order.tableNumber}</h5>
                                <p className="mb-0">Status: {order.status}</p>
                            </div>
                            <div>
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => handleUpdateOrder(order.id)}
                                >
                                    Mettre à Jour
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Aucune commande en cours</p>
            )}
        </div>
    );
};

export default OrderList;
