import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { MainNav } from '../components/MainNav';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #F9F3E3;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #F5F3EF;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #333;
  font-size: 16px;
  cursor: pointer;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #2fce98;
`;

const CreateButton = styled.button<{ disabled?: boolean }>`
  background: ${({ disabled }) => disabled ? '#CCC' : '#2fce98'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
`;

const Content = styled.div`
  flex: 1;
  padding: 0 20px 100px 20px;
  overflow-y: auto;
`;

const FormSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #F8F9FA;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    background: white;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #F8F9FA;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    background: white;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background: #F8F9FA;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    background: white;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const CategoryOption = styled.div<{ selected: boolean }>`
  padding: 16px 12px;
  border: 2px solid ${({ selected }) => selected ? '#2fce98' : '#E5E5E5'};
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  background-color: ${({ selected }) => selected ? '#E8F4F0' : 'white'};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #2fce98;
  }
`;

const CategoryEmoji = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const CategoryName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #333;
`;

const CharacterCount = styled.div`
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 4px;
`;

const AdminCard = styled.div`
  background: #F8F9FA;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AdminInfo = styled.div`
  flex: 1;
`;

const AdminName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const AdminEmail = styled.div`
  font-size: 12px;
  color: #666;
`;

const AdminRole = styled.select`
  padding: 6px 12px;
  border: 1px solid #E5E5E5;
  border-radius: 6px;
  font-size: 12px;
  background: white;
`;

const RemoveButton = styled.button`
  background: #FFE5E5;
  color: #FF4444;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 11px;
  cursor: pointer;
  margin-left: 8px;
  
  &:hover {
    background: #FFD1D1;
  }
`;

const AddAdminButton = styled.button`
  width: 100%;
  background: #E8F4F0;
  color: #2fce98;
  border: 2px dashed #2fce98;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #D4E9E3;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AddAdminInput = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: #2fce98;
  }
`;

const VerificationInfo = styled.div`
  background: #FFF9E6;
  border: 1px solid #FFD700;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const VerificationTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const VerificationText = styled.div`
  font-size: 13px;
  color: #666;
  line-height: 1.5;
