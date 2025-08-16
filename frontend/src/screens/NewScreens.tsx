// New Advanced Screens - Used when VITE_USE_NEW_SCREENS=true
import React from 'react';
import Dashboard from '../pages/Dashboard';
import BerseConnect from '../pages/BerseConnect';
import BerseMatch from '../pages/BerseMatch';
import BerseMarket from '../pages/BerseMarket';

// Advanced New Screens with full functionality
export const NewDashboardScreen: React.FC = () => {
  return <Dashboard />;
};

export const NewBerseConnectScreen: React.FC = () => {
  return <BerseConnect />;
};

export const NewBerseMatchScreen: React.FC = () => {
  return <BerseMatch />;
};

export const NewBerseMarketScreen: React.FC = () => {
  return <BerseMarket />;
};