export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  category: string;
  date: string;
  price?: number;
  discountedPrice?: number;
  hostName?: string;
  organizer?: {
    name: string;
  };
  pointsReward: number;
  participantCount: number;
  maxParticipants: number;
  included?: string[];
}

export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Morning Yoga & Meditation Session',
    description: 'Start your day with a rejuvenating yoga and meditation session. Perfect for all skill levels.',
    location: 'KLCC Park',
    city: 'Kuala Lumpur',
    category: 'kesihatan',
    date: '2025-01-10T07:00:00',
    price: 0,
    hostName: 'Wellness Malaysia',
    pointsReward: 50,
    participantCount: 12,
    maxParticipants: 20,
    included: ['Yoga mat provided', 'Complimentary herbal tea', 'Wellness guide']
  },
  {
    id: '2',
    title: 'Futsal Tournament 2025',
    description: 'Join our competitive futsal tournament with teams from across the city.',
    location: 'Sports Planet Ampang',
    city: 'Ampang',
    category: 'sukan',
    date: '2025-01-15T18:00:00',
    price: 25,
    discountedPrice: 20,
    hostName: 'KL Sports Club',
    organizer: {
      name: 'KL Sports Club'
    },
    pointsReward: 100,
    participantCount: 45,
    maxParticipants: 64,
    included: ['Tournament jersey', 'Refreshments', 'Trophy for winners']
  },
  {
    id: '3',
    title: 'Community Beach Cleanup',
    description: 'Help us keep our beaches clean! Join this meaningful community service event.',
    location: 'Port Dickson Beach',
    city: 'Port Dickson',
    category: 'komuniti',
    date: '2025-01-20T08:00:00',
    price: 0,
    hostName: 'Green Earth Malaysia',
    pointsReward: 75,
    participantCount: 28,
    maxParticipants: 50,
    included: ['Cleanup equipment', 'Lunch provided', 'Certificate of participation']
  },
  {
    id: '4',
    title: 'Entrepreneurship Workshop: Start Your Business',
    description: 'Learn the fundamentals of starting and running a successful business in Malaysia.',
    location: 'Co-working Space, Bangsar',
    city: 'Kuala Lumpur',
    category: 'pendidikan',
    date: '2025-01-25T10:00:00',
    price: 45,
    hostName: 'Business Hub KL',
    pointsReward: 80,
    participantCount: 15,
    maxParticipants: 30,
    included: ['Workshop materials', 'Networking lunch', 'Business starter guide']
  },
  {
    id: '5',
    title: 'Traditional Malaysian Cooking Class',
    description: 'Master the art of Malaysian cuisine with our experienced chef. Learn to cook 3 signature dishes.',
    location: 'Culinary Academy, Petaling Jaya',
    city: 'Petaling Jaya',
    category: 'kemahiran',
    date: '2025-01-28T14:00:00',
    price: 60,
    discountedPrice: 50,
    hostName: 'Chef Aminah',
    pointsReward: 90,
    participantCount: 8,
    maxParticipants: 12,
    included: ['All ingredients', 'Recipe booklet', 'Take home your dishes']
  },
  {
    id: '6',
    title: 'Photography Walk: Capture KL',
    description: 'Explore hidden gems of KL while improving your photography skills with professional guidance.',
    location: 'Central Market',
    city: 'Kuala Lumpur',
    category: 'hobi',
    date: '2025-02-01T16:00:00',
    price: 0,
    hostName: 'KL Photography Club',
    pointsReward: 60,
    participantCount: 18,
    maxParticipants: 25,
    included: ['Photography tips guide', 'Photo critique session', 'Best photo prize']
  },
  {
    id: '7',
    title: 'Badminton Coaching Clinic',
    description: 'Improve your badminton skills with former national players. All levels welcome!',
    location: 'Stadium Badminton Cheras',
    city: 'Cheras',
    category: 'sukan',
    date: '2025-02-05T19:00:00',
    price: 30,
    hostName: 'Badminton Pro Academy',
    organizer: {
      name: 'Badminton Pro Academy'
    },
    pointsReward: 85,
    participantCount: 20,
    maxParticipants: 24,
    included: ['Shuttlecocks provided', 'Professional coaching', 'Skills assessment']
  },
  {
    id: '8',
    title: 'Mental Health Awareness Talk',
    description: 'Join us for an important discussion on mental health awareness and coping strategies.',
    location: 'Community Hall, Subang Jaya',
    city: 'Subang Jaya',
    category: 'kesihatan',
    date: '2025-02-08T15:00:00',
    price: 0,
    hostName: 'Mind Matters Malaysia',
    pointsReward: 70,
    participantCount: 35,
    maxParticipants: 60,
    included: ['Mental health resources', 'Q&A with therapists', 'Support group info']
  }
];