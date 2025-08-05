import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// ================================
// STYLED COMPONENTS
// ================================

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: ${({ isOpen }) => isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 380px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: #333;
  }
`;

const ModalTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const ModalContent = styled.div`
  padding: 0 20px 20px 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  
  &:focus {
    outline: none;
    border-color: #2D5F4F;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const OptionsList = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const OptionItem = styled.label<{ isRadio?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const RadioInput = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #2D5F4F;
`;

const CheckboxInput = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #2D5F4F;
`;

const OptionLabel = styled.span`
  font-size: 14px;
  color: #333;
  flex: 1;
`;

const QuickOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 20px;
`;

const QuickOptionButton = styled.button<{ isActive: boolean }>`
  padding: 12px 16px;
  border: 1px solid ${({ isActive }) => isActive ? '#2D5F4F' : '#e0e0e0'};
  border-radius: 8px;
  background: ${({ isActive }) => isActive ? '#f0f8f5' : 'white'};
  color: ${({ isActive }) => isActive ? '#2D5F4F' : '#666'};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #2D5F4F;
    background-color: #f0f8f5;
  }
`;

const DateInputRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const DateInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #2D5F4F;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
`;

const ClearButton = styled.button`
  flex: 1;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  color: #666;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ApplyButton = styled.button`
  flex: 2;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #2D5F4F;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background: #1F4A3A;
  }
`;

const SelectedCount = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 16px;
`;

// ================================
// INTERFACES
// ================================

interface CountryFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: string;
  onApply: (country: string) => void;
}

interface CityFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: string;
  selectedCities: string[];
  onApply: (cities: string[]) => void;
}

interface DateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDateRange: string;
  customStartDate?: string;
  customEndDate?: string;
  onApply: (dateRange: string, startDate?: string, endDate?: string) => void;
}

// ================================
// DATA
// ================================

const COUNTRIES = [
  'Malaysia',
  'Turkey', 
  'Indonesia',
  'Morocco',
  'All Countries'
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'Malaysia': ['Kuala Lumpur', 'Damansara', 'Shah Alam', 'Subang Jaya', 'Ampang', 'Cheras', 'City Centre'],
  'Turkey': ['Istanbul', 'Bursa', 'Erzurum', 'Ankara', 'Izmir', 'Antalya'],
  'Indonesia': ['Jakarta', 'Bandung', 'Aceh', 'Surabaya', 'Yogyakarta', 'Medan', 'Bali'],
  'Morocco': ['Fez', 'Marrakech', 'Tangier', 'Rabat', 'Casablanca', 'Meknes']
};

const DATE_OPTIONS = [
  'Today',
  'This Week', 
  'This Month',
  'All Dates'
];

// ================================
// COUNTRY FILTER MODAL
// ================================

export const CountryFilterModal: React.FC<CountryFilterModalProps> = ({
  isOpen,
  onClose,
  selectedCountry,
  onApply
}) => {
  const [tempSelected, setTempSelected] = useState(selectedCountry);

  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedCountry);
    }
  }, [isOpen, selectedCountry]);

  const handleApply = () => {
    onApply(tempSelected);
    onClose();
  };

  const handleClear = () => {
    setTempSelected('All Countries');
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Select Country/Region</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ModalContent>
          <OptionsList>
            {COUNTRIES.map((country) => (
              <OptionItem key={country} isRadio>
                <RadioInput
                  type="radio"
                  name="country"
                  value={country}
                  checked={tempSelected === country}
                  onChange={(e) => setTempSelected(e.target.value)}
                />
                <OptionLabel>{country}</OptionLabel>
              </OptionItem>
            ))}
          </OptionsList>
          
          <ActionButtons>
            <ClearButton type="button" onClick={handleClear}>
              Clear All
            </ClearButton>
            <ApplyButton type="button" onClick={handleApply}>
              Apply Filters
            </ApplyButton>
          </ActionButtons>
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );
};

// ================================
// CITY FILTER MODAL
// ================================

