import { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { 
  theme, 
  GlobalStyles,
  StatusBar,
  Header,
  MainNav,
  Button,
  TextField,
  Card,
  Points
} from './index';
import type { NavTab, HeaderState } from './index';

/**
 * Example App demonstrating all BerseMuka UI components
 * This shows how to integrate the component library in a real application
 */
export const App = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('Home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
  };
  
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      
      {/* Status Bar */}
      <StatusBar time="3:14 PM" />
      
      {/* Header */}
      <Header 
        state={activeTab as HeaderState}
        onMenuClick={() => console.log('Menu clicked')}
        onNotificationClick={() => console.log('Notifications clicked')}
      />
      
      {/* Main Content Area */}
      <main style={{ 
        padding: '20px',
        paddingBottom: '120px', // Account for MainNav
        minHeight: 'calc(100vh - 110px)' // Account for StatusBar + Header
      }}>
        {activeTab === 'Home' && (
          <>
            {/* Points Card */}
            <Points 
              points={2450}
              label="Your Points"
              size="large"
              showCard
              showRewardsLink
              onRewardsClick={() => console.log('Navigate to rewards')}
            />
            
            {/* Event Cards */}
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Card clickable onClick={() => console.log('Event clicked')}>
                <h3 style={{ marginBottom: '8px' }}>Friday Prayer</h3>
                <p style={{ color: theme.colors.neutral.gray, marginBottom: '16px' }}>
                  Join us for congregational prayers
                </p>
                <Button size="small" variant="secondary">
                  View Details
                </Button>
              </Card>
              
              <Card clickable onClick={() => console.log('Event clicked')}>
                <h3 style={{ marginBottom: '8px' }}>Community Iftar</h3>
                <p style={{ color: theme.colors.neutral.gray, marginBottom: '16px' }}>
                  Break fast together with the community
                </p>
                <Button size="small" variant="secondary">
                  Register Now
                </Button>
              </Card>
            </div>
          </>
        )}
        
        {activeTab === 'Profile' && (
          <>
            {/* Profile Card */}
            <Card padding="large">
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.deepGreen.quaternary,
                  margin: '0 auto 16px'
                }} />
                <h2 style={{ marginBottom: '8px' }}>Ahmad Ibrahim</h2>
                <p style={{ color: theme.colors.neutral.gray }}>
                  Member since January 2024
                </p>
              </div>
            </Card>
            
            {/* Login Form Example */}
            <Card style={{ marginTop: '24px' }}>
              <h3 style={{ marginBottom: '24px' }}>Update Profile</h3>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  fullWidth
                />
                
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  helperText="Leave blank to keep current password"
                  fullWidth
                />
                
                <Button 
                  variant="primary" 
                  fullWidth
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('Form submitted');
                  }}
                >
                  Update Profile
                </Button>
              </form>
            </Card>
          </>
        )}
      </main>
      
      {/* Bottom Navigation */}
      <MainNav 
        activeTab={activeTab}
        onTabClick={handleTabChange}
      />
    </ThemeProvider>
  );
};