import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainNav as MainNavComponent } from './MainNav';

export const MainNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active tab based on current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/') return 'home';
    if (path === '/connect') return 'connect';
    if (path === '/match') return 'match';
    if (path === '/forum') return 'forum';
    return 'home';
  };
  
  const handleTabPress = (tab: string) => {
    console.log('MainNav handleTabPress called with tab:', tab);
    switch(tab) {
      case 'home':
        navigate('/dashboard');
        break;
      case 'connect':
        navigate('/connect');
        break;
      case 'match':
        navigate('/match');
        break;
      case 'forum':
        navigate('/forum');
        break;
      default:
        navigate('/dashboard');
    }
  };
  
  return (
    <MainNavComponent 
      activeTab={getActiveTab()}
      onTabPress={handleTabPress}
    />
  );
};

export default MainNav;