import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { countries } from '../data/countries';
import { API_BASE_URL } from '../config/services.config';
import { makeAuthenticatedRequest } from '../utils/authUtils';

const Modal = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #E0E0E0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  color: #2fce98;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const FormField = styled.div`
  margin-bottom: 16px;
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
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #2fce98;
  }
`;

const SearchInput = styled(Input)`
  margin-bottom: 12px;
`;

const PeopleList = styled.div`
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  padding: 8px;
`;

const PersonItem = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  background: ${({ selected }) => selected ? '#E8FFF8' : 'transparent'};
  border: 1px solid ${({ selected }) => selected ? '#2fce98' : 'transparent'};
  margin-bottom: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: #F5F5F5;
  }
`;

const ProfileAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const ProfileLocation = styled.div`
  font-size: 12px;
  color: #666;
`;

const SelectedPeople = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const SelectedPerson = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #E8FFF8;
  border: 1px solid #2fce98;
  border-radius: 16px;
  font-size: 13px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
`;

const ModalFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #E0E0E0;
  display: flex;
  gap: 12px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${({ variant }) => variant === 'primary' ? `
    background: #2fce98;
    color: white;
    border: none;
    
    &:hover {
      background: #27b584;
    }
  ` : `
    background: white;
    color: #666;
    border: 1px solid #E0E0E0;
    
    &:hover {
      background: #F5F5F5;
    }
  `}
`;

interface TravelLogbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (entry: any) => void;
}

export const TravelLogbookModal: React.FC<TravelLogbookModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [country, setCountry] = useState('');
  const [cities, setCities] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search profiles from match database
  useEffect(() => {
    const searchProfiles = async () => {
      if (searchTerm.length < 2) {
        setProfiles([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await makeAuthenticatedRequest(
          'GET',
          `/api/v1/matching/search?query=${encodeURIComponent(searchTerm)}`
        );
        
        if (response.data.success) {
          setProfiles(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to search profiles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProfiles, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handlePersonToggle = (person: any) => {
    setSelectedPeople(prev => {
      const exists = prev.find(p => p.id === person.id);
      if (exists) {
        return prev.filter(p => p.id !== person.id);
      } else {
        return [...prev, person];
      }
    });
  };

  const handleRemovePerson = (personId: string) => {
    setSelectedPeople(prev => prev.filter(p => p.id !== personId));
  };

  const handleSubmit = () => {
    if (!country || !date) {
      alert('Please select a country and date');
      return;
    }

    const entry = {
      country,
      cities,
      date,
      notes,
      peopleMet: selectedPeople.map(p => ({
        id: p.id,
        name: p.fullName || p.username,
        profilePicture: p.profilePicture
      }))
    };

    onAdd(entry);
    
    // Reset form
    setCountry('');
    setCities('');
    setDate('');
    setNotes('');
    setSelectedPeople([]);
    setSearchTerm('');
    onClose();
  };

  const isPersonSelected = (person: any) => {
    return selectedPeople.some(p => p.id === person.id);
  };

  return (
    <Modal isOpen={isOpen}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>✈️ Add Travel Entry</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <FormField>
            <Label>Country *</Label>
            <Select 
              value={country} 
              onChange={(e) => setCountry(e.target.value)}
              required
            >
              <option value="">Select country</option>
              {countries.map(c => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </Select>
          </FormField>
          
          <FormField>
            <Label>Cities Visited</Label>
            <Input
              type="text"
              value={cities}
              onChange={(e) => setCities(e.target.value)}
              placeholder="e.g., Tokyo, Kyoto, Osaka"
            />
          </FormField>
          
          <FormField>
            <Label>Date *</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </FormField>
          
          <FormField>
            <Label>Travel Notes</Label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Brief notes about your trip"
            />
          </FormField>
          
          <FormField>
            <Label>People Met (from Berse community)</Label>
            <SearchInput
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name..."
            />
            
            {profiles.length > 0 && (
              <PeopleList>
                {profiles.map(person => (
                  <PersonItem
                    key={person.id}
                    selected={isPersonSelected(person)}
                    onClick={() => handlePersonToggle(person)}
                  >
                    <ProfileAvatar>
                      {person.profilePicture ? (
                        <img 
                          src={person.profilePicture} 
                          alt="" 
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        person.fullName?.charAt(0) || person.username?.charAt(0) || '?'
                      )}
                    </ProfileAvatar>
                    <ProfileInfo>
                      <ProfileName>{person.fullName || person.username}</ProfileName>
                      <ProfileLocation>{person.city || person.currentLocation || 'Location unknown'}</ProfileLocation>
                    </ProfileInfo>
                  </PersonItem>
                ))}
              </PeopleList>
            )}
            
            {selectedPeople.length > 0 && (
              <SelectedPeople>
                {selectedPeople.map(person => (
                  <SelectedPerson key={person.id}>
                    {person.fullName || person.username}
                    <RemoveButton onClick={() => handleRemovePerson(person.id)}>×</RemoveButton>
                  </SelectedPerson>
                ))}
              </SelectedPeople>
            )}
            
            {isLoading && (
              <div style={{ textAlign: 'center', padding: '12px', color: '#666' }}>
                Searching...
              </div>
            )}
          </FormField>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Add Entry
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};