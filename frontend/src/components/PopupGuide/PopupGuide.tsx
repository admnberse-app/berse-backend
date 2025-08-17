import React from 'react';
import styled from 'styled-components';

const GuideContainer = styled.div`
  background: linear-gradient(135deg, #fff3e0, #ffecb3);
  border: 2px solid #ff9800;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
`;

const Title = styled.h3`
  color: #e65100;
  margin: 0 0 16px;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Step = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StepNumber = styled.div`
  background: #ff9800;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.h4`
  margin: 0 0 4px;
  font-size: 14px;
  color: #333;
`;

const StepDescription = styled.p`
  margin: 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
`;

const BrowserTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  border-top: 1px solid #ffcc80;
  padding-top: 16px;
`;

const BrowserTab = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${({ $active }) => $active ? '#ff9800' : '#e0e0e0'};
  background: ${({ $active }) => $active ? '#fff3e0' : 'white'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: ${({ $active }) => $active ? '600' : '400'};
  color: ${({ $active }) => $active ? '#e65100' : '#666'};
  transition: all 0.2s;
  
  &:hover {
    border-color: #ff9800;
    background: #fff3e0;
  }
`;

const BrowserInstructions = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: #333;
`;

const WarningBox = styled.div`
  background: #ffebee;
  border: 1px solid #ef5350;
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const WarningIcon = styled.span`
  color: #ef5350;
  font-size: 18px;
`;

const WarningText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #c62828;
  line-height: 1.4;
`;

interface PopupGuideProps {
  onClose?: () => void;
}

export const PopupGuide: React.FC<PopupGuideProps> = ({ onClose }) => {
  const [selectedBrowser, setSelectedBrowser] = React.useState<'chrome' | 'firefox' | 'safari' | 'edge'>('chrome');

  const browserInstructions = {
    chrome: {
      name: 'Chrome',
      steps: [
        'Click the popup blocked icon in the address bar (right side)',
        'Select "Always allow popups and redirects from localhost:5173"',
        'Click "Done" and refresh the page'
      ],
      settings: 'Settings → Privacy and security → Site settings → Popups and redirects → Add localhost:5173 to allowed sites'
    },
    edge: {
      name: 'Edge',
      steps: [
        'Click the popup blocked icon in the address bar (right side)',
        'Select "Always allow popups and redirects from localhost:5173"',
        'Click "Done" and refresh the page'
      ],
      settings: 'Settings → Cookies and site permissions → Popups and redirects → Add localhost:5173 to allow list'
    },
    firefox: {
      name: 'Firefox',
      steps: [
        'Click the shield/info icon in the address bar',
        'Click "Turn off Enhanced Tracking Protection for this site"',
        'Or go to Settings → Privacy → Permissions → Block pop-up windows → Exceptions'
      ],
      settings: 'Settings → Privacy & Security → Permissions → Block pop-up windows → Exceptions → Add localhost:5173'
    },
    safari: {
      name: 'Safari',
      steps: [
        'Go to Safari menu → Preferences',
        'Click "Websites" tab',
        'Select "Pop-up Windows" from the left sidebar',
        'Find localhost:5173 and change to "Allow"'
      ],
      settings: 'Safari → Preferences → Websites → Pop-up Windows → localhost:5173 → Allow'
    }
  };

  return (
    <GuideContainer>
      <Title>
        🚫 Popup Blocker Detected - Enable Popups to Connect Google Calendar
      </Title>
      
      <StepsContainer>
        <Step>
          <StepNumber>1</StepNumber>
          <StepContent>
            <StepTitle>Look for the Popup Blocked Icon</StepTitle>
            <StepDescription>
              Check your browser's address bar (usually on the right side) for a popup blocked icon
            </StepDescription>
          </StepContent>
        </Step>
        
        <Step>
          <StepNumber>2</StepNumber>
          <StepContent>
            <StepTitle>Allow Popups for This Site</StepTitle>
            <StepDescription>
              Click the icon and select "Always allow popups from localhost:5173"
            </StepDescription>
          </StepContent>
        </Step>
        
        <Step>
          <StepNumber>3</StepNumber>
          <StepContent>
            <StepTitle>Refresh and Try Again</StepTitle>
            <StepDescription>
              Refresh the page (F5 or Ctrl+R) and click "Connect Google Calendar" again
            </StepDescription>
          </StepContent>
        </Step>
      </StepsContainer>

      <BrowserTabs>
        <BrowserTab 
          $active={selectedBrowser === 'chrome'} 
          onClick={() => setSelectedBrowser('chrome')}
        >
          Chrome
        </BrowserTab>
        <BrowserTab 
          $active={selectedBrowser === 'edge'} 
          onClick={() => setSelectedBrowser('edge')}
        >
          Edge
        </BrowserTab>
        <BrowserTab 
          $active={selectedBrowser === 'firefox'} 
          onClick={() => setSelectedBrowser('firefox')}
        >
          Firefox
        </BrowserTab>
        <BrowserTab 
          $active={selectedBrowser === 'safari'} 
          onClick={() => setSelectedBrowser('safari')}
        >
          Safari
        </BrowserTab>
      </BrowserTabs>

      <BrowserInstructions>
        <strong>{browserInstructions[selectedBrowser].name} Instructions:</strong>
        <ol style={{ margin: '8px 0 0 20px', padding: 0 }}>
          {browserInstructions[selectedBrowser].steps.map((step, index) => (
            <li key={index} style={{ marginBottom: '4px' }}>{step}</li>
          ))}
        </ol>
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e0e0e0' }}>
          <strong>Manual Settings:</strong><br />
          {browserInstructions[selectedBrowser].settings}
        </div>
      </BrowserInstructions>

      <WarningBox>
        <WarningIcon>⚠️</WarningIcon>
        <div>
          <WarningText>
            <strong>Why do we need popups?</strong><br />
            Google requires a popup window for secure authentication. This is a one-time setup - once connected, you won't need to allow popups again.
          </WarningText>
        </div>
      </WarningBox>
      
      {onClose && (
        <button 
          onClick={onClose}
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            background: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            width: '100%'
          }}
        >
          Got it, I'll enable popups
        </button>
      )}
    </GuideContainer>
  );
};