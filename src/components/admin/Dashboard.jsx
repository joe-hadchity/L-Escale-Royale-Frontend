import React from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, ArcElement } from 'chart.js';  // Import necessary chart elements
import PageHeader from '../common/PageHeader';

// Register the necessary chart elements
Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, ArcElement);

const Dashboard = () => {
    // Dummy data for the line chart (e.g., revenue over the past week)
    const lineChartData = {
        labels: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
        datasets: [
            {
                label: 'Revenu (USD)',
                data: [1500, 2000, 1800, 2200, 2700, 3000, 3200],  // Example revenue data
                fill: false,
                borderColor: '#36A2EB',
                tension: 0.1,
            },
        ],
    };

    // Dummy data for category sales (e.g., total sales per category)
    const categorySalesData = {
        labels: ['Salades', 'Pizzas', 'Boissons', 'Desserts'],
        datasets: [
            {
                label: 'Ventes par Catégorie',
                data: [300, 500, 400, 250],  // Example data for category sales
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            },
        ],
    };

    return (
        <div className="container mx-auto p-6">
            {/* Page header */}
            <PageHeader title="Tableau de Bord" />
            
            <div className="row">
                {/* Metrics Cards */}
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm bg-info text-white">
                        <div className="card-body">
                            <h5 className="card-title">Utilisateurs</h5>
                            <p className="card-text">Nombre d'utilisateurs: 120</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm bg-success text-white">
                        <div className="card-body">
                            <h5 className="card-title">Articles Actifs</h5>
                            <p className="card-text">Total Articles Actifs: 75</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm bg-warning text-white">
                        <div className="card-body">
                            <h5 className="card-title">Revenu</h5>
                            <p className="card-text">Total Revenu: $25,000</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Line Chart for Revenue */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Revenu Hebdomadaire</h5>
                            <Line data={lineChartData} />
                        </div>
                    </div>
                </div>

                {/* Pie Chart for Sales by Category */}
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Ventes par Catégorie</h5>
                            <Pie data={categorySalesData} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Top 3 Items by Category Tables */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Top 3 Salades</h5>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Article</th>
                                        <th>Ventes</th>
                                        <th>Revenu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Salade César</td>
                                        <td>100</td>
                                        <td>$800</td>
                                    </tr>
                                    <tr>
                                        <td>Salade Verte</td>
                                        <td>80</td>
                                        <td>$640</td>
                                    </tr>
                                    <tr>
                                        <td>Salade Quinoa</td>
                                        <td>60</td>
                                        <td>$720</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Top 3 Pizzas</h5>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Article</th>
                                        <th>Ventes</th>
                                        <th>Revenu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Pizza Margherita</td>
                                        <td>150</td>
                                        <td>$1,800</td>
                                    </tr>
                                    <tr>
                                        <td>Pizza Pepperoni</td>
                                        <td>120</td>
                                        <td>$1,560</td>
                                    </tr>
                                    <tr>
                                        <td>Pizza Végétarienne</td>
                                        <td>90</td>
                                        <td>$1,440</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Top 3 Boissons</h5>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Article</th>
                                        <th>Ventes</th>
                                        <th>Revenu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Coca Cola</td>
                                        <td>200</td>
                                        <td>$600</td>
                                    </tr>
                                    <tr>
                                        <td>Sprite</td>
                                        <td>150</td>
                                        <td>$450</td>
                                    </tr>
                                    <tr>
                                        <td>Eau Minérale</td>
                                        <td>180</td>
                                        <td>$360</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Top 3 Desserts</h5>
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Article</th>
                                        <th>Ventes</th>
                                        <th>Revenu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Tiramisu</td>
                                        <td>90</td>
                                        <td>$720</td>
                                    </tr>
                                    <tr>
                                        <td>Cheesecake</td>
                                        <td>80</td>
                                        <td>$640</td>
                                    </tr>
                                    <tr>
                                        <td>Mousse au Chocolat</td>
                                        <td>100</td>
                                        <td>$1,000</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
