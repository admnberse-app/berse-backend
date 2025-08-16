import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { profileCompletionService } from '../../services/profileCompletion.service';
import { pushNotificationService } from '../../services/pushNotification.service';

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin: 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid #f0f0f0;
  position: relative;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Percentage = styled.div<{ $color: string }>`
  font-size: 20px;
  font-weight: bold;
  color: ${({ $color }) => $color};
`;

const ProgressContainer = styled.div`
  background: #f5f5f5;
  border-radius: 12px;
  height: 12px;
  overflow: hidden;
  position: relative;
  margin-bottom: 20px;
`;

const ProgressBar = styled.div<{ $percentage: number; $color: string }>`
  background: ${({ $color }) => $color};
  height: 100%;
  width: ${({ $percentage }) => $percentage}%;
  border-radius: 12px;
  transition: width 0.5s ease, background 0.3s ease;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const MissingFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

const MissingFieldItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
    transform: translateX(4px);
  }
`;

const FieldIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const FieldInfo = styled.div`
  flex: 1;
`;

const FieldLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const FieldTip = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 2px;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #26b580;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(47, 206, 152, 0.3);
  }
`;

const NotificationPrompt = styled.div`
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NotificationToggle = styled.button`
  background: #ff9800;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #f57c00;
  }
`;

const Badges = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const Badge = styled.div<{ $earned: boolean }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  background: ${({ $earned }) => $earned ? '#e8f5e9' : '#f5f5f5'};
  color: ${({ $earned }) => $earned ? '#2e7d32' : '#999'};
  border: 1px solid ${({ $earned }) => $earned ? '#c8e6c9' : '#e0e0e0'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TipCard = styled.div`
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
  font-size: 12px;
  color: #1565c0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const getFieldIcon = (field: string): string => {
  const icons: { [key: string]: string } = {
    profilePicture: '📸',
    bio: '✍️',
    topInterests: '🎯',
    communities: '👥',
    linkedin: '💼',
    instagram: '📷',
    eventsAttended: '📅',
    languages: '🗣️',
    personalityType: '🧠',
    offerBerseGuide: '🗺️',
    phone: '📱',
    currentLocation: '📍',
    profession: '💼'
  };
  return icons[field] || '📝';
};

export const ProfileCompletionCard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [completionStatus, setCompletionStatus] = useState<any>(null);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (user) {
      checkCompletion();
      checkNotificationStatus();
    }
  }, [user]);

  const checkCompletion = () => {
    const status = profileCompletionService.checkProfileCompletion(user);
    setCompletionStatus(status);
    
    // Track profile view for reminders
    profileCompletionService.trackProfileView(user?.id || 'demo', status.percentage);
    
    // Schedule reminders if needed
    if (!status.isComplete) {
      profileCompletionService.scheduleProfileReminders(user?.id || 'demo', status);
    }
  };

  const checkNotificationStatus = () => {
    const permission = pushNotificationService.getPermissionStatus();
    setNotificationPermission(permission);
    
    // Show notification prompt if profile is less than 60% complete
    const status = profileCompletionService.checkProfileCompletion(user);
    if (status.percentage < 60 && permission === 'default') {
      setShowNotificationPrompt(true);
    }
  };

  const handleEnableNotifications = async () => {
    const subscription = await pushNotificationService.subscribeToPush();
    if (subscription) {
      setNotificationPermission('granted');
      setShowNotificationPrompt(false);
      
      // Send immediate notification
      await pushNotificationService.showTestNotification();
    }
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage < 30) return '#ff4444';
    if (percentage < 60) return '#ff9800';
    if (percentage < 80) return '#4caf50';
    return '#2fce98';
  };

  const getMilestones = () => {
    const milestones = [
      { threshold: 25, label: 'Starter', icon: '🌱' },
      { threshold: 50, label: 'Active', icon: '🌟' },
      { threshold: 75, label: 'Expert', icon: '💎' },
      { threshold: 100, label: 'Complete', icon: '🏆' }
    ];
    
    return milestones.map(m => ({
      ...m,
      earned: (completionStatus?.percentage || 0) >= m.threshold
    }));
  };

  if (!completionStatus || completionStatus.isComplete) {
    return null; // Don't show if profile is complete
  }

  const topMissingFields = completionStatus.missingFields.slice(0, 3);
  const progressColor = getProgressColor(completionStatus.percentage);

  return (
    <Card>
      <Header>
        <Title>
          <span>📊</span>
          Profile Completion
        </Title>
        <Percentage $color={progressColor}>
          {completionStatus.percentage}%
        </Percentage>
      </Header>

      <ProgressContainer>
        <ProgressBar 
          $percentage={completionStatus.percentage} 
          $color={progressColor}
        />
      </ProgressContainer>

      {completionStatus.percentage < 80 && (
        <>
          <MissingFieldsContainer>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
              Complete these to boost your profile:
            </div>
            {topMissingFields.map((field: any) => (
              <MissingFieldItem 
                key={field.field}
                onClick={() => navigate('/edit-profile')}
              >
                <FieldIcon>
                  {getFieldIcon(field.field)}
                </FieldIcon>
                <FieldInfo>
                  <FieldLabel>{field.label}</FieldLabel>
                  {field.required && (
                    <FieldTip>Required field • +{field.weight}% completion</FieldTip>
                  )}
                </FieldInfo>
                <div style={{ color: '#2fce98', fontSize: '18px' }}>→</div>
              </MissingFieldItem>
            ))}
          </MissingFieldsContainer>

          <ActionButton onClick={() => navigate('/edit-profile')}>
            Complete Profile Now
          </ActionButton>
        </>
      )}

      {showNotificationPrompt && notificationPermission === 'default' && (
        <NotificationPrompt>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#e65100' }}>
              🔔 Get Reminders
            </div>
            <div style={{ fontSize: '11px', color: '#bf360c', marginTop: '2px' }}>
              We'll remind you to complete your profile
            </div>
          </div>
          <NotificationToggle onClick={handleEnableNotifications}>
            Enable
          </NotificationToggle>
        </NotificationPrompt>
      )}

      <Badges>
        {getMilestones().map((milestone, index) => (
          <Badge key={index} $earned={milestone.earned}>
            <span>{milestone.icon}</span>
            <span>{milestone.label}</span>
          </Badge>
        ))}
      </Badges>

      {completionStatus.percentage < 50 && (
        <TipCard>
          <span>💡</span>
          <span>
            Profiles over 80% complete get 3x more connections and event invites!
          </span>
        </TipCard>
      )}
    </Card>
  );
};