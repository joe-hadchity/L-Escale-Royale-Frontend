import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Box,
} from '@mui/material';
import { Line, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, ArcElement } from 'chart.js';

// Register the necessary chart elements
Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  // Dummy data for the line chart (e.g., revenue over the past week)
  const lineChartData = {
    labels: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
    datasets: [
      {
        label: 'Revenu (USD)',
        data: [1500, 2000, 1800, 2200, 2700, 3000, 3200],
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
        data: [300, 500, 400, 250],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  // Top items data
  const topItems = [
    {
      title: 'Top 3 Salades',
      items: [
        { name: 'Salade César', sales: 100, revenue: 800 },
        { name: 'Salade Verte', sales: 80, revenue: 640 },
        { name: 'Salade Quinoa', sales: 60, revenue: 720 },
      ],
    },
    {
      title: 'Top 3 Pizzas',
      items: [
        { name: 'Pizza Margherita', sales: 150, revenue: 1800 },
        { name: 'Pizza Pepperoni', sales: 120, revenue: 1560 },
        { name: 'Pizza Végétarienne', sales: 90, revenue: 1440 },
      ],
    },
    {
      title: 'Top 3 Boissons',
      items: [
        { name: 'Coca Cola', sales: 200, revenue: 600 },
        { name: 'Sprite', sales: 150, revenue: 450 },
        { name: 'Eau Minérale', sales: 180, revenue: 360 },
      ],
    },
    {
      title: 'Top 3 Desserts',
      items: [
        { name: 'Tiramisu', sales: 90, revenue: 720 },
        { name: 'Cheesecake', sales: 80, revenue: 640 },
        { name: 'Mousse au Chocolat', sales: 100, revenue: 1000 },
      ],
    },
  ];

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de Bord
      </Typography>

      <Grid container spacing={4} sx={{ marginBottom: 4 }}>
        {/* Metrics Cards */}
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ padding: 2, backgroundColor: '#36A2EB', color: '#fff' }}>
            <Typography variant="h6">Utilisateurs</Typography>
            <Typography variant="body1">Nombre d'utilisateurs: 120</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ padding: 2, backgroundColor: '#4CAF50', color: '#fff' }}>
            <Typography variant="h6">Articles Actifs</Typography>
            <Typography variant="body1">Total Articles Actifs: 75</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ padding: 2, backgroundColor: '#FFCE56', color: '#fff' }}>
            <Typography variant="h6">Revenu</Typography>
            <Typography variant="body1">Total Revenu: $25,000</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={4} sx={{ marginBottom: 4 }}>
        {/* Line Chart for Revenue */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenu Hebdomadaire
            </Typography>
            <Line data={lineChartData} />
          </Paper>
        </Grid>

        {/* Pie Chart for Sales by Category */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ventes par Catégorie
            </Typography>
            <Pie data={categorySalesData} />
          </Paper>
        </Grid>
      </Grid>

      {/* Top 3 Items by Category */}
      <Grid container spacing={4}>
        {topItems.map((category, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Paper elevation={3} sx={{ padding: 2 }}>
              <Typography variant="h6" gutterBottom>
                {category.title}
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Article</TableCell>
                      <TableCell>Ventes</TableCell>
                      <TableCell>Revenu</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {category.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.sales}</TableCell>
                        <TableCell>{`$${item.revenue}`}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
