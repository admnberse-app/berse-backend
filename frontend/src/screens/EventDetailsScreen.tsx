import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
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

const Header = styled.div<{ $bgGradient: string }>`
  position: relative;
  height: 250px;
  background: ${({ $bgGradient }) => $bgGradient};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80px;
`;

const HeaderOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 50%);
`;

const BackButton = styled.button`
  position: absolute;
  top: 50px;
  left: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  z-index: 10;
`;

const ShareButton = styled.button`
  position: absolute;
  top: 50px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  z-index: 10;
`;

const EventBadge = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #2D5F4F;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
`;

const EventReward = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #FF6B6B;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
`;

const Content = styled.div`
  flex: 1;
  background: white;
  border-radius: 24px 24px 0 0;
  margin-top: -24px;
  padding: 24px 20px 100px;
  position: relative;
  z-index: 5;
`;

const EventTitle = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
`;

const EventMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const HostInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HostAvatar = styled.div<{ $bgColor: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ $bgColor }) => $bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
`;

const HostName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const ParticipantCount = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
`;

const ParticipantAvatars = styled.div`
  display: flex;
`;

const ParticipantAvatar = styled.div<{ $bgColor: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ $bgColor }) => $bgColor};
  margin-left: -6px;
  border: 2px solid white;
  
  &:first-child {
    margin-left: 0;
  }
`;

const InfoSection = styled.div`
  margin-bottom: 24px;
`;

const InfoTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoCard = styled.div`
  background: #F8F9FA;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #E8F4F0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const InfoText = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
`;

const InfoValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
`;

const Description = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  margin: 0;
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

const Tag = styled.span`
  background: #E8F4F0;
  color: #2D5F4F;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
`;

const RequirementsList = styled.ul`
  margin: 0;
  padding-left: 20px;
  color: #666;
  font-size: 14px;
  
  li {
    margin-bottom: 8px;
  }
`;

const ActionButtons = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 393px;
  margin: 0 auto;
  background: white;
  padding: 20px;
  border-top: 1px solid #E5E5E5;
  display: flex;
  gap: 12px;
`;

const JoinButton = styled.button<{ joined?: boolean }>`
  flex: 1;
  background-color: ${({ joined }) => joined ? '#4CAF50' : '#2D5F4F'};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    background-color: ${({ joined }) => joined ? '#45A049' : '#1F4A3A'};
  }
`;

const SecondaryButton = styled.button`
  width: 56px;
  height: 56px;
  background: #F8F9FA;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  
  &:hover {
    background-color: #f0f0f0;
  }
`;

const ErrorMessage = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: #666;
  font-size: 16px;
  
  h3 {
    color: #333;
    margin-bottom: 8px;
  }
`;

// ================================
// EVENTS DATABASE
// ================================

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  address: string;
  type: string;
  category: string;
  emoji: string;
  hostName: string;
  hostInitials: string;
  participantCount: number;
  maxParticipants: number;
  pointsReward: number;
  price?: number;
  requirements: string[];
  tags: string[];
  bgGradient: string;
  hostAvatarColor: string;
  participantColors: string[];
}

