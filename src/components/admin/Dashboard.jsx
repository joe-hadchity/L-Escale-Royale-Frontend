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
  Divider,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
} from '@mui/material';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';

// Register necessary chart elements
Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, ArcElement, BarElement);

const Dashboard = () => {
  const [revenueData, setRevenueData] = useState(0);
  const [categoryStats, setCategoryStats] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [grossByDate, setGrossByDate] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    // Fetch total revenue by date for the line chart
    const fetchGrossByDate = async () => {
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/DashBoard/CreateTotalRevenueByDate`);
        setGrossByDate(response.data);
      } catch (error) {
        console.error('Error fetching gross by date:', error);
      }
    };

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

    fetchGrossByDate();
    fetchTotalRevenue();
    fetchCategoryStats();
    fetchTopItems();
  }, []);

  // Data for Line Chart: Gross by Date
  const grossByDateLineData = {
    labels: grossByDate.map((entry) => new Date(entry._id).toLocaleDateString()), // Format dates to a readable format
    datasets: [
      {
        label: 'Gross Over Time',
        data: grossByDate.map((entry) => entry.TotalGross),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        tension: 0.4,
      },
    ],
  };

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

  // Data for Bar Chart: Top Categories Sales
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

  // Handle category selection for top items display
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const selectedTopItems = topItems.find((category) => category._id === selectedCategory)?.items || [];

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Tableau de Bord
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Metrics Section */}
      <Grid container spacing={4} sx={{ marginBottom: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ padding: 3, backgroundColor: '#36A2EB', color: '#fff' }}>
            <Typography variant="h6">Revenu Total</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>${revenueData}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ padding: 3, backgroundColor: '#4CAF50', color: '#fff' }}>
            <Typography variant="h6">Articles Actifs</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>75</Typography> {/* Placeholder */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ padding: 3, backgroundColor: '#FF6384', color: '#fff' }}>
            <Typography variant="h6">Catégories</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{categoryStats.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Line Chart for Gross Over Time */}
      <Grid container spacing={4} sx={{ marginBottom: 4 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              Gross Over Time
            </Typography>
            <Line data={grossByDateLineData} />
          </Paper>
        </Grid>
      </Grid>

      {/* Pie and Bar Charts */}
      <Grid container spacing={4} sx={{ marginBottom: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ventes par Catégorie
            </Typography>
            <Pie data={categorySalesData} />
          </Paper>
        </Grid>

        {/* Bar Chart for Category Sales */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ventes par Catégorie (Bar Chart)
            </Typography>
            <Bar data={categoryBarData} />
          </Paper>
        </Grid>
      </Grid>

      {/* Dropdown to Select Category and Display Top Items */}
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top 3 Items by Category
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="category-select-label">Select Category</InputLabel>
              <Select
                labelId="category-select-label"
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Select Category"
              >
                {topItems.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category._id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Display Top Items for Selected Category */}
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
                  {selectedTopItems.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.totalQuantity}</TableCell>
                      <TableCell>{`$${item.totalItemPrice}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