`;

export const CreateCommunityScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'social',
    location: '',
    website: '',
    instagram: '',
    facebook: '',
    telegram: '',
    whatsapp: '',
    requirements: [] as string[],
    tags: [] as string[],
    isPublic: true,
    allowMemberPosts: true,
    requireApproval: false,
    admins: [] as Array<{ email: string; name: string; role: string }>
  });

  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  const categories = [
    { id: 'social', name: 'Social', emoji: '👥' },
    { id: 'sports', name: 'Sports', emoji: '⚽' },
    { id: 'volunteer', name: 'Volunteer', emoji: '🤝' },
    { id: 'professional', name: 'Professional', emoji: '💼' },
    { id: 'hobby', name: 'Hobby', emoji: '🎨' },
    { id: 'cultural', name: 'Cultural', emoji: '🌍' },
    { id: 'educational', name: 'Educational', emoji: '📚' },
    { id: 'tech', name: 'Tech', emoji: '💻' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addAdmin = () => {
    if (newAdminEmail && formData.admins.length < 10) {
      // In production, verify the email exists in the system
      const newAdmin = {
        email: newAdminEmail,
        name: 'Pending User', // Would be fetched from API
        role: 'admin'
      };
      handleInputChange('admins', [...formData.admins, newAdmin]);
      setNewAdminEmail('');
      setShowAddAdmin(false);
    }
  };

  const removeAdmin = (index: number) => {
    handleInputChange('admins', formData.admins.filter((_, i) => i !== index));
  };

  const handleCreateCommunity = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.category) {
        alert('Please fill in all required fields');
        return;
      }

      // Create community object
      const newCommunity = {
        ...formData,
        id: Date.now().toString(),
        founderId: user?.id || 'current-user',
        founderName: user?.fullName || 'Current User',
        memberCount: 1,
        eventCount: 0,
        isVerified: false, // Needs admin approval
        createdAt: new Date().toISOString()
      };

      console.log('Creating community:', newCommunity);
      
      // Here you would make an API call to create the community
      // await communityService.createCommunity(newCommunity);

      alert('Community created! It will be reviewed for verification within 24-48 hours.');
      navigate('/communities');
    } catch (error) {
      console.error('Failed to create community:', error);
      alert('Failed to create community. Please try again.');
    }
  };

  const isFormValid = formData.name && formData.description && formData.category;

  return (
    <Container>
      <StatusBar />
      
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          ← Back
        </BackButton>
        <HeaderTitle>Create Community</HeaderTitle>
        <CreateButton disabled={!isFormValid} onClick={handleCreateCommunity}>
          Create
        </CreateButton>
      </Header>

      <Content>
        {/* Verification Info */}
        <VerificationInfo>
          <VerificationTitle>
            ✨ Community Verification
          </VerificationTitle>
          <VerificationText>
            After creating your community, it will be reviewed for verification. 
            Verified communities can:
            <ul style={{ margin: '8px 0 0 20px', paddingLeft: 0 }}>
              <li>Create and host events</li>
              <li>Appear in BerseMatch community profiles</li>
              <li>Get a verification badge</li>
              <li>Access advanced features</li>
            </ul>
          </VerificationText>
        </VerificationInfo>

        {/* Basic Information */}
        <FormSection>
          <SectionTitle>📝 Basic Information</SectionTitle>
          
          <FormGroup>
            <Label>Community Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter community name"
              maxLength={50}
            />
            <CharacterCount>{formData.name.length}/50</CharacterCount>
          </FormGroup>

          <FormGroup>
            <Label>Description *</Label>
            <TextArea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your community's purpose, activities, and values..."
              maxLength={500}
            />
            <CharacterCount>{formData.description.length}/500</CharacterCount>
          </FormGroup>

          <FormGroup>
            <Label>Category *</Label>
            <CategoryGrid>
              {categories.map((category) => (
                <CategoryOption
                  key={category.id}
                  selected={formData.category === category.id}
                  onClick={() => handleInputChange('category', category.id)}
                >
                  <CategoryEmoji>{category.emoji}</CategoryEmoji>
                  <CategoryName>{category.name}</CategoryName>
                </CategoryOption>
              ))}
            </CategoryGrid>
          </FormGroup>

          <FormGroup>
            <Label>Location</Label>
            <Input
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Kuala Lumpur, Malaysia"
            />
          </FormGroup>
        </FormSection>

        {/* Social Links */}
        <FormSection>
          <SectionTitle>🔗 Social Links</SectionTitle>
          
          <FormGroup>
            <Label>Website</Label>
            <Input
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://example.com"
              type="url"
            />
          </FormGroup>

          <FormGroup>
            <Label>Instagram</Label>
            <Input
              value={formData.instagram}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              placeholder="@username"
            />
          </FormGroup>

          <FormGroup>
            <Label>WhatsApp Group</Label>
            <Input
              value={formData.whatsapp}
              onChange={(e) => handleInputChange('whatsapp', e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Telegram Channel</Label>
            <Input
              value={formData.telegram}
              onChange={(e) => handleInputChange('telegram', e.target.value)}
              placeholder="https://t.me/..."
            />
          </FormGroup>
        </FormSection>

        {/* Community Admins */}
        <FormSection>
          <SectionTitle>👥 Community Admins</SectionTitle>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
            You can assign up to 10 admins who can manage the community and create events
          </p>
          
          {/* Current user as founder */}
          <AdminCard>
            <AdminInfo>
              <AdminName>{user?.fullName || 'You'}</AdminName>
              <AdminEmail>{user?.email}</AdminEmail>
            </AdminInfo>
            <div style={{ 
              background: '#2fce98', 
              color: 'white', 
              padding: '6px 12px', 
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              Founder
            </div>
          </AdminCard>
          
          {/* Added admins */}
          {formData.admins.map((admin, index) => (
            <AdminCard key={index}>
              <AdminInfo>
                <AdminName>{admin.name}</AdminName>
                <AdminEmail>{admin.email}</AdminEmail>
              </AdminInfo>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <AdminRole
                  value={admin.role}
                  onChange={(e) => {
                    const newAdmins = [...formData.admins];
                    newAdmins[index] = { ...newAdmins[index], role: e.target.value };
                    handleInputChange('admins', newAdmins);
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                </AdminRole>
                <RemoveButton onClick={() => removeAdmin(index)}>
                  Remove
                </RemoveButton>
              </div>
            </AdminCard>
          ))}
          
          {/* Add admin form */}
          {showAddAdmin && (
            <AddAdminInput>
              <Input
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="Enter admin email"
                type="email"
                style={{ flex: 1 }}
              />
              <button
                onClick={addAdmin}
                style={{
                  background: '#2fce98',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 16px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAddAdmin(false);
                  setNewAdminEmail('');
                }}
                style={{
                  background: '#F5F5F5',
                  color: '#666',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0 16px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </AddAdminInput>
          )}
          
          {!showAddAdmin && formData.admins.length < 10 && (
            <AddAdminButton onClick={() => setShowAddAdmin(true)}>
              + Add Admin ({formData.admins.length}/10)
            </AddAdminButton>
          )}
        </FormSection>

        {/* Community Settings */}
        <FormSection>
          <SectionTitle>⚙️ Community Settings</SectionTitle>
          
          <CheckboxGroup>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
              />
              Public community (anyone can join)
            </CheckboxLabel>
            
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={formData.allowMemberPosts}
                onChange={(e) => handleInputChange('allowMemberPosts', e.target.checked)}
              />
              Allow members to create posts
            </CheckboxLabel>
            
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={formData.requireApproval}
                onChange={(e) => handleInputChange('requireApproval', e.target.checked)}
              />
              Require approval for new members
            </CheckboxLabel>
          </CheckboxGroup>
        </FormSection>
      </Content>

      <MainNav 
        activeTab="connect"
        onTabPress={(tab) => {
          switch (tab) {
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
          }
        }}
      />
    </Container>
  );
};