const eventsDatabase: EventData[] = [
  // EXISTING EVENTS (8)
  {
    id: '1',
    title: 'BerseMinton',
    description: 'Professional badminton coaching session with equipment provided. Perfect for all skill levels - from beginners to intermediate players. Our experienced coaches will help improve your technique and provide a fun, supportive environment for learning.',
    date: '2025-05-18T08:00:00Z',
    endDate: '2025-05-18T10:00:00Z',
    location: 'Shah Alam Sports Complex',
    address: 'Kompleks Sukan Negeri Shah Alam, Seksyen 13, 40100 Shah Alam, Selangor',
    type: 'SPORTS',
    category: 'Sukan Squad',
    emoji: '🏸',
    hostName: 'Sukan Squad',
    hostInitials: 'SS',
    participantCount: 8,
    maxParticipants: 20,
    pointsReward: 4,
    price: 12,
    requirements: [
      'Bring sports attire and proper court shoes',
      'Rackets and shuttlecocks provided',
      'Suitable for beginners to intermediate level',
      'Age 16 and above'
    ],
    tags: ['Sports', 'Badminton', 'Coaching', 'Equipment Provided'],
    bgGradient: 'linear-gradient(45deg, #E8F4FF, #D1E7FF)',
    hostAvatarColor: '#2196F3',
    participantColors: ['#1976D2', '#1565C0', '#0D47A1']
  },
  {
    id: '2',
    title: 'Coffee & Cultural Exchange',
    description: 'Meet diverse Muslims and share cultural experiences over great coffee. This weekly gathering brings together people from different backgrounds to discuss culture, traditions, and build meaningful connections in a relaxed cafe setting.',
    date: '2025-05-20T19:00:00Z',
    endDate: '2025-05-20T21:00:00Z',
    location: 'KLCC Mesra Cafe',
    address: 'Level 3, Suria KLCC, Kuala Lumpur City Centre, 50088 Kuala Lumpur',
    type: 'SOCIAL',
    category: 'Social Events',
    emoji: '🤝',
    hostName: 'Ahmad Rahman',
    hostInitials: 'AR',
    participantCount: 15,
    maxParticipants: 25,
    pointsReward: 3,
    requirements: [
      'Bring a positive attitude and willingness to socialize',
      'Own food and drinks (not provided)',
      'Respectful behavior towards all participants',
      'RSVP required due to limited seating'
    ],
    tags: ['Social', 'Cultural', 'Networking', 'Weekly'],
    bgGradient: 'linear-gradient(45deg, #FFE8E8, #FFD1D1)',
    hostAvatarColor: '#FF6B6B',
    participantColors: ['#F44336', '#E91E63', '#9C27B0']
  },
  {
    id: '3',
    title: 'Monday Morning Coffee',
    description: 'Casual meetup for working professionals to start the week with meaningful connections. Join us for relaxed conversations over quality coffee before heading to work.',
    date: '2025-05-22T08:30:00Z',
    endDate: '2025-05-22T10:00:00Z',
    location: 'Damansara Heights',
    address: 'The Coffee Bean & Tea Leaf, Plaza Damansara, Damansara Heights, KL',
    type: 'CAFE_MEETUP',
    category: 'Cafe Meetups',
    emoji: '☕',
    hostName: 'Sarah Khalil',
    hostInitials: 'SK',
    participantCount: 6,
    maxParticipants: 12,
    pointsReward: 2,
    requirements: [
      'Own beverages and food',
      'Professional attire preferred',
      'Punctuality appreciated',
      'Networking mindset'
    ],
    tags: ['Cafe', 'Professional', 'Morning', 'Networking'],
    bgGradient: 'linear-gradient(45deg, #E8F4F0, #D4E9E3)',
    hostAvatarColor: '#D2B48C',
    participantColors: ['#8B4513', '#A0522D', '#CD853F']
  },
  {
    id: '4',
    title: 'Islamic Finance Workshop',
    description: 'Learn Sharia-compliant investment strategies and Islamic banking principles. Expert speakers will cover halal investment options, sukuk, and ethical business practices according to Islamic guidelines.',
    date: '2025-05-25T14:00:00Z',
    endDate: '2025-05-25T17:00:00Z',
    location: 'IIUM Gombak',
    address: 'International Islamic University Malaysia, Jalan Gombak, 53100 Kuala Lumpur',
    type: 'ILM_INITIATIVE',
    category: 'Ilm Initiative',
    emoji: '📚',
    hostName: 'Dr. Abdullah',
    hostInitials: 'DA',
    participantCount: 12,
    maxParticipants: 30,
    pointsReward: 5,
    price: 25,
    requirements: [
      'Basic understanding of finance helpful but not required',
      'Notepad and pen for taking notes',
      'Professional or smart casual attire',
      'Open mind for learning'
    ],
    tags: ['Islamic Finance', 'Education', 'Investment', 'Workshop'],
    bgGradient: 'linear-gradient(45deg, #FFF8E1, #FFECB3)',
    hostAvatarColor: '#FF9800',
    participantColors: ['#F57C00', '#E65100', '#BF360C']
  },
  {
    id: '5',
    title: 'Charity Fun Run',
    description: 'Support orphanages while staying fit in this meaningful charity run. All proceeds go directly to local orphanages. Join us for a morning of fitness, community spirit, and giving back.',
    date: '2025-05-28T06:00:00Z',
    endDate: '2025-05-28T09:00:00Z',
    location: 'Titiwangsa Park',
    address: 'Taman Tasik Titiwangsa, 53200 Kuala Lumpur, Federal Territory of Kuala Lumpur',
    type: 'DONATE',
    category: 'Donate',
    emoji: '🤲',
    hostName: 'Muslim Runners',
    hostInitials: 'MR',
    participantCount: 25,
    maxParticipants: 100,
    pointsReward: 4,
    price: 35,
    requirements: [
      'Running attire and comfortable shoes',
      'Bring water bottle',
      'Basic fitness level required',
      'Charitable spirit essential'
    ],
    tags: ['Charity', 'Running', 'Orphanage', 'Community'],
    bgGradient: 'linear-gradient(45deg, #FFF8E1, #FFECB3)',
    hostAvatarColor: '#F0E68C',
    participantColors: ['#DAA520', '#B8860B', '#9ACD32']
  },
  {
    id: '6',
    title: 'Cameron Highlands Trek',
    description: 'Mountain hiking with halal food stops and beautiful highland scenery. Experience the cool mountain air, tea plantations, and local attractions while enjoying fellowship with fellow Muslims.',
    date: '2025-06-02T05:00:00Z',
    endDate: '2025-06-02T18:00:00Z',
    location: 'Cameron Highlands',
    address: 'Cameron Highlands, 39000 Tanah Rata, Pahang',
    type: 'TRIPS',
    category: 'Trips',
    emoji: '✈️',
    hostName: 'Adventure Seekers',
    hostInitials: 'AS',
    participantCount: 8,
    maxParticipants: 15,
    pointsReward: 6,
    price: 85,
    requirements: [
      'Good physical fitness for hiking',
      'Hiking boots and appropriate clothing',
      'Valid IC for travel',
      'Transportation provided from KL'
    ],
    tags: ['Hiking', 'Mountains', 'Day Trip', 'Nature'],
    bgGradient: 'linear-gradient(45deg, #E8E8FF, #D1D1FF)',
    hostAvatarColor: '#90EE90',
    participantColors: ['#32CD32', '#228B22', '#006400']
  },
  {
    id: '7',
    title: 'Weekend Flea Market',
    description: 'Community marketplace for local businesses and entrepreneurs. Discover unique products, halal food, and support local Muslim businesses while enjoying a vibrant community atmosphere.',
    date: '2025-05-26T10:00:00Z',
    endDate: '2025-05-26T18:00:00Z',
    location: 'Shah Alam Mall',
    address: 'Shah Alam Mall, No. 7, Jalan Akuatik 13/64, Seksyen 13, 40100 Shah Alam, Selangor',
    type: 'COMMUNITIES',
    category: 'Communities',
    emoji: '🏘️',
    hostName: 'Local Vendors',
    hostInitials: 'LV',
    participantCount: 40,
    maxParticipants: 100,
    pointsReward: 2,
    requirements: [
      'Comfortable walking shoes',
      'Bring cash for purchases',
      'Supportive attitude for local businesses',
      'Family-friendly event'
    ],
    tags: ['Market', 'Local Business', 'Community', 'Shopping'],
    bgGradient: 'linear-gradient(45deg, #E8FFE8, #D1FFD1)',
    hostAvatarColor: '#DDA0DD',
    participantColors: ['#9370DB', '#8A2BE2', '#4B0082']
  },
  {
    id: '8',
    title: 'Teaching English',
    description: 'Help refugee children with English lessons in a supportive environment. Make a real difference in young lives while gaining teaching experience and building community connections.',
    date: '2025-05-24T15:00:00Z',
    endDate: '2025-05-24T17:00:00Z',
    location: 'Ampang Community Center',
    address: 'Pusat Komuniti Ampang, Jalan Ampang Hilir, 55000 Kuala Lumpur',
    type: 'VOLUNTEER',
    category: 'Volunteer',
    emoji: '🌱',
    hostName: 'Volunteer Network',
    hostInitials: 'VN',
    participantCount: 5,
    maxParticipants: 10,
    pointsReward: 4,
    requirements: [
      'Basic English proficiency required',
      'Patience with children',
      'Teaching materials provided',
      'Background check may be required'
    ],
    tags: ['Volunteer', 'Education', 'Children', 'Community Service'],
    bgGradient: 'linear-gradient(45deg, #F0F8E8, #E1F4D1)',
    hostAvatarColor: '#98FB98',
    participantColors: ['#90EE90', '#32CD32', '#228B22']
  },

  // CAFE MEETUP EVENTS (3)
  {
    id: '9',
    title: 'Wednesday Coffee Talks at Suria KLCC',
    description: 'Midweek coffee discussions and networking in the heart of KL. Join professionals and students for stimulating conversations over quality coffee in a premium setting.',
    date: '2025-05-08T10:00:00Z',
    endDate: '2025-05-08T12:00:00Z',
    location: 'Suria KLCC',
    address: 'Suria KLCC Shopping Centre, Kuala Lumpur City Centre, 50088 Kuala Lumpur',
    type: 'CAFE_MEETUP',
    category: 'Cafe Meetups',
    emoji: '☕',
    hostName: 'Nora Fatimah',
    hostInitials: 'NF',
    participantCount: 6,
    maxParticipants: 15,
    pointsReward: 3,
    requirements: [
      'Own beverages and snacks',
      'Professional or smart casual attire',
      'Respectful discussion etiquette',
      'Punctuality appreciated'
    ],
    tags: ['Cafe', 'Midweek', 'Professional', 'KLCC'],
    bgGradient: 'linear-gradient(45deg, #E8F4F0, #D4E9E3)',
    hostAvatarColor: '#D2B48C',
    participantColors: ['#8B4513', '#A0522D', '#CD853F']
  },
  {
    id: '10',
    title: 'Friday Morning Brew at The Grind Damansara',
    description: 'Start your Friday with great coffee and conversation at this popular local coffee house. Perfect for ending the work week on a positive note with like-minded individuals.',
    date: '2025-05-10T08:30:00Z',
    endDate: '2025-05-10T10:30:00Z',
    location: 'The Grind Damansara',
    address: 'The Grind Coffee House, Jalan Damansara, 60000 Kuala Lumpur',
    type: 'CAFE_MEETUP',
    category: 'Cafe Meetups',
    emoji: '☕',
    hostName: 'Rahman Hafiz',
    hostInitials: 'RH',
    participantCount: 14,
    maxParticipants: 20,
    pointsReward: 4,
    requirements: [
      'Own food and beverages',
      'Casual to smart casual attire',
      'Friendly and open attitude',
      'RSVP recommended'
    ],
    tags: ['Cafe', 'Friday', 'Local', 'Relaxed'],
    bgGradient: 'linear-gradient(45deg, #E8F4F0, #D4E9E3)',
    hostAvatarColor: '#D2B48C',
    participantColors: ['#8B4513', '#A0522D', '#CD853F']
  },
  {
    id: '11',
    title: 'Sunday Chill at Common Man Coffee Roasters',
    description: 'Relaxed Sunday afternoon coffee meetup at one of PJ\'s most popular coffee spots. Unwind from the week with good coffee and great company in a cozy atmosphere.',
    date: '2025-05-12T15:00:00Z',
    endDate: '2025-05-12T17:00:00Z',
    location: 'Petaling Jaya',
    address: 'Common Man Coffee Roasters, SS15, 47500 Subang Jaya, Selangor',
    type: 'CAFE_MEETUP',
    category: 'Cafe Meetups',
    emoji: '☕',
    hostName: 'Laila Maisarah',
    hostInitials: 'LM',
    participantCount: 8,
    maxParticipants: 12,
    pointsReward: 3,
    requirements: [
      'Own beverages and food',
      'Relaxed Sunday attire',
      'Positive and friendly demeanor',
      'Respect for cafe environment'
    ],
    tags: ['Cafe', 'Sunday', 'Relaxed', 'PJ'],
    bgGradient: 'linear-gradient(45deg, #E8F4F0, #D4E9E3)',
    hostAvatarColor: '#D2B48C',
    participantColors: ['#8B4513', '#A0522D', '#CD853F']
  },

  // SOCIAL EVENTS (4)
  {
    id: '12',
    title: 'BerseMuka Cultural Night',
    description: 'Celebrate diverse Malaysian Muslim cultures with traditional performances, cultural displays, and authentic cuisine. Experience the rich tapestry of Malaysia\'s Muslim heritage.',
    date: '2025-05-14T19:00:00Z',
    endDate: '2025-05-14T22:00:00Z',
    location: 'Dewan Komuniti Shah Alam',
    address: 'Dewan Komuniti Seksyen 7, Shah Alam, 40000 Shah Alam, Selangor',
    type: 'SOCIAL',
    category: 'Social Events',
    emoji: '🎭',
    hostName: 'Zara Aminah',
    hostInitials: 'ZA',
    participantCount: 20,
    maxParticipants: 50,
    pointsReward: 5,
    requirements: [
      'Traditional or formal attire encouraged',
      'Respectful behavior during performances',
      'Cultural sensitivity appreciated',
      'Family-friendly event'
    ],
    tags: ['Cultural', 'Traditional', 'Performance', 'Heritage'],
    bgGradient: 'linear-gradient(45deg, #FFE8E8, #FFD1D1)',
    hostAvatarColor: '#FF6B6B',
    participantColors: ['#F44336', '#E91E63', '#9C27B0']
  },
  {
    id: '13',
    title: 'Board Games & Chill Evening',
    description: 'Fun board games night with fellow Muslims in a relaxed mall setting. Bring your competitive spirit and make new friends over classic and modern board games.',
    date: '2025-05-16T18:00:00Z',
    endDate: '2025-05-16T21:00:00Z',
    location: 'Mid Valley Megamall',
    address: 'Mid Valley Megamall, Lingkaran Syed Putra, 59200 Kuala Lumpur',
    type: 'SOCIAL',
    category: 'Social Events',
    emoji: '🎮',
    hostName: 'Farid Ikmal',
    hostInitials: 'FI',
    participantCount: 12,
    maxParticipants: 16,
    pointsReward: 4,
    requirements: [
      'Casual attire',
      'Enthusiasm for games',
      'Good sportsmanship',
      'Own dinner if desired'
    ],
    tags: ['Games', 'Social', 'Evening', 'Indoor'],
    bgGradient: 'linear-gradient(45deg, #FFE8E8, #FFD1D1)',
    hostAvatarColor: '#9C27B0',
    participantColors: ['#673AB7', '#3F51B5', '#2196F3']
  },
  {
    id: '14',
    title: 'BerseMakan Food Adventure Bukit Bintang',
    description: 'Explore halal food gems in Bukit Bintang with fellow food enthusiasts. Discover hidden culinary treasures and experience KL\'s vibrant halal food scene.',
    date: '2025-05-19T13:00:00Z',
    endDate: '2025-05-19T17:00:00Z',
    location: 'Bukit Bintang KL',
    address: 'Bukit Bintang, 55100 Kuala Lumpur, Federal Territory of Kuala Lumpur',
    type: 'SOCIAL',
    category: 'Social Events',
    emoji: '🍽️',
    hostName: 'Halim Syafiq',
    hostInitials: 'HS',
    participantCount: 18,
    maxParticipants: 25,
    pointsReward: 6,
    requirements: [
      'Comfortable walking shoes',
      'Appetite for adventure',
      'Budget for food tasting',
      'Camera for food photos'
    ],
    tags: ['Food', 'Adventure', 'Halal', 'Bukit Bintang'],
    bgGradient: 'linear-gradient(45deg, #FFE8E8, #FFD1D1)',
    hostAvatarColor: '#FF9800',
    participantColors: ['#F57C00', '#E65100', '#BF360C']
  },
  {
    id: '15',
    title: 'Art Jamming Session at Publika',
    description: 'Creative art session for Muslim artists and art enthusiasts. Express yourself through painting while connecting with the creative community in KL\'s cultural hub.',
    date: '2025-05-21T14:30:00Z',
    endDate: '2025-05-21T17:30:00Z',
    location: 'Publika Mont Kiara',
    address: 'Publika Shopping Gallery, 1, Jalan Dutamas 1, 50480 Kuala Lumpur',
    type: 'SOCIAL',
    category: 'Social Events',
    emoji: '🎨',
    hostName: 'Aina Sofia',
    hostInitials: 'AS',
    participantCount: 11,
    maxParticipants: 15,
    pointsReward: 5,
    requirements: [
      'No art experience necessary',
      'Comfortable clothes (may get messy)',
      'Creative and open mindset',
      'Art materials provided'
    ],
    tags: ['Art', 'Creative', 'Painting', 'Expression'],
    bgGradient: 'linear-gradient(45deg, #FFE8E8, #FFD1D1)',
    hostAvatarColor: '#F44336',
    participantColors: ['#E91E63', '#9C27B0', '#673AB7']
  },

  // TRIP EVENTS (3)
  {
    id: '16',
    title: 'Highland Adventure to Cameron Highlands',
    description: '3-day mountain adventure with halal accommodations, tea plantation visits, and hiking trails. Experience Malaysia\'s premier hill station with fellow Muslim travelers.',
    date: '2025-05-24T07:00:00Z',
    endDate: '2025-05-26T19:00:00Z',
    location: 'Cameron Highlands Pahang',
    address: 'Cameron Highlands, 39000 Tanah Rata, Pahang',
    type: 'TRIPS',
    category: 'Trips',
    emoji: '🏔️',
    hostName: 'Azlan Ibrahim',
    hostInitials: 'AI',
    participantCount: 8,
    maxParticipants: 12,
    pointsReward: 10,
    price: 150,
    requirements: [
      'Valid IC for travel registration',
      'Appropriate clothing for cool weather',
      'Good physical condition for hiking',
      'Halal accommodation included'
    ],
    tags: ['Mountain', '3-Day Trip', 'Hiking', 'Tea Plantation'],
    bgGradient: 'linear-gradient(45deg, #E8E8FF, #D1D1FF)',
    hostAvatarColor: '#2196F3',
    participantColors: ['#1976D2', '#1565C0', '#0D47A1']
  },
  {
    id: '17',
    title: 'Beach Getaway to Langkawi Island',
    description: '3-day tropical island retreat with pristine beaches, duty-free shopping, and Islamic heritage sites. Relax and rejuvenate in one of Malaysia\'s most beautiful destinations.',
    date: '2025-06-01T08:00:00Z',
    endDate: '2025-06-03T20:00:00Z',
    location: 'Langkawi Kedah',
    address: 'Langkawi Island, 07000 Langkawi, Kedah',
    type: 'TRIPS',
    category: 'Trips',
    emoji: '🏖️',
    hostName: 'Mira Rania',
    hostInitials: 'MR',
    participantCount: 15,
    maxParticipants: 20,
    pointsReward: 12,
    price: 280,
    requirements: [
      'Valid IC or passport',
      'Swimwear (modest options available)',
      'Sunscreen and beach essentials',
      'Flight and accommodation included'
    ],
    tags: ['Beach', 'Island', '3-Day Trip', 'Relaxation'],
    bgGradient: 'linear-gradient(45deg, #E8E8FF, #D1D1FF)',
    hostAvatarColor: '#00BCD4',
    participantColors: ['#0097A7', '#00838F', '#006064']
  },
  {
    id: '18',
    title: 'Cultural Heritage Trip to Terengganu',
    description: '2-day Islamic heritage and culture exploration in Malaysia\'s cultural heartland. Visit mosques, traditional crafts centers, and experience authentic Malay culture.',
    date: '2025-06-08T07:00:00Z',
    endDate: '2025-06-09T20:00:00Z',
    location: 'Kuala Terengganu',
    address: 'Kuala Terengganu, 20000 Kuala Terengganu, Terengganu',
    type: 'TRIPS',
    category: 'Trips',
    emoji: '🕌',
    hostName: 'Hasan Nabil',
    hostInitials: 'HN',
    participantCount: 10,
    maxParticipants: 15,
    pointsReward: 7,
    price: 120,
    requirements: [
      'Respectful attire for mosque visits',
      'Valid IC for travel',
      'Interest in Islamic culture',
      'Basic Malay language helpful'
    ],
    tags: ['Heritage', 'Islamic Culture', '2-Day Trip', 'Traditional'],
    bgGradient: 'linear-gradient(45deg, #E8E8FF, #D1D1FF)',
    hostAvatarColor: '#DAA520',
    participantColors: ['#B8860B', '#CD853F', '#DEB887']
  },

  // LOCAL GUIDE EVENTS (3) - Using Communities category
  {
    id: '19',
    title: 'Historical Walk in Georgetown Penang',
    description: 'Guided tour of Islamic heritage sites in UNESCO World Heritage Georgetown. Explore historic mosques, traditional architecture, and learn about Penang\'s Muslim community.',
    date: '2025-05-25T09:00:00Z',
    endDate: '2025-05-25T13:00:00Z',
    location: 'Georgetown Penang',
    address: 'George Town, 10200 George Town, Pulau Pinang',
    type: 'COMMUNITIES',
    category: 'Communities',
    emoji: '🏛️',
    hostName: 'Khairul Anuar',
    hostInitials: 'KA',
    participantCount: 7,
    maxParticipants: 12,
    pointsReward: 4,
    requirements: [
      'Comfortable walking shoes',
      'Hat and sunscreen for outdoor walking',
      'Respectful attire for mosque visits',
      'Interest in history and culture'
    ],
    tags: ['Heritage', 'Walking Tour', 'Georgetown', 'History'],
    bgGradient: 'linear-gradient(45deg, #E8FFE8, #D1FFD1)',
    hostAvatarColor: '#4CAF50',
    participantColors: ['#388E3C', '#2E7D32', '#1B5E20']
  },
  {
    id: '20',
    title: 'Rice Field Tour in Sekinchan',
    description: 'Early morning rice field exploration in Malaysia\'s rice bowl. Learn about traditional farming, enjoy scenic paddy views, and experience rural Malaysian life.',
    date: '2025-05-28T07:00:00Z',
    endDate: '2025-05-28T12:00:00Z',
    location: 'Sekinchan Selangor',
    address: 'Sekinchan, 45400 Sekinchan, Selangor',
    type: 'COMMUNITIES',
    category: 'Communities',
    emoji: '🌾',
    hostName: 'Salmah Fadzil',
    hostInitials: 'SF',
    participantCount: 12,
    maxParticipants: 18,
    pointsReward: 6,
    requirements: [
      'Early morning departure from KL',
      'Comfortable outdoor clothing',
      'Insect repellent recommended',
      'Camera for scenic photography'
    ],
    tags: ['Agriculture', 'Rural', 'Nature', 'Photography'],
    bgGradient: 'linear-gradient(45deg, #E8FFE8, #D1FFD1)',
    hostAvatarColor: '#9ACD32',
    participantColors: ['#8FBC8F', '#90EE90', '#98FB98']
  },
  {
    id: '21',
    title: 'Mangrove & Eagle Watching in Kuala Selangor',
    description: 'Nature tour with wildlife observation in Kuala Selangor Nature Park. Experience Malaysia\'s biodiversity with eagle feeding and mangrove boat tour.',
    date: '2025-05-30T16:00:00Z',
    endDate: '2025-05-30T20:00:00Z',
    location: 'Kuala Selangor Nature Park',
    address: 'Kuala Selangor Nature Park, 45000 Kuala Selangor, Selangor',
    type: 'COMMUNITIES',
    category: 'Communities',
    emoji: '🦅',
    hostName: 'Rafiq Zainal',
    hostInitials: 'RZ',
    participantCount: 5,
    maxParticipants: 10,
    pointsReward: 5,
    requirements: [
      'Binoculars provided for bird watching',
      'Comfortable boat-friendly attire',
      'Insect repellent essential',
      'Respect for wildlife and nature'
    ],
    tags: ['Wildlife', 'Nature', 'Boat Tour', 'Photography'],
    bgGradient: 'linear-gradient(45deg, #E8FFE8, #D1FFD1)',
    hostAvatarColor: '#228B22',
    participantColors: ['#32CD32', '#90EE90', '#98FB98']
  },

  // SPORTS EVENTS (3)
  {
    id: '22',
    title: 'BerseBola Sunday Football League',
    description: 'Weekly football matches for Muslim players of all skill levels. Join the community league for fitness, fun, and fellowship on the beautiful Shah Alam pitches.',
    date: '2025-05-26T18:00:00Z',
    endDate: '2025-05-26T20:00:00Z',
    location: 'Padang Astaka Shah Alam',
    address: 'Padang Astaka, Persiaran Perbandaran, 40000 Shah Alam, Selangor',
    type: 'SPORTS',
    category: 'Sukan Squad',
    emoji: '⚽',
    hostName: 'Danial Hakim',
    hostInitials: 'DH',
    participantCount: 16,
    maxParticipants: 22,
    pointsReward: 5,
    requirements: [
      'Football boots and sports attire',
      'Good physical fitness',
      'Team spirit and sportsmanship',
      'Water bottle and towel'
    ],
    tags: ['Football', 'Weekly', 'League', 'Team Sport'],
    bgGradient: 'linear-gradient(45deg, #E8F4FF, #D1E7FF)',
    hostAvatarColor: '#2196F3',
    participantColors: ['#1976D2', '#1565C0', '#0D47A1']
  },
  {
    id: '23',
    title: 'Morning Jog at KLCC Park',
    description: 'Healthy morning jog with the community around the iconic KLCC Park. Start your day with exercise, fresh air, and motivating company in the heart of KL.',
    date: '2025-05-27T06:30:00Z',
    endDate: '2025-05-27T08:00:00Z',
    location: 'KLCC Park Kuala Lumpur',
    address: 'KLCC Park, Kuala Lumpur City Centre, 50088 Kuala Lumpur',
    type: 'SPORTS',
    category: 'Sukan Squad',
    emoji: '🏃‍♂️',
    hostName: 'Lina Azira',
    hostInitials: 'LA',
    participantCount: 9,
    maxParticipants: 15,
    pointsReward: 4,
    requirements: [
      'Running shoes and comfortable attire',
      'Basic fitness level',
      'Water bottle for hydration',
      'Punctuality for group start'
    ],
    tags: ['Running', 'Morning', 'KLCC', 'Fitness'],
    bgGradient: 'linear-gradient(45deg, #E8F4FF, #D1E7FF)',
    hostAvatarColor: '#00BCD4',
    participantColors: ['#0097A7', '#00838F', '#006064']
  },
  {
    id: '24',
    title: 'Swimming Session at National Aquatic Centre',
    description: 'Professional swimming training session at Malaysia\'s premier aquatic facility. Improve your technique with qualified instructors in Olympic-standard pools.',
    date: '2025-05-29T19:00:00Z',
    endDate: '2025-05-29T21:00:00Z',
    location: 'Bukit Jalil National Stadium',
    address: 'Bukit Jalil National Stadium, Bukit Jalil, 57000 Kuala Lumpur',
    type: 'SPORTS',
    category: 'Sukan Squad',
    emoji: '🏊‍♀️',
    hostName: 'Irfan Musa',
    hostInitials: 'IM',
    participantCount: 11,
    maxParticipants: 16,
    pointsReward: 6,
    price: 15,
    requirements: [
      'Modest swimwear (full coverage options available)',
      'Swimming cap and goggles',
      'Basic swimming ability',
      'Towel and change of clothes'
    ],
    tags: ['Swimming', 'Training', 'Professional', 'Olympic Pool'],
    bgGradient: 'linear-gradient(45deg, #E8F4FF, #D1E7FF)',
    hostAvatarColor: '#4682B4',
    participantColors: ['#5F9EA0', '#4682B4', '#483D8B']
  },

  // VOLUNTEER EVENTS (3)
  {
    id: '25',
    title: 'Volunteer at Rumah Kasih Orphanage',
    description: 'Help and spend time with orphaned children in a loving environment. Make a meaningful difference through play, education support, and showing these children they are cared for.',
    date: '2025-05-31T09:00:00Z',
    endDate: '2025-05-31T15:00:00Z',
    location: 'Ampang Selangor',
    address: 'Rumah Kasih Orphanage, Jalan Ampang Hilir, 68000 Ampang, Selangor',
    type: 'VOLUNTEER',
    category: 'Volunteer',
    emoji: '🏠',
    hostName: 'Rumah Kasih',
    hostInitials: 'RK',
    participantCount: 13,
    maxParticipants: 20,
    pointsReward: 8,
    requirements: [
      'Background check required',
      'Patient and caring personality',
      'Comfortable with children',
      'Commitment to full day'
    ],
    tags: ['Children', 'Orphanage', 'Care', 'Long-term Impact'],
    bgGradient: 'linear-gradient(45deg, #F0F8E8, #E1F4D1)',
    hostAvatarColor: '#4CAF50',
    participantColors: ['#81C784', '#66BB6A', '#4CAF50']
  },
  {
    id: '26',
    title: 'Elderly Care Visit Program',
    description: 'Visit and care for elderly residents at local old folks home. Provide companionship, assistance, and show respect for our elders through meaningful interactions.',
    date: '2025-06-02T10:00:00Z',
    endDate: '2025-06-02T14:00:00Z',
    location: 'Cheras Old Folks Home',
    address: 'Cheras Old Folks Home, Jalan Cheras, 56000 Cheras, Kuala Lumpur',
    type: 'VOLUNTEER',
    category: 'Volunteer',
    emoji: '🧓',
    hostName: 'Nurul Hidayah',
    hostInitials: 'NH',
    participantCount: 8,
    maxParticipants: 12,
    pointsReward: 7,
    requirements: [
      'Respectful and patient demeanor',
      'Comfortable conversing with elderly',
      'Basic health screening may be required',
      'Willingness to assist with daily activities'
    ],
    tags: ['Elderly', 'Companionship', 'Respect', 'Care'],
    bgGradient: 'linear-gradient(45deg, #F0F8E8, #E1F4D1)',
    hostAvatarColor: '#9CCC65',
    participantColors: ['#AED581', '#9CCC65', '#8BC34A']
  },
  {
    id: '27',
    title: 'Food Distribution Drive for Asnaf',
    description: 'Distribute meals to those in need as part of Islamic charity obligations. Help prepare and distribute food packages to underprivileged families in the community.',
    date: '2025-06-05T08:00:00Z',
    endDate: '2025-06-05T12:00:00Z',
    location: 'Masjid Jamek KL',
    address: 'Masjid Jamek, Jalan Tun Perak, 50050 Kuala Lumpur',
    type: 'VOLUNTEER',
    category: 'Volunteer',
    emoji: '🍱',
    hostName: 'Zakat Melaka',
    hostInitials: 'ZM',
    participantCount: 15,
    maxParticipants: 25,
    pointsReward: 6,
    requirements: [
      'Physical ability to carry food packages',
      'Respectful interaction with recipients',
      'Understanding of Islamic charity principles',
      'Willingness to work as team'
    ],
    tags: ['Food Distribution', 'Charity', 'Asnaf', 'Community Service'],
    bgGradient: 'linear-gradient(45deg, #F0F8E8, #E1F4D1)',
    hostAvatarColor: '#689F38',
    participantColors: ['#7CB342', '#689F38', '#558B2F']
  },

  // ILM INITIATIVE EVENTS (4)
  {
    id: '28',
    title: 'Ramadan Preparation Workshop',
    description: 'Prepare spiritually and practically for the holy month of Ramadan. Learn about fasting, spiritual reflection, and how to maximize the benefits of this blessed month.',
    date: '2025-06-07T20:00:00Z',
    endDate: '2025-06-07T22:00:00Z',
    location: 'Masjid Wilayah KL',
    address: 'Masjid Wilayah Persekutuan, Jalan Duta, 50480 Kuala Lumpur',
    type: 'ILM_INITIATIVE',
    category: 'Ilm Initiative',
    emoji: '🌙',
    hostName: 'Ustaz Ahmad',
    hostInitials: 'UA',
    participantCount: 25,
    maxParticipants: 40,
    pointsReward: 6,
    requirements: [
      'Respectful mosque attire',
      'Notepad for taking notes',
      'Open heart for learning',
      'Punctuality for evening session'
    ],
    tags: ['Ramadan', 'Spiritual', 'Preparation', 'Islamic Learning'],
    bgGradient: 'linear-gradient(45deg, #FFF8E1, #FFECB3)',
    hostAvatarColor: '#FFB74D',
    participantColors: ['#FFCC02', '#FFB300', '#FF8F00']
  },
  {
    id: '29',
    title: 'Islamic Finance & Business Ethics',
    description: 'Learn halal business practices and finance principles according to Islamic law. Understand ethical business conduct and Sharia-compliant investment strategies.',
    date: '2025-06-09T14:00:00Z',
    endDate: '2025-06-09T17:00:00Z',
    location: 'IIUM Gombak',
    address: 'International Islamic University Malaysia, Jalan Gombak, 53100 Kuala Lumpur',
    type: 'ILM_INITIATIVE',
    category: 'Ilm Initiative',
    emoji: '💼',
    hostName: 'Faizal Husni',
    hostInitials: 'FH',
    participantCount: 18,
    maxParticipants: 30,
    pointsReward: 5,
    requirements: [
      'Basic understanding of business helpful',
      'Professional or smart casual attire',
      'Notebook and pen for notes',
      'Interest in Islamic finance'
    ],
    tags: ['Business', 'Finance', 'Ethics', 'Professional Development'],
    bgGradient: 'linear-gradient(45deg, #FFF8E1, #FFECB3)',
    hostAvatarColor: '#FF9800',
    participantColors: ['#F57C00', '#E65100', '#BF360C']
  },
  {
    id: '30',
    title: 'Family Life in Islam Workshop',
    description: 'Building strong Muslim families based on Islamic principles. Learn about marriage, parenting, and maintaining harmony in family relationships according to Islamic teachings.',
    date: '2025-06-12T10:00:00Z',
    endDate: '2025-06-12T13:00:00Z',
    location: 'Masjid Negara KL',
    address: 'Masjid Negara, Jalan Perdana, 50480 Kuala Lumpur',
    type: 'ILM_INITIATIVE',
    category: 'Ilm Initiative',
    emoji: '👨‍👩‍👧‍👦',
    hostName: 'Khadijah Sarah',
    hostInitials: 'KS',
    participantCount: 22,
    maxParticipants: 35,
    pointsReward: 7,
    requirements: [
      'Appropriate mosque attire',
      'Married couples and singles welcome',
      'Respectful discussion participation',
      'Notepad for key learnings'
    ],
    tags: ['Family', 'Marriage', 'Parenting', 'Islamic Values'],
    bgGradient: 'linear-gradient(45deg, #FFF8E1, #FFECB3)',
    hostAvatarColor: '#DEB887',
    participantColors: ['#D2B48C', '#BC9A6A', '#A0522D']
  },
  {
    id: '31',
    title: 'Quran Recitation & Tajweed Class',
    description: 'Improve your Quran recitation skills with proper Tajweed pronunciation. Learn beautiful recitation techniques and deepen your connection with the Holy Quran.',
    date: '2025-06-14T20:30:00Z',
    endDate: '2025-06-14T22:00:00Z',
    location: 'Masjid Al-Hidayah Shah Alam',
    address: 'Masjid Al-Hidayah, Seksyen 14, 40000 Shah Alam, Selangor',
    type: 'ILM_INITIATIVE',
    category: 'Ilm Initiative',
    emoji: '📖',
    hostName: 'Mohd Hafiz',
    hostInitials: 'MH',
    participantCount: 14,
    maxParticipants: 20,
    pointsReward: 4,
    requirements: [
      'Bring your own Quran or Mushaf',
      'Basic Arabic reading ability helpful',
      'Respectful mosque attire',
      'Commitment to practice'
    ],
    tags: ['Quran', 'Tajweed', 'Recitation', 'Islamic Studies'],
    bgGradient: 'linear-gradient(45deg, #FFF8E1, #FFECB3)',
    hostAvatarColor: '#D4AF37',
    participantColors: ['#DAA520', '#B8860B', '#9ACD32']
  }
];

