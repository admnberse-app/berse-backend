import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { makeAuthenticatedRequest } from '../utils/authUtils';

const Container = styled.div`
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 12px;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const CommunitiesList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  background: white;
`;

const CommunityItem = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #F0F0F0;
  cursor: pointer;
  transition: all 0.2s;
  background: ${({ selected }) => selected ? '#E8FFF8' : 'white'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${({ selected }) => selected ? '#E8FFF8' : '#F8F8F8'};
  }
`;

const CommunityInfo = styled.div`
  flex: 1;
`;

const CommunityName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const CommunityDescription = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

const MemberCount = styled.div`
  font-size: 12px;
  color: #999;
  margin-left: 12px;
`;

const SelectedCommunities = styled.div`
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const SelectedCommunity = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #E8FFF8;
  border: 1px solid #2fce98;
  border-radius: 16px;
  font-size: 13px;
  color: #333;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  font-size: 16px;
`;

const StatusBadge = styled.span<{ status: string }>`
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 8px;
  background: ${({ status }) => {
    switch(status) {
      case 'approved': return '#E8FFF8';
      case 'pending': return '#FFF4E6';
      case 'available': return '#F0F0F0';
      default: return '#F0F0F0';
    }
  }};
  color: ${({ status }) => {
    switch(status) {
      case 'approved': return '#2fce98';
      case 'pending': return '#F59E0B';
      case 'available': return '#666';
      default: return '#666';
    }
  }};
`;

interface Community {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  status: 'available' | 'pending' | 'approved';
}

interface SearchableCommunitiesProps {
  selectedCommunities: Community[];
  onChange: (communities: Community[]) => void;
}

export const SearchableCommunities: React.FC<SearchableCommunitiesProps> = ({
  selectedCommunities,
  onChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load all communities initially
  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    setIsLoading(true);
    try {
      const response = await makeAuthenticatedRequest(
        'GET',
        '/api/v1/communities'
      );
      
      if (response.data.success) {
        // Mock data for now - replace with actual API response
        const mockCommunities: Community[] = [
          {
            id: '1',
            name: "Ahl 'Umran Network",
            description: 'Global network of Muslim professionals and students',
            memberCount: 1250,
            status: 'available'
          },
          {
            id: '2',
            name: 'PeaceMeal MY',
            description: 'Community kitchen initiative for the underprivileged',
            memberCount: 450,
            status: 'available'
          },
          {
            id: '3',
            name: 'Tech Innovators KL',
            description: 'Tech enthusiasts and startup founders in Kuala Lumpur',
            memberCount: 890,
            status: 'available'
          },
          {
            id: '4',
            name: 'Arts & Culture Collective',
            description: 'Creative community for artists and cultural enthusiasts',
            memberCount: 320,
            status: 'available'
          },
          {
            id: '5',
            name: 'Environmental Warriors',
            description: 'Sustainability and environmental conservation group',
            memberCount: 560,
            status: 'available'
          },
          {
            id: '6',
            name: 'Youth Leadership Forum',
            description: 'Platform for young leaders and changemakers',
            memberCount: 780,
            status: 'available'
          }
        ];
        
        setCommunities(mockCommunities);
      }
    } catch (error) {
      console.error('Failed to load communities:', error);
      // Use mock data on error for demo
      setCommunities([
        {
          id: '1',
          name: "Ahl 'Umran Network",
          description: 'Global network of Muslim professionals and students',
          memberCount: 1250,
          status: 'available'
        },
        {
          id: '2',
          name: 'PeaceMeal MY',
          description: 'Community kitchen initiative for the underprivileged',
          memberCount: 450,
          status: 'available'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCommunity = (community: Community) => {
    const exists = selectedCommunities.find(c => c.id === community.id);
    
    if (exists) {
      onChange(selectedCommunities.filter(c => c.id !== community.id));
    } else {
      onChange([...selectedCommunities, { ...community, status: 'pending' }]);
    }
  };

  const handleRemoveCommunity = (communityId: string) => {
    onChange(selectedCommunities.filter(c => c.id !== communityId));
  };

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isCommunitySelected = (community: Community) => {
    return selectedCommunities.some(c => c.id === community.id);
  };

  return (
    <Container>
      <SearchInput
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search communities..."
      />
      
      <CommunitiesList>
        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Loading communities...
          </div>
        ) : filteredCommunities.length > 0 ? (
          filteredCommunities.map(community => (
            <CommunityItem
              key={community.id}
              selected={isCommunitySelected(community)}
              onClick={() => handleToggleCommunity(community)}
            >
              <CommunityInfo>
                <CommunityName>
                  {community.name}
                  {isCommunitySelected(community) && (
                    <StatusBadge status={
                      selectedCommunities.find(c => c.id === community.id)?.status || 'pending'
                    }>
                      {selectedCommunities.find(c => c.id === community.id)?.status || 'pending'}
                    </StatusBadge>
                  )}
                </CommunityName>
                <CommunityDescription>{community.description}</CommunityDescription>
              </CommunityInfo>
              <MemberCount>{community.memberCount} members</MemberCount>
            </CommunityItem>
          ))
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            No communities found
          </div>
        )}
      </CommunitiesList>
      
      {selectedCommunities.length > 0 && (
        <SelectedCommunities>
          {selectedCommunities.map(community => (
            <SelectedCommunity key={community.id}>
              {community.name}
              <StatusBadge status={community.status}>
                {community.status}
              </StatusBadge>
              <RemoveButton onClick={(e) => {
                e.stopPropagation();
                handleRemoveCommunity(community.id);
              }}>
                ×
              </RemoveButton>
            </SelectedCommunity>
          ))}
        </SelectedCommunities>
      )}
    </Container>
  );
};