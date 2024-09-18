import React from 'react';

const tables = Array.from({ length: 20 }, (_, i) => ({
    tableNumber: i + 1,
    isOccupied: Math.random() > 0.5, // Random occupied status for demo
}));

const TableStatus = () => {
    return (
        <div className="row">
            {tables.map(table => (
                <div key={table.tableNumber} className="col-4 col-md-3 mb-2">
                    <div className={`p-2 text-center rounded ${table.isOccupied ? 'bg-danger' : 'bg-success'} text-white`}>
                        <h6>Table {table.tableNumber}</h6>
                        <p>{table.isOccupied ? 'Occupée' : 'Disponible'}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TableStatus;