export const EventDetailsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const loadEventDetails = async () => {
    try {
      setIsLoading(true);
      setNotFound(false);
      
      // Find event in database
      const foundEvent = eventsDatabase.find(e => e.id === eventId);
      
      if (foundEvent) {
        setEvent(foundEvent);
        
        // Check if user has already joined this event
        const joinedEvents = JSON.parse(localStorage.getItem('joined_events') || '[]');
        setIsJoined(joinedEvents.includes(eventId));
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Failed to load event details:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinEvent = () => {
    if (!event) return;
    
    const joinedEvents = JSON.parse(localStorage.getItem('joined_events') || '[]');
    
    if (isJoined) {
      // Leave event
      const updatedEvents = joinedEvents.filter((id: string) => id !== event.id);
      localStorage.setItem('joined_events', JSON.stringify(updatedEvents));
      setIsJoined(false);
    } else {
      // Join event
      const updatedEvents = [...joinedEvents, event.id];
      localStorage.setItem('joined_events', JSON.stringify(updatedEvents));
      setIsJoined(true);
      
      // Store joined event in history
      const existingHistory = JSON.parse(localStorage.getItem('event_history') || '[]');
      const newHistoryEntry = {
        id: event.id,
        type: 'joined_event',
        title: event.title,
        date: event.date,
        location: event.location,
        hostName: event.hostName,
        joinedAt: new Date().toISOString()
      };
      existingHistory.push(newHistoryEntry);
      localStorage.setItem('event_history', JSON.stringify(existingHistory));
    }
  };

  const handleShareEvent = () => {
    if (navigator.share && event) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      }).catch(() => {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        alert('Event link copied to clipboard!');
      });
    } else if (event) {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-MY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <Container>
        <StatusBar />
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Loading event details...
        </div>
      </Container>
    );
  }

  if (notFound || !event) {
    return (
      <Container>
        <StatusBar />
        <ErrorMessage>
          <h3>Event Not Found</h3>
          <p>The event you're looking for doesn't exist or may have been removed.</p>
          <button 
            onClick={() => navigate('/connect')}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#2D5F4F',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Back to Events
          </button>
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <StatusBar />
      
      <Header $bgGradient={event.bgGradient}>
        <HeaderOverlay />
        <EventBadge>{event.category}</EventBadge>
        <EventReward>{event.pointsReward} pts reward</EventReward>
        <BackButton onClick={() => navigate(-1)}>
          ←
        </BackButton>
        <ShareButton onClick={handleShareEvent}>
          🔗
        </ShareButton>
        <div style={{ fontSize: '80px' }}>{event.emoji}</div>
      </Header>

      <Content>
        <EventTitle>{event.title}</EventTitle>
        
        <EventMeta>
          <HostInfo>
            <HostAvatar $bgColor={event.hostAvatarColor}>{event.hostInitials}</HostAvatar>
            <HostName>by {event.hostName}</HostName>
          </HostInfo>
          <ParticipantCount>
            <ParticipantAvatars>
              {event.participantColors.map((color, index) => (
                <ParticipantAvatar key={index} $bgColor={color} />
              ))}
            </ParticipantAvatars>
            {event.participantCount}/{event.maxParticipants} joined
          </ParticipantCount>
        </EventMeta>

        <InfoSection>
          <InfoTitle>📅 Event Details</InfoTitle>
          <InfoCard>
            <InfoRow>
              <InfoIcon>📅</InfoIcon>
              <InfoText>
                <InfoLabel>Date</InfoLabel>
                <InfoValue>{formatDate(event.date)}</InfoValue>
              </InfoText>
            </InfoRow>
            <InfoRow>
              <InfoIcon>⏰</InfoIcon>
              <InfoText>
                <InfoLabel>Time</InfoLabel>
                <InfoValue>{formatTime(event.date)} - {formatTime(event.endDate)}</InfoValue>
              </InfoText>
            </InfoRow>
            <InfoRow>
              <InfoIcon>📍</InfoIcon>
              <InfoText>
                <InfoLabel>Location</InfoLabel>
                <InfoValue>{event.location}</InfoValue>
              </InfoText>
            </InfoRow>
            <InfoRow>
              <InfoIcon>🏢</InfoIcon>
              <InfoText>
                <InfoLabel>Address</InfoLabel>
                <InfoValue>{event.address}</InfoValue>
              </InfoText>
            </InfoRow>
            {event.price && (
              <InfoRow>
                <InfoIcon>💰</InfoIcon>
                <InfoText>
                  <InfoLabel>Price</InfoLabel>
                  <InfoValue>RM {event.price}</InfoValue>
                </InfoText>
              </InfoRow>
            )}
          </InfoCard>
        </InfoSection>

        <InfoSection>
          <InfoTitle>📝 About This Event</InfoTitle>
          <Description>{event.description}</Description>
          <TagsList>
            {event.tags.map((tag: string, index: number) => (
              <Tag key={index}>{tag}</Tag>
            ))}
          </TagsList>
        </InfoSection>

        <InfoSection>
          <InfoTitle>✅ What to Expect</InfoTitle>
          <RequirementsList>
            {event.requirements.map((requirement: string, index: number) => (
              <li key={index}>{requirement}</li>
            ))}
          </RequirementsList>
        </InfoSection>
      </Content>

      <ActionButtons>
        <JoinButton joined={isJoined} onClick={handleJoinEvent}>
          {isJoined ? '✓ Joined' : 'Join Event'}
        </JoinButton>
        <SecondaryButton onClick={() => navigate('/chat/' + event.id)}>
          💬
        </SecondaryButton>
        <SecondaryButton onClick={handleShareEvent}>
          🔗
        </SecondaryButton>
      </ActionButtons>
      
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