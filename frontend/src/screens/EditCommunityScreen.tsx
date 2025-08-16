import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { StatusBar } from '../components/StatusBar/StatusBar';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f5f5f5;
  max-width: 393px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: white;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #e5e5e5;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
`;

const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  flex: 1;
`;

const SaveButton = styled.button`
  background: #2fce98;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #1F4A3A;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 3px rgba(45, 95, 79, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 3px rgba(45, 95, 79, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
    box-shadow: 0 0 0 3px rgba(45, 95, 79, 0.1);
  }
`;

const ImageUpload = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ImagePreview = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #e5e5e5;
  cursor: pointer;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &:hover {
    border-color: #2fce98;
  }
`;

const UploadButton = styled.button`
  padding: 10px 16px;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  color: #333;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    border-color: #2fce98;
    color: #2fce98;
  }
`;

const AdminsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AdminCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
`;

const AdminAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2fce98, #4A90A4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
`;

const AdminInfo = styled.div`
  flex: 1;
`;

const AdminName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const AdminRole = styled.div`
  font-size: 11px;
  color: #666;
`;

const RemoveButton = styled.button`
  background: #ffe5e5;
  color: #ff4444;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #ff4444;
    color: white;
  }
`;

const AddAdminButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #e8f4f0;
  color: #2fce98;
  border: 2px dashed #2fce98;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
  
  &:hover {
    background: #d4e9e3;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
`;

const Tag = styled.div`
  background: #e8f4f0;
  color: #2fce98;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: #2fce98;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  margin-left: 4px;
  
  &:hover {
    color: #ff4444;
  }
`;

const ToggleSwitch = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const Switch = styled.div<{ $checked: boolean }>`
  width: 48px;
  height: 24px;
  background: ${({ $checked }) => $checked ? '#2fce98' : '#e5e5e5'};
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
  
  &:after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $checked }) => $checked ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
`;

const SettingRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingLabel = styled.div`
  flex: 1;
`;

const SettingTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const SettingDescription = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 2px;
`;

interface Admin {
  id: string;
  name: string;
  role: string;
  email: string;
}

export const EditCommunityScreen: React.FC = () => {
  const navigate = useNavigate();
  const { communityId } = useParams();
  
  const [communityData, setCommunityData] = useState({
    name: 'Tech Innovators KL',
    description: 'A community for tech enthusiasts in Kuala Lumpur',
    category: 'Technology',
    location: 'Kuala Lumpur, Malaysia',
    website: 'https://techinnovatorkl.com',
    email: 'contact@techinnovatorkl.com',
    whatsappLink: 'https://chat.whatsapp.com/abc123',
    tags: ['Technology', 'Innovation', 'Startup', 'AI', 'Web3'],
    isPublic: true,
    requireApproval: true,
    allowEvents: true,
    allowChat: true
  });
  
  const [admins, setAdmins] = useState<Admin[]>([
    { id: '1', name: 'John Doe', role: 'Founder', email: 'john@example.com' },
    { id: '2', name: 'Sarah Lee', role: 'Admin', email: 'sarah@example.com' },
    { id: '3', name: 'Mike Chen', role: 'Admin', email: 'mike@example.com' }
  ]);
  
  const [newTag, setNewTag] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddTag = () => {
    if (newTag && !communityData.tags.includes(newTag)) {
      setCommunityData({
        ...communityData,
        tags: [...communityData.tags, newTag]
      });
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setCommunityData({
      ...communityData,
      tags: communityData.tags.filter(t => t !== tag)
    });
  };
  
  const handleRemoveAdmin = (adminId: string) => {
    setAdmins(admins.filter(admin => admin.id !== adminId));
  };
  
  const handleAddAdmin = () => {
    const email = prompt('Enter admin email address:');
    if (email) {
      const newAdmin: Admin = {
        id: Date.now().toString(),
        name: 'New Admin',
        role: 'Admin',
        email
      };
      setAdmins([...admins, newAdmin]);
    }
  };
  
  const handleSave = () => {
    // Save community data
    alert('Community profile updated successfully!');
    navigate('/manage-events');
  };
  
  return (
    <Container>
      <StatusBar />
      
      <Header>
        <BackButton onClick={() => navigate('/manage-events')}>
          ←
        </BackButton>
        <HeaderTitle>Edit Community Profile</HeaderTitle>
        <SaveButton onClick={handleSave}>
          Save
        </SaveButton>
      </Header>
      
      <Content>
        <Section>
          <SectionTitle>
            📝 Basic Information
          </SectionTitle>
          
          <FormGroup>
            <Label>Community Logo</Label>
            <ImageUpload>
              <ImagePreview>
                {imagePreview ? (
                  <img src={imagePreview} alt="Community logo" />
                ) : (
                  <span style={{ fontSize: '24px', color: '#999' }}>📷</span>
                )}
              </ImagePreview>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="logo-upload"
                />
                <UploadButton as="label" htmlFor="logo-upload">
                  Upload Logo
                </UploadButton>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
                  Recommended: 200x200px
                </div>
              </div>
            </ImageUpload>
          </FormGroup>
          
          <FormGroup>
            <Label>Community Name *</Label>
            <Input
              type="text"
              value={communityData.name}
              onChange={(e) => setCommunityData({ ...communityData, name: e.target.value })}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Description *</Label>
            <TextArea
              value={communityData.description}
              onChange={(e) => setCommunityData({ ...communityData, description: e.target.value })}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Category *</Label>
            <Select
              value={communityData.category}
              onChange={(e) => setCommunityData({ ...communityData, category: e.target.value })}
            >
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Arts & Culture">Arts & Culture</option>
              <option value="Sports">Sports</option>
              <option value="Education">Education</option>
              <option value="Health & Wellness">Health & Wellness</option>
              <option value="Social Impact">Social Impact</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Location</Label>
            <Input
              type="text"
              value={communityData.location}
              onChange={(e) => setCommunityData({ ...communityData, location: e.target.value })}
              placeholder="City, Country"
            />
          </FormGroup>
        </Section>
        
        <Section>
          <SectionTitle>
            🏷️ Tags & Keywords
          </SectionTitle>
          
          <TagsContainer>
            {communityData.tags.map(tag => (
              <Tag key={tag}>
                {tag}
                <RemoveTagButton onClick={() => handleRemoveTag(tag)}>×</RemoveTagButton>
              </Tag>
            ))}
          </TagsContainer>
          
          <FormGroup>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <UploadButton onClick={handleAddTag}>Add</UploadButton>
            </div>
          </FormGroup>
        </Section>
        
        <Section>
          <SectionTitle>
            👥 Community Admins
          </SectionTitle>
          
          <AdminsList>
            {admins.map(admin => (
              <AdminCard key={admin.id}>
                <AdminAvatar>{admin.name.charAt(0)}</AdminAvatar>
                <AdminInfo>
                  <AdminName>{admin.name}</AdminName>
                  <AdminRole>{admin.role} • {admin.email}</AdminRole>
                </AdminInfo>
                {admin.role !== 'Founder' && (
                  <RemoveButton onClick={() => handleRemoveAdmin(admin.id)}>
                    Remove
                  </RemoveButton>
                )}
              </AdminCard>
            ))}
          </AdminsList>
          
          <AddAdminButton 
            onClick={handleAddAdmin}
            disabled={admins.length >= 5}
          >
            + Add Admin ({admins.length}/5)
          </AddAdminButton>
        </Section>
        
        <Section>
          <SectionTitle>
            🔗 Connections
          </SectionTitle>
          
          <FormGroup>
            <Label>Website</Label>
            <Input
              type="url"
              value={communityData.website}
              onChange={(e) => setCommunityData({ ...communityData, website: e.target.value })}
              placeholder="https://your-community.com"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Contact Email</Label>
            <Input
              type="email"
              value={communityData.email}
              onChange={(e) => setCommunityData({ ...communityData, email: e.target.value })}
              placeholder="contact@community.com"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>WhatsApp Group Link</Label>
            <Input
              type="url"
              value={communityData.whatsappLink}
              onChange={(e) => setCommunityData({ ...communityData, whatsappLink: e.target.value })}
              placeholder="https://chat.whatsapp.com/..."
            />
          </FormGroup>
        </Section>
        
        <Section>
          <SectionTitle>
            ⚙️ Community Settings
          </SectionTitle>
          
          <SettingRow>
            <SettingLabel>
              <SettingTitle>Public Community</SettingTitle>
              <SettingDescription>
                Anyone can discover and view this community
              </SettingDescription>
            </SettingLabel>
            <ToggleSwitch>
              <Switch 
                $checked={communityData.isPublic}
                onClick={() => setCommunityData({ ...communityData, isPublic: !communityData.isPublic })}
              />
            </ToggleSwitch>
          </SettingRow>
          
          <SettingRow>
            <SettingLabel>
              <SettingTitle>Require Approval</SettingTitle>
              <SettingDescription>
                New members need approval to join
              </SettingDescription>
            </SettingLabel>
            <ToggleSwitch>
              <Switch 
                $checked={communityData.requireApproval}
                onClick={() => setCommunityData({ ...communityData, requireApproval: !communityData.requireApproval })}
              />
            </ToggleSwitch>
          </SettingRow>
          
          <SettingRow>
            <SettingLabel>
              <SettingTitle>Allow Events</SettingTitle>
              <SettingDescription>
                Community can organize events
              </SettingDescription>
            </SettingLabel>
            <ToggleSwitch>
              <Switch 
                $checked={communityData.allowEvents}
                onClick={() => setCommunityData({ ...communityData, allowEvents: !communityData.allowEvents })}
              />
            </ToggleSwitch>
          </SettingRow>
          
          <SettingRow>
            <SettingLabel>
              <SettingTitle>Enable Chat Group</SettingTitle>
              <SettingDescription>
                Members can chat in community group
              </SettingDescription>
            </SettingLabel>
            <ToggleSwitch>
              <Switch 
                $checked={communityData.allowChat}
                onClick={() => setCommunityData({ ...communityData, allowChat: !communityData.allowChat })}
              />
            </ToggleSwitch>
          </SettingRow>
        </Section>
      </Content>
    </Container>
  );
};