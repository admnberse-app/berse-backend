import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import {
  Close,
  Store,
  TrendingUp,
  AttachMoney,
  Inventory,
  Star,
  Add,
} from '@mui/icons-material';
import styled from 'styled-components';

interface SellerDashboardModalProps {
  open: boolean;
  onClose: () => void;
}

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 16px;
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
  }
`;

const StatCard = styled(Card)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
`;

const SellerDashboardModal: React.FC<SellerDashboardModalProps> = ({
  open,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState(0);

  // Mock seller stats
  const sellerStats = {
    totalRevenue: 12450,
    totalProducts: 45,
    activeListings: 38,
    soldProducts: 127,
    avgRating: 4.8,
    totalReviews: 89,
    responseRate: 95,
    responseTime: '2 hours'
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderOverview = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <StatCard>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AttachMoney sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    RM {sellerStats.totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <StatCard>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Inventory sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {sellerStats.activeListings}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Active Listings
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Star color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {sellerStats.avgRating}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Average Rating ({sellerStats.totalReviews} reviews)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUp color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {sellerStats.soldProducts}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Products Sold
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          Your seller dashboard is coming soon! This will include detailed analytics, 
          order management, inventory tracking, and performance insights to help grow your business.
        </Typography>
      </Alert>
    </Box>
  );

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Store color="primary" />
            <Typography variant="h6">Seller Dashboard</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Overview" />
          <Tab label="Products" />
          <Tab label="Orders" />
          <Tab label="Analytics" />
        </Tabs>

        {activeTab === 0 && renderOverview()}
        {activeTab === 1 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" gutterBottom>
              Product Management
            </Typography>
            <Typography color="text.secondary" paragraph>
              Manage your product listings, inventory, and pricing
            </Typography>
            <Button variant="contained" startIcon={<Add />}>
              Add New Product
            </Button>
          </Box>
        )}
        {activeTab === 2 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" gutterBottom>
              Order Management
            </Typography>
            <Typography color="text.secondary" paragraph>
              Track and manage your orders, shipping, and customer communications
            </Typography>
          </Box>
        )}
        {activeTab === 3 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" gutterBottom>
              Analytics & Insights
            </Typography>
            <Typography color="text.secondary" paragraph>
              View detailed performance metrics and sales analytics
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default SellerDashboardModal;