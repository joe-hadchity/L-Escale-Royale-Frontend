import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
  Box,
} from '@mui/material';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';

// Register the necessary chart elements
Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, ArcElement, BarElement);

const Dashboard = () => {
  const [revenueData, setRevenueData] = useState(0);
  const [categoryStats, setCategoryStats] = useState([]);
  const [topItems, setTopItems] = useState([]);

  useEffect(() => {
    // Fetch total revenue
    const fetchTotalRevenue = async () => {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/DashBoard/CreateTotalRevenue`);
        setRevenueData(response.data.TotalGross || 0);
      } catch (error) {
        console.error('Error fetching total revenue:', error);
      }
    };

    // Fetch category stats
    const fetchCategoryStats = async () => {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/DashBoard/CreateCategoryStats`);
        setCategoryStats(response.data);
      } catch (error) {
        console.error('Error fetching category stats:', error);
      }
    };

    // Fetch top items in each category
    const fetchTopItems = async () => {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/DashBoard/CreateTop3ItemInEachCategory`);
        setTopItems(response.data);
      } catch (error) {
        console.error('Error fetching top items:', error);
      }
    };

    fetchTotalRevenue();
    fetchCategoryStats();
    fetchTopItems();
  }, []);

  // Data for Pie Chart: Sales by Category
  const categorySalesData = {
    labels: categoryStats.map((category) => category._id.CategoryName),
    datasets: [
      {
        label: 'Ventes par Catégorie',
        data: categoryStats.map((category) => category.totalCount),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'],
      },
    ],
  };

  // Placeholder data for Revenue Line Chart (you can replace with real data)
  const revenueLineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue Over Time',
        data: [1200, 1900, 3000, 5000, 2300, 4200], // Placeholder revenue data
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        tension: 0.4,
      },
    ],
  };

  // Data for Bar Chart: Top Categories Sales (placeholder)
  const categoryBarData = {
    labels: categoryStats.map((category) => category._id.CategoryName),
    datasets: [
      {
        label: 'Ventes par Catégorie',
        data: categoryStats.map((category) => category.totalCount),
        backgroundColor: '#36A2EB',
      },
    ],
  };

  const topItemsData = topItems.map((category) => ({
    title: `Top 3 ${category._id}`,
    items: category.items.map((item) => ({
      name: item.name,
      sales: item.totalQuantity,
      revenue: item.totalItemPrice,
    })),
  }));

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de Bord
      </Typography>

      <Grid container spacing={4} sx={{ marginBottom: 4 }}>
        {/* Metrics Cards */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ padding: 2, backgroundColor: '#36A2EB', color: '#fff' }}>
            <Typography variant="h6">Revenu Total</Typography>
            <Typography variant="body1">Total Revenu: ${revenueData}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ padding: 2, backgroundColor: '#4CAF50', color: '#fff' }}>
            <Typography variant="h6">Articles Actifs</Typography>
            <Typography variant="body1">Total Articles Actifs: 75</Typography> {/* Placeholder */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ padding: 2, backgroundColor: '#FF6384', color: '#fff' }}>
            <Typography variant="h6">Catégories</Typography>
            <Typography variant="body1">Total Catégories: {categoryStats.length}</Typography> {/* Placeholder */}
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={4} sx={{ marginBottom: 4 }}>
        {/* Line Chart for Revenue Over Time */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Over Time
            </Typography>
            <Line data={revenueLineData} />
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

      {/* Bar Chart for Category Sales */}
      <Grid container spacing={4} sx={{ marginBottom: 4 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ventes par Catégorie (Bar Chart)
            </Typography>
            <Bar data={categoryBarData} />
          </Paper>
        </Grid>
      </Grid>

      {/* Top 3 Items by Category */}
      <Grid container spacing={4}>
        {topItemsData.map((category, index) => (
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