export const CityFilterModal: React.FC<CityFilterModalProps> = ({
  isOpen,
  onClose,
  selectedCountry,
  selectedCities,
  onApply
}) => {
  const [tempSelected, setTempSelected] = useState<string[]>(selectedCities);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedCities);
      setSearchTerm('');
    }
  }, [isOpen, selectedCities]);

  const availableCities = selectedCountry === 'All Countries' 
    ? Object.values(CITIES_BY_COUNTRY).flat()
    : (CITIES_BY_COUNTRY[selectedCountry] || []);

  const allCitiesOptions = ['All Cities', ...availableCities];
  
  const filteredCities = allCitiesOptions.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCityToggle = (city: string) => {
    if (city === 'All Cities') {
      setTempSelected(tempSelected.includes('All Cities') ? [] : ['All Cities']);
    } else {
      const newSelected = tempSelected.includes(city)
        ? tempSelected.filter(c => c !== city && c !== 'All Cities')
        : [...tempSelected.filter(c => c !== 'All Cities'), city];
      setTempSelected(newSelected);
    }
  };

  const handleApply = () => {
    onApply(tempSelected);
    onClose();
  };

  const handleClear = () => {
    setTempSelected(['All Cities']);
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Select Cities</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ModalContent>
          <SearchInput
            type="text"
            placeholder="Search city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {tempSelected.length > 0 && (
            <SelectedCount>
              {tempSelected.length} {tempSelected.length === 1 ? 'city' : 'cities'} selected
            </SelectedCount>
          )}
          
          <OptionsList>
            {filteredCities.map((city) => (
              <OptionItem key={city}>
                <CheckboxInput
                  type="checkbox"
                  checked={tempSelected.includes(city)}
                  onChange={() => handleCityToggle(city)}
                />
                <OptionLabel>{city}</OptionLabel>
              </OptionItem>
            ))}
          </OptionsList>
          
          <ActionButtons>
            <ClearButton type="button" onClick={handleClear}>
              Clear All
            </ClearButton>
            <ApplyButton type="button" onClick={handleApply}>
              Apply Filters
            </ApplyButton>
          </ActionButtons>
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );
};

// ================================
// DATE FILTER MODAL
// ================================

export const DateFilterModal: React.FC<DateFilterModalProps> = ({
  isOpen,
  onClose,
  selectedDateRange,
  customStartDate,
  customEndDate,
  onApply
}) => {
  const [tempSelected, setTempSelected] = useState(selectedDateRange);
  const [startDate, setStartDate] = useState(customStartDate || '');
  const [endDate, setEndDate] = useState(customEndDate || '');

  useEffect(() => {
    if (isOpen) {
      setTempSelected(selectedDateRange);
      setStartDate(customStartDate || '');
      setEndDate(customEndDate || '');
    }
  }, [isOpen, selectedDateRange, customStartDate, customEndDate]);

  const handleQuickOption = (option: string) => {
    setTempSelected(option);
    if (option !== 'Custom Range') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleApply = () => {
    if (tempSelected === 'Custom Range' && startDate && endDate) {
      onApply('Custom Range', startDate, endDate);
    } else {
      onApply(tempSelected);
    }
    onClose();
  };

  const handleClear = () => {
    setTempSelected('All Dates');
    setStartDate('');
    setEndDate('');
  };

  const isCustomRange = tempSelected === 'Custom Range';
  const canApply = !isCustomRange || (startDate && endDate);

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Select Date Range</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ModalContent>
          <QuickOptionsGrid>
            {DATE_OPTIONS.map((option) => (
              <QuickOptionButton
                key={option}
                type="button"
                isActive={tempSelected === option}
                onClick={() => handleQuickOption(option)}
              >
                {option}
              </QuickOptionButton>
            ))}
            <QuickOptionButton
              type="button"
              isActive={tempSelected === 'Custom Range'}
              onClick={() => handleQuickOption('Custom Range')}
            >
              Custom Range
            </QuickOptionButton>
          </QuickOptionsGrid>
          
          {isCustomRange && (
            <DateInputRow>
              <DateInput
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
              />
              <DateInput
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
                min={startDate}
              />
            </DateInputRow>
          )}
          
          <ActionButtons>
            <ClearButton type="button" onClick={handleClear}>
              Clear All
            </ClearButton>
            <ApplyButton 
              type="button" 
              onClick={handleApply}
              disabled={!canApply}
              style={{ opacity: canApply ? 1 : 0.5 }}
            >
              Apply Filters
            </ApplyButton>
          </ActionButtons>
        </ModalContent>
      </Modal>
    </ModalOverlay>
  );
};