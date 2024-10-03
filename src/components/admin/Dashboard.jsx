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
import { Line, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, ArcElement } from 'chart.js';

// Register the necessary chart elements
Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [revenueData, setRevenueData] = useState([]);
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

 

  const categorySalesData = {
    labels: categoryStats.map((category) => category._id.CategoryName),
    datasets: [
      {
        label: 'Ventes par Catégorie',
        data: categoryStats.map((category) => category.totalCount),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
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
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ padding: 2, backgroundColor: '#36A2EB', color: '#fff' }}>
            <Typography variant="h6">Revenu Total</Typography>
            <Typography variant="body1">Total Revenu: ${revenueData}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ padding: 2, backgroundColor: '#4CAF50', color: '#fff' }}>
            <Typography variant="h6">Articles Actifs</Typography>
            <Typography variant="body1">Total Articles Actifs: 75</Typography> {/* Placeholder */}
          </Paper>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={4} sx={{ marginBottom: 4 }}>
       
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
