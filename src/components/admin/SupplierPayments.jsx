import React from 'react';

const SupplierPayments = () => {
    const suppliers = [
        { id: 1, name: 'Fournisseur A', amount: '200.00€' },
        { id: 2, name: 'Fournisseur B', amount: '500.00€' },
    ];

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Paiement Fournisseurs</h1>
            <table className="table table-hover">
                <thead className="thead-dark">
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Montant</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {suppliers.map(supplier => (
                        <tr key={supplier.id}>
                            <td>{supplier.id}</td>
                            <td>{supplier.name}</td>
                            <td>{supplier.amount}</td>
                            <td>
                                <button className="btn btn-primary" onClick={() => alert(`Paiement effectué pour le fournisseur ${supplier.id}`)}>
                                    Payer
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SupplierPayments;